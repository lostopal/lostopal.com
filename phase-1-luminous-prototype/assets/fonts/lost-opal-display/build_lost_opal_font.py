from __future__ import annotations

import math
import os
import sys
from collections import defaultdict, deque
from pathlib import Path

DEPS = Path(os.environ.get("LOCALAPPDATA", "")) / "Codex" / "font-build-deps"
if DEPS.exists():
    sys.path.insert(0, str(DEPS))

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables._g_l_y_f import Glyph


ROOT = Path(__file__).resolve().parent
SOURCES = ROOT / "sources"
OUTPUT = ROOT / "LostOpalDisplay-Regular.ttf"
PROOF = ROOT / "LostOpalDisplay-proof.png"
DEBUG = ROOT / "glyph-contact-sheet.png"

UPM = 1000
ASCENT = 820
DESCENT = -220
CAP_HEIGHT = 720
X_HEIGHT = 515
SIDE_BEARING = 46


def glyph_name_for_char(ch: str) -> str:
    names = {
        " ": "space", "!": "exclam", '"': "quotedbl", "#": "numbersign",
        "$": "dollar", "%": "percent", "&": "ampersand", "'": "quotesingle",
        "(": "parenleft", ")": "parenright", "*": "asterisk", "+": "plus",
        ",": "comma", "-": "hyphen", ".": "period", "/": "slash",
        ":": "colon", ";": "semicolon", "<": "less", "=": "equal",
        ">": "greater", "?": "question", "@": "at", "[": "bracketleft",
        "\\": "backslash", "]": "bracketright", "^": "asciicircum",
        "_": "underscore", "`": "grave", "{": "braceleft", "|": "bar",
        "}": "braceright", "~": "asciitilde", "¡": "exclamdown",
        "¿": "questiondown", "¢": "cent", "£": "sterling", "€": "Euro",
        "¥": "yen", "§": "section", "¶": "paragraph", "©": "copyright",
        "®": "registered", "™": "trademark", "°": "degree", "•": "bullet",
        "…": "ellipsis", "–": "endash", "—": "emdash", "‘": "quoteleft",
        "’": "quoteright", "“": "quotedblleft", "”": "quotedblright",
        "†": "dagger", "‡": "daggerdbl", "ﬁ": "fi", "ﬂ": "fl",
        "Æ": "AE", "æ": "ae", "Œ": "OE", "œ": "oe", "Ø": "Oslash",
        "ø": "oslash", "Ð": "Eth", "ð": "eth", "Þ": "Thorn",
        "þ": "thorn", "ß": "germandbls", "Ł": "Lslash", "ł": "lslash",
        "ƒ": "florin", "µ": "mu", "×": "multiply", "÷": "divide",
        "±": "plusminus", "¬": "logicalnot", "¤": "currency",
    }
    if ch in names:
        return names[ch]
    cp = ord(ch)
    if "A" <= ch <= "Z":
        return ch
    if "a" <= ch <= "z":
        return ch
    if "0" <= ch <= "9":
        return ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][int(ch)]
    return f"uni{cp:04X}"


def clean_mask(image: Image.Image, threshold: int = 92, min_area: int = 26) -> np.ndarray:
    gray = image.convert("L").filter(ImageFilter.GaussianBlur(0.55))
    mask_img = gray.point(lambda value: 255 if value >= threshold else 0)
    mask_img = mask_img.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    mask = np.asarray(mask_img, dtype=np.uint8) > 0
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    keep = np.zeros_like(mask, dtype=bool)
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or seen[y, x]:
                continue
            queue = deque([(x, y)])
            seen[y, x] = True
            component: list[tuple[int, int]] = []
            while queue:
                px, py = queue.popleft()
                component.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < w and 0 <= ny < h and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        queue.append((nx, ny))
            if len(component) >= min_area:
                for px, py in component:
                    keep[py, px] = True
    return keep


