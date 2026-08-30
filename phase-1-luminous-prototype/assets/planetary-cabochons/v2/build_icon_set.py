from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
V1 = ROOT.parent / "v1"
GLYPHS = ("moon", "mercury", "mars", "saturn", "jupiter", "venus", "sun")
VARIANTS = ("black-opal", "white-opal", "white-opal-outlined")
SIZE = 512
CENTER = SIZE // 2
INTERIOR_RADIUS = 198
GLYPH_SCAN_RADIUS = 146


def fit_texture(path: Path, variant: str) -> Image.Image:
    source = Image.open(path).convert("RGB")
    side = min(source.size)
    left = (source.width - side) // 2
    top = (source.height - side) // 2
    texture = source.crop((left, top, left + side, top + side)).resize(
        (SIZE, SIZE), Image.Resampling.LANCZOS
    )

    texture = ImageEnhance.Color(texture).enhance(1.08)
    texture = ImageEnhance.Contrast(texture).enhance(1.04)

    # Give the flat generated field the curved light falloff of a polished stone.
    edge_value = 0.66 if variant == "black-opal" else 0.84
    shade = Image.new("L", (SIZE, SIZE))
    shade_pixels = shade.load()
    for y in range(SIZE):
        for x in range(SIZE):
            radius = min(1.0, (((x - CENTER) ** 2 + (y - CENTER) ** 2) ** 0.5) / INTERIOR_RADIUS)
            factor = edge_value + (1.0 - edge_value) * (1.0 - radius**1.7)
            shade_pixels[x, y] = round(255 * factor)
    texture = ImageChops.multiply(texture, Image.merge("RGB", (shade, shade, shade)))

    gloss = Image.new("L", (SIZE, SIZE), 0)
    gloss_draw = ImageDraw.Draw(gloss)
    gloss_draw.ellipse((74, 45, 292, 203), fill=52 if variant == "black-opal" else 34)
    gloss = gloss.filter(ImageFilter.GaussianBlur(28))
    highlight = Image.new("RGB", (SIZE, SIZE), (255, 249, 235))
    texture = Image.composite(highlight, texture, gloss)
    return texture.convert("RGBA")


def remove_tiny_components(mask: Image.Image, minimum_pixels: int = 8) -> Image.Image:
    binary = mask.point(lambda value: 255 if value else 0)
    pixels = binary.load()
    visited: set[tuple[int, int]] = set()
    keep = Image.new("L", binary.size, 0)
    keep_pixels = keep.load()

    for y in range(SIZE):
        for x in range(SIZE):
            if pixels[x, y] == 0 or (x, y) in visited:
                continue
            queue = deque([(x, y)])
            visited.add((x, y))
            component: list[tuple[int, int]] = []
            while queue:
                point = queue.popleft()
                component.append(point)
                px, py = point
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < SIZE and 0 <= ny < SIZE and pixels[nx, ny] and (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
            if len(component) >= minimum_pixels:
                for px, py in component:
                    keep_pixels[px, py] = 255
    return keep


def glyph_mask(glyph: str) -> Image.Image:
    # The outlined white set provides the cleanest deterministic edge map.
    # Expand its fine charcoal keyline just enough to preserve the approved
    # illuminated fill and halo from each original icon.
    source = Image.open(V1 / "white-opal-outlined" / f"{glyph}.png").convert("RGBA")
    source_pixels = source.load()
    mask = Image.new("L", (SIZE, SIZE), 0)
    mask_pixels = mask.load()
    scan_squared = GLYPH_SCAN_RADIUS**2

    for y in range(CENTER - GLYPH_SCAN_RADIUS, CENTER + GLYPH_SCAN_RADIUS + 1):
        for x in range(CENTER - GLYPH_SCAN_RADIUS, CENTER + GLYPH_SCAN_RADIUS + 1):
            if (x - CENTER) ** 2 + (y - CENTER) ** 2 > scan_squared:
                continue
            red, green, blue, alpha = source_pixels[x, y]
            if alpha > 16 and max(red, green, blue) < 158:
                mask_pixels[x, y] = 255

    mask = remove_tiny_components(mask)
    mask = mask.filter(ImageFilter.MaxFilter(17))
    return mask.filter(ImageFilter.GaussianBlur(1.15))


def interior_mask() -> Image.Image:
    mask = Image.new("L", (SIZE, SIZE), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse(
        (
            CENTER - INTERIOR_RADIUS,
            CENTER - INTERIOR_RADIUS,
            CENTER + INTERIOR_RADIUS,
            CENTER + INTERIOR_RADIUS,
        ),
        fill=255,
    )
    return mask.filter(ImageFilter.GaussianBlur(1.25))


def build_icon(variant: str, glyph: str, destination: Path) -> None:
    source_variant = "black-opal" if variant == "black-opal" else variant
    original = Image.open(V1 / source_variant / f"{glyph}.png").convert("RGBA")
    texture_variant = "black-opal" if variant == "black-opal" else "white-opal"
    texture = fit_texture(ROOT / "textures" / texture_variant / f"{glyph}.png", texture_variant)

    result = original.copy()
    result.paste(texture, (0, 0), interior_mask())
    result = Image.composite(original, result, glyph_mask(glyph))
    result.putalpha(original.getchannel("A"))

    destination.parent.mkdir(parents=True, exist_ok=True)
    result.save(destination, optimize=True)


def checkerboard(size: tuple[int, int], cell: int = 16) -> Image.Image:
    width, height = size
    board = Image.new("RGBA", size, (47, 40, 50, 255))
    draw = ImageDraw.Draw(board)
    colors = ((47, 40, 50, 255), (59, 50, 62, 255))
    for y in range(0, height, cell):
        for x in range(0, width, cell):
            draw.rectangle(
                (x, y, min(x + cell - 1, width - 1), min(y + cell - 1, height - 1)),
                fill=colors[((x // cell) + (y // cell)) % 2],
            )
    return board


def create_contact_sheet(destination: Path) -> None:
    cell_width = 264
    cell_height = 300
    sheet = Image.new("RGBA", (cell_width * 7, cell_height * 3), (31, 25, 34, 255))
    font = ImageFont.load_default(size=20)

    for row, variant in enumerate(VARIANTS):
        for column, glyph in enumerate(GLYPHS):
            tile = checkerboard((cell_width, cell_height))
            icon = Image.open(ROOT / variant / f"{glyph}.png").convert("RGBA")
            icon.thumbnail((232, 232), Image.Resampling.LANCZOS)
            tile.alpha_composite(icon, ((cell_width - icon.width) // 2, 12))
            label = f"{variant} / {glyph}"
            tile_draw = ImageDraw.Draw(tile)
            box = tile_draw.textbbox((0, 0), label, font=font)
            tile_draw.text(
                ((cell_width - (box[2] - box[0])) // 2, 260),
                label,
                font=font,
                fill=(255, 238, 205, 255),
            )
            sheet.alpha_composite(tile, (column * cell_width, row * cell_height))

    sheet.save(destination, optimize=True)


def main() -> None:
    for variant in VARIANTS:
        for glyph in GLYPHS:
            build_icon(variant, glyph, ROOT / variant / f"{glyph}.png")
    create_contact_sheet(ROOT / "planetary-cabochons-v2-contact-sheet.png")


if __name__ == "__main__":
    main()