def trim_mask(mask: np.ndarray) -> np.ndarray:
    ys, xs = np.where(mask)
    if not len(xs):
        raise ValueError("Glyph cell contains no artwork")
    return mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def boundary_contours(mask: np.ndarray) -> list[list[tuple[int, int]]]:
    h, w = mask.shape
    edges: set[tuple[tuple[int, int], tuple[int, int]]] = set()
    for y in range(h):
        for x in range(w):
            if not mask[y, x]:
                continue
            if y == 0 or not mask[y - 1, x]:
                edges.add(((x, y), (x + 1, y)))
            if x == w - 1 or not mask[y, x + 1]:
                edges.add(((x + 1, y), (x + 1, y + 1)))
            if y == h - 1 or not mask[y + 1, x]:
                edges.add(((x + 1, y + 1), (x, y + 1)))
            if x == 0 or not mask[y, x - 1]:
                edges.add(((x, y + 1), (x, y)))

    outgoing: dict[tuple[int, int], list[tuple[int, int]]] = defaultdict(list)
    for start, end in edges:
        outgoing[start].append(end)

    direction_index = {(1, 0): 0, (0, 1): 1, (-1, 0): 2, (0, -1): 3}
    contours: list[list[tuple[int, int]]] = []
    unused = set(edges)
    while unused:
        first = next(iter(unused))
        start, current = first
        unused.remove(first)
        loop = [start, current]
        previous = start
        guard = 0
        while current != start and guard < len(edges) + 8:
            guard += 1
            candidates = [candidate for candidate in outgoing[current] if (current, candidate) in unused]
            if not candidates:
                break
            incoming = (current[0] - previous[0], current[1] - previous[1])
            incoming_index = direction_index[incoming]

            def turn_priority(candidate: tuple[int, int]) -> tuple[int, int, int]:
                outgoing_direction = (candidate[0] - current[0], candidate[1] - current[1])
                outgoing_index = direction_index[outgoing_direction]
                delta = (outgoing_index - incoming_index) % 4
                preference = {1: 0, 0: 1, 3: 2, 2: 3}[delta]
                return preference, candidate[1], candidate[0]

            nxt = min(candidates, key=turn_priority)
            unused.remove((current, nxt))
            previous, current = current, nxt
            loop.append(current)
        if len(loop) >= 4 and loop[-1] == start:
            loop = loop[:-1]
            simplified: list[tuple[int, int]] = []
            for point in loop:
                simplified.append(point)
                while len(simplified) >= 3:
                    a, b, c = simplified[-3:]
                    if (b[0] - a[0]) * (c[1] - b[1]) == (b[1] - a[1]) * (c[0] - b[0]):
                        simplified.pop(-2)
                    else:
                        break
            if len(simplified) >= 3:
                contours.append(simplified)
    return contours


def glyph_from_mask(mask: np.ndarray, target_height: int, bottom: int = 0, fixed_scale: float | None = None) -> tuple[Glyph, int, np.ndarray]:
    mask = trim_mask(mask)
    h, w = mask.shape
    scale = fixed_scale if fixed_scale is not None else target_height / max(h, 1)
    contours = boundary_contours(mask)
    pen = TTGlyphPen(None)
    for contour in contours:
        converted = [(SIDE_BEARING + x * scale, bottom + (h - y) * scale) for x, y in contour]
        converted.reverse()
        pen.moveTo((round(converted[0][0]), round(converted[0][1])))
        for x, y in converted[1:]:
            pen.lineTo((round(x), round(y)))
        pen.closePath()
    advance = max(180, round(w * scale + SIDE_BEARING * 2))
    return pen.glyph(), advance, mask


def empty_glyph() -> Glyph:
    return TTGlyphPen(None).glyph()


def rectangle_glyph(x0: int, y0: int, x1: int, y1: int, advance: int) -> tuple[Glyph, int]:
    pen = TTGlyphPen(None)
    pen.moveTo((x0, y0))
    pen.lineTo((x0, y1))
    pen.lineTo((x1, y1))
    pen.lineTo((x1, y0))
    pen.closePath()
    return pen.glyph(), advance


def component_glyph(
    glyph_set: dict[str, Glyph],
    components: list[tuple[str, tuple[float, float, float, float, float, float]]],
) -> Glyph:
    pen = TTGlyphPen(glyph_set)
    for name, transform in components:
        pen.addComponent(name, transform)
    return pen.glyph()


def image_cell(image: Image.Image, x0: float, x1: float, y0: int, y1: int, preserve_row: bool = False) -> np.ndarray:
    crop = image.crop((round(x0), y0, round(x1), y1))
    mask = clean_mask(crop)
    if not preserve_row:
        return trim_mask(mask)
    xs = np.where(mask)[1]
    if not len(xs):
        raise ValueError("Symbol cell contains no artwork")
    return mask[:, xs.min():xs.max() + 1]


def evenly_spaced_cells(start: float, end: float, count: int) -> list[tuple[float, float]]:
    centers = np.linspace(start, end, count)
    boundaries = [centers[0] - (centers[1] - centers[0]) / 2]
    boundaries += [(centers[i] + centers[i + 1]) / 2 for i in range(count - 1)]
    boundaries += [centers[-1] + (centers[-1] - centers[-2]) / 2]
    return list(zip(boundaries[:-1], boundaries[1:]))


def detected_glyph_boxes(image: Image.Image, band: tuple[int, int], expected: int) -> list[tuple[int, int]]:
    """Find the actual horizontal extent of each glyph in a specimen row."""
    row = image.crop((0, band[0], image.width, band[1]))
    pixels = np.asarray(row, dtype=np.float32)
    luminance = pixels.mean(axis=2)
    ink_columns = (luminance > 70).sum(axis=0) > 3
    changes = np.diff(np.pad(ink_columns.astype(np.int8), (1, 1)))
    starts = np.where(changes == 1)[0]
    ends = np.where(changes == -1)[0] - 1
    runs = [(int(start), int(end)) for start, end in zip(starts, ends)]

    merged = [[start, end] for start, end in runs]
    while len(merged) > expected:
        gaps = [merged[index + 1][0] - merged[index][1] for index in range(len(merged) - 1)]
        join_at = int(np.argmin(gaps))
        merged[join_at][1] = merged[join_at + 1][1]
        del merged[join_at + 1]

    if len(merged) < expected:
        raise RuntimeError(
            f"Expected {expected} glyphs in row {band}, detected {len(merged)}: {merged}"
        )
    padding = 9
    return [
        (max(0, start - padding), min(image.width, end + padding + 1))
        for start, end in merged
    ]


def add_image_row(
    image: Image.Image,
    chars: str | list[str],
    centers: tuple[float, float],
    band: tuple[int, int],
    glyphs: dict[str, Glyph],
    metrics: dict[str, tuple[int, int]],
    debug_masks: dict[str, np.ndarray],
    lowercase: bool = False,
    preserve_row: bool = False,
) -> None:
    sequence = list(chars)
    del centers  # Retained in calls as documentation of the source layout.
    for ch, (x0, x1) in zip(sequence, detected_glyph_boxes(image, band, len(sequence))):
        mask = image_cell(image, x0, x1, band[0], band[1], preserve_row=preserve_row)
        name = glyph_name_for_char(ch)
        if preserve_row:
            scale = 720 / (band[1] - band[0])
            glyph, advance, debug = glyph_from_mask(mask, target_height=720, bottom=0, fixed_scale=scale)
        elif lowercase:
            descenders = set("gjpqy")
            ascenders = set("bdfhklt")
            if ch in descenders:
                glyph, advance, debug = glyph_from_mask(mask, target_height=700, bottom=-185)
            elif ch in ascenders:
                glyph, advance, debug = glyph_from_mask(mask, target_height=720, bottom=0)
            else:
                glyph, advance, debug = glyph_from_mask(mask, target_height=X_HEIGHT, bottom=0)
        else:
            glyph, advance, debug = glyph_from_mask(mask, target_height=CAP_HEIGHT, bottom=0)
        glyphs[name] = glyph
        metrics[name] = (advance, SIDE_BEARING)
        debug_masks[name] = debug


def add_simple_shapes(glyphs: dict[str, Glyph], metrics: dict[str, tuple[int, int]]) -> None:
    # Standard utility symbols built from the same angular language.
    if "plus" in glyphs:
        glyphs["plusminus"] = component_glyph(glyphs, [
            ("plus", (0.85, 0, 0, 0.85, 40, 65)),
            ("hyphen", (0.85, 0, 0, 0.85, 40, -80)),
        ])
        metrics["plusminus"] = (metrics["plus"][0], SIDE_BEARING)
    if "asterisk" in glyphs:
        glyphs["multiply"] = component_glyph(glyphs, [("asterisk", (0.8, 0, 0, 0.8, 30, 70))])
        metrics["multiply"] = metrics["asterisk"]
    if "colon" in glyphs and "hyphen" in glyphs:
        glyphs["divide"] = component_glyph(glyphs, [
            ("colon", (0.72, 0, 0, 0.72, 115, 75)),
            ("hyphen", (0.9, 0, 0, 0.9, 18, 20)),
        ])
        metrics["divide"] = (620, SIDE_BEARING)
    glyphs["logicalnot"], logicalnot_advance = rectangle_glyph(65, 300, 560, 360, 640)
    metrics["logicalnot"] = (logicalnot_advance, SIDE_BEARING)
    glyphs["currency"] = component_glyph(glyphs, [("degree", (1.0, 0, 0, 1.0, 100, 80))])
    metrics["currency"] = (metrics.get("degree", (500, SIDE_BEARING))[0] + 100, SIDE_BEARING)
    glyphs["dagger"], dagger_advance = rectangle_glyph(270, -80, 340, 720, 610)
    metrics["dagger"] = (dagger_advance, SIDE_BEARING)
    glyphs["daggerdbl"] = component_glyph(glyphs, [
        ("dagger", (1, 0, 0, 1, -80, 0)),
        ("dagger", (1, 0, 0, 1, 80, 0)),
    ])
    metrics["daggerdbl"] = (760, SIDE_BEARING)


def add_accents_and_composites(glyphs: dict[str, Glyph], metrics: dict[str, tuple[int, int]], cmap: dict[int, str]) -> None:
    # Compact, sharp accent shapes. These are components so later revisions remain easy.
    def polygon(name: str, points: list[tuple[int, int]], advance: int = 0) -> None:
        pen = TTGlyphPen(None)
        pen.moveTo(points[0])
        for point in points[1:]:
            pen.lineTo(point)
        pen.closePath()
        glyphs[name] = pen.glyph()
        metrics[name] = (advance, 0)

    polygon("acutecomb", [(360, 760), (485, 900), (565, 900), (430, 760)])
    polygon("gravecomb", [(360, 900), (440, 900), (565, 760), (495, 760)])
    polygon("circumflexcomb", [(315, 770), (465, 905), (615, 770), (555, 735), (465, 815), (375, 735)])
    polygon("caroncomb", [(315, 875), (375, 910), (465, 830), (555, 910), (615, 875), (465, 740)])
    polygon("tildecomb", [(300, 805), (380, 875), (470, 825), (555, 870), (625, 810), (545, 745), (455, 795), (370, 750)])
    polygon("macroncomb", [(315, 800), (615, 800), (615, 855), (315, 855)])
    polygon("dotaccentcomb", [(420, 790), (510, 790), (510, 875), (420, 875)])
    glyphs["dieresiscomb"] = component_glyph(glyphs, [
        ("dotaccentcomb", (0.72, 0, 0, 0.72, -95, 20)),
        ("dotaccentcomb", (0.72, 0, 0, 0.72, 95, 20)),
    ])
    metrics["dieresiscomb"] = (0, 0)
    if "degree" in glyphs:
        glyphs["ringcomb"] = component_glyph(glyphs, [("degree", (0.52, 0, 0, 0.52, 275, 510))])
        metrics["ringcomb"] = (0, 0)
    polygon("cedillacomb", [(420, 0), (500, 0), (465, -105), (555, -145), (505, -215), (385, -180), (420, -125)])

    accent_map = {
        "À": ("A", "gravecomb"), "Á": ("A", "acutecomb"), "Â": ("A", "circumflexcomb"),
        "Ã": ("A", "tildecomb"), "Ä": ("A", "dieresiscomb"), "Å": ("A", "ringcomb"),
        "Ç": ("C", "cedillacomb"), "È": ("E", "gravecomb"), "É": ("E", "acutecomb"),
        "Ê": ("E", "circumflexcomb"), "Ë": ("E", "dieresiscomb"), "Ì": ("I", "gravecomb"),
        "Í": ("I", "acutecomb"), "Î": ("I", "circumflexcomb"), "Ï": ("I", "dieresiscomb"),
        "Ñ": ("N", "tildecomb"), "Ò": ("O", "gravecomb"), "Ó": ("O", "acutecomb"),
        "Ô": ("O", "circumflexcomb"), "Õ": ("O", "tildecomb"), "Ö": ("O", "dieresiscomb"),
        "Ù": ("U", "gravecomb"), "Ú": ("U", "acutecomb"), "Û": ("U", "circumflexcomb"),
        "Ü": ("U", "dieresiscomb"), "Ý": ("Y", "acutecomb"),
        "à": ("a", "gravecomb"), "á": ("a", "acutecomb"), "â": ("a", "circumflexcomb"),
        "ã": ("a", "tildecomb"), "ä": ("a", "dieresiscomb"), "å": ("a", "ringcomb"),
        "ç": ("c", "cedillacomb"), "è": ("e", "gravecomb"), "é": ("e", "acutecomb"),
        "ê": ("e", "circumflexcomb"), "ë": ("e", "dieresiscomb"), "ì": ("i", "gravecomb"),
        "í": ("i", "acutecomb"), "î": ("i", "circumflexcomb"), "ï": ("i", "dieresiscomb"),
        "ñ": ("n", "tildecomb"), "ò": ("o", "gravecomb"), "ó": ("o", "acutecomb"),
        "ô": ("o", "circumflexcomb"), "õ": ("o", "tildecomb"), "ö": ("o", "dieresiscomb"),
        "ù": ("u", "gravecomb"), "ú": ("u", "acutecomb"), "û": ("u", "circumflexcomb"),
        "ü": ("u", "dieresiscomb"), "ý": ("y", "acutecomb"), "ÿ": ("y", "dieresiscomb"),
        "Š": ("S", "caroncomb"), "š": ("s", "caroncomb"), "Ž": ("Z", "caroncomb"),
        "ž": ("z", "caroncomb"), "Č": ("C", "caroncomb"), "č": ("c", "caroncomb"),
    }
    for ch, (base, accent) in accent_map.items():
        if accent not in glyphs:
            continue
        name = glyph_name_for_char(ch)
        glyphs[name] = component_glyph(glyphs, [(base, (1, 0, 0, 1, 0, 0)), (accent, (1, 0, 0, 1, 0, 0))])
        metrics[name] = metrics[base]
        cmap[ord(ch)] = name

    # Practical display ligatures and extended Latin approximations.
    def two_component(ch: str, left: str, right: str, overlap: int = 90) -> None:
        left_width = metrics[left][0]
        name = glyph_name_for_char(ch)
        glyphs[name] = component_glyph(glyphs, [
            (left, (1, 0, 0, 1, 0, 0)),
            (right, (1, 0, 0, 1, left_width - overlap, 0)),
        ])
        metrics[name] = (left_width + metrics[right][0] - overlap, SIDE_BEARING)
        cmap[ord(ch)] = name

    two_component("Æ", "A", "E", 165)
    two_component("æ", "a", "e", 135)
    two_component("Œ", "O", "E", 150)
    two_component("œ", "o", "e", 125)
    two_component("ﬁ", "f", "i", 115)
    two_component("ﬂ", "f", "l", 115)
    two_component("ß", "s", "s", 120)

    for ch, base in (("Ø", "O"), ("ø", "o"), ("Ð", "D"), ("ð", "d"), ("Þ", "P"), ("þ", "p"), ("Ł", "L"), ("ł", "l")):
        name = glyph_name_for_char(ch)
        slash_name = "slash" if ch.isupper() else "hyphen"
        glyphs[name] = component_glyph(glyphs, [
            (base, (1, 0, 0, 1, 0, 0)),
            (slash_name, (0.75, 0, 0, 0.75, 65, 80 if ch.isupper() else 170)),
        ])
        metrics[name] = metrics[base]
        cmap[ord(ch)] = name


def make_debug_sheet(debug_masks: dict[str, np.ndarray]) -> None:
    names = [name for name in debug_masks if len(name) == 1 or name in {"zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"}]
    cols = 13
    cell_w, cell_h = 120, 145
    rows = math.ceil(len(names) / cols)
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), "white")
    draw = ImageDraw.Draw(sheet)
    for index, name in enumerate(names):
        row, col = divmod(index, cols)
        mask = Image.fromarray((debug_masks[name] * 255).astype(np.uint8), "L")
        mask.thumbnail((96, 108), Image.Resampling.LANCZOS)
        x = col * cell_w + (cell_w - mask.width) // 2
        y = row * cell_h + 7
        sheet.paste("black", (x, y, x + mask.width, y + mask.height), mask)
        draw.text((col * cell_w + 6, row * cell_h + 119), name, fill="#555")
    sheet.save(DEBUG)


def build_font() -> None:
    upper = Image.open(SOURCES / "uppercase-numerals-v2.png").convert("RGB")
    lower = Image.open(SOURCES / "lowercase-v1.png").convert("RGB")
    symbols = Image.open(SOURCES / "symbols-v1.png").convert("RGB")

    glyphs: dict[str, Glyph] = {".notdef": empty_glyph(), "space": empty_glyph()}
    metrics: dict[str, tuple[int, int]] = {".notdef": (620, 40), "space": (330, 0)}
    cmap: dict[int, str] = {32: "space"}
    debug_masks: dict[str, np.ndarray] = {}

    add_image_row(upper, "ABCDEFGHIJKLM", (145, 1660), (60, 330), glyphs, metrics, debug_masks)
    add_image_row(upper, "NOPQRSTUVWXYZ", (125, 1665), (350, 605), glyphs, metrics, debug_masks)
    add_image_row(upper, "0123456789", (300, 1475), (600, 855), glyphs, metrics, debug_masks)
    add_image_row(lower, "abcdefghijklm", (130, 1630), (135, 435), glyphs, metrics, debug_masks, lowercase=True)
    add_image_row(lower, "nopqrstuvwxyz", (130, 1645), (455, 750), glyphs, metrics, debug_masks, lowercase=True)

    symbol_rows = [
        (["!", '"', "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/"], (125, 1650), (35, 235)),
        ([":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`"], (130, 1650), (255, 440)),
        (["{", "|", "}", "~", "¡", "¿", "¢", "£", "€", "¥", "§", "¶"], (140, 1645), (455, 655)),
        (["©", "®", "™", "°", "•", "…", "–", "—", "‘", "’", "“", "”"], (140, 1645), (665, 865)),
    ]
    for chars, centers, band in symbol_rows:
        add_image_row(symbols, chars, centers, band, glyphs, metrics, debug_masks, preserve_row=True)

    for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789":
        cmap[ord(ch)] = glyph_name_for_char(ch)
    for chars, _, _ in symbol_rows:
        for ch in chars:
            cmap[ord(ch)] = glyph_name_for_char(ch)

    add_simple_shapes(glyphs, metrics)
    for ch in "±×÷¬¤†‡":
        cmap[ord(ch)] = glyph_name_for_char(ch)
    add_accents_and_composites(glyphs, metrics, cmap)

    # Map common nonbreaking and soft spacing characters.
    cmap[0x00A0] = "space"

    glyph_order = [".notdef", "space"] + [name for name in glyphs if name not in {".notdef", "space"}]
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(glyph_order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASCENT, descent=DESCENT, lineGap=80)
    fb.setupNameTable({
        "familyName": "Lost Opal Display",
        "styleName": "Regular",
        "uniqueFontIdentifier": "Lost Opal Display Regular 1.000",
        "fullName": "Lost Opal Display Regular",
        "psName": "LostOpalDisplay-Regular",
        "version": "Version 1.000",
        "manufacturer": "Lost Opal",
        "designer": "Lost Opal",
        "description": "A custom Gothic display face derived from the original Lost Opal wordmark.",
        "copyright": "Copyright 2025-2026 Lost Opal. All rights reserved.",
    })
    fb.setupOS2(
        sTypoAscender=ASCENT,
        sTypoDescender=DESCENT,
        sTypoLineGap=80,
        usWinAscent=940,
        usWinDescent=260,
        sxHeight=X_HEIGHT,
        sCapHeight=CAP_HEIGHT,
        usWeightClass=500,
        usWidthClass=4,
        fsType=0,
        fsSelection=0x40,
    )
    fb.setupPost(italicAngle=0, underlinePosition=-145, underlineThickness=55)
    fb.setupMaxp()
    fb.setupHead(created=0, modified=0)

    font = fb.font
    font["head"].macStyle = 0
    font["OS/2"].achVendID = "LOPL"
    font["OS/2"].panose.bFamilyType = 3
    font["OS/2"].panose.bSerifStyle = 8
    font["OS/2"].panose.bProportion = 8
    font.save(OUTPUT, reorderTables=True)
    make_debug_sheet(debug_masks)


def render_proof() -> None:
    font = ImageFont.truetype(str(OUTPUT), 84)
    small = ImageFont.truetype(str(OUTPUT), 58)
    canvas = Image.new("RGB", (2100, 1500), "#0a0a0d")
    draw = ImageDraw.Draw(canvas)
    ink = "#f4ead5"
    accent = "#d3a755"
    draw.text((80, 55), "Lost Opal Display", font=font, fill=accent)
    lines = [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "abcdefghijklmnopqrstuvwxyz",
        "0123456789  0 7",
        "Tarot & Astrology",
        "Seek the Higher Self",
        "When you are ready...",
        "ÀÁÂÃÄÅ Æ Ç ÈÉÊË ÌÍÎÏ Ñ ÒÓÔÕÖ Ø ÙÚÛÜ Ý",
        "àáâãäå æ ç èéêë ìíîï ñ òóôõö ø ùúûü ýÿ",
        "! ? @ # $ % & * + - = / \\ ( ) [ ] { }",
        "© ® ™ € £ ¥ ¢ § ¶ • … – — ‘ ’ “ ”",
    ]
    y = 200
    for line in lines:
        draw.text((80, y), line, font=small, fill=ink)
        y += 118
    canvas.save(PROOF)


def validate_font() -> None:
    font = TTFont(OUTPUT, recalcBBoxes=False, recalcTimestamp=False)
    cmap = font.getBestCmap()
    required = (
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
        "©®™°•…–—‘’“”¢£€¥§¶¡¿"
    )
    missing = [ch for ch in required if ord(ch) not in cmap]
    if missing:
        raise RuntimeError(f"Missing required characters: {missing}")
    if len(font.getGlyphOrder()) < 150:
        raise RuntimeError("Unexpectedly small glyph set")
    print(f"Built {OUTPUT}")
    print(f"Glyphs: {len(font.getGlyphOrder())}")
    print(f"Mapped Unicode codepoints: {len(cmap)}")
    print(f"File size: {OUTPUT.stat().st_size} bytes")
    print(f"Proof: {PROOF}")


if __name__ == "__main__":
    build_font()
    validate_font()
    render_proof()
