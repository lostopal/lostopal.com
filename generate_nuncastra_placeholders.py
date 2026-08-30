"""Bake Nuncastra's developing correspondences into small WebP card assets."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "phase-1-luminous-prototype"
BACKGROUND = SOURCE / "assets/ui-materials/black-opal-button-material-v1-optimized.webp"
DESTINATION = SOURCE / "nuncastra/assets/placeholders"

WIDTH = 216
HEIGHT = 360

CARDS = [
    ("developing-correspondence.webp", "✦", "DEVELOPING\nCORRESPONDENCE"),
    ("lilith.webp", "⚸", "LILITH"),
    ("ceres.webp", "⚳", "CERES"),
    ("pallas.webp", "⚴", "PALLAS"),
    ("juno.webp", "⚵", "JUNO"),
    ("vesta.webp", "⚶", "VESTA"),
    ("ascendant.webp", "ASC", "ASCENDANT"),
    ("midheaven.webp", "MC", "MIDHEAVEN"),
    ("vertex.webp", "Vx", "VERTEX"),
    ("lot-of-fortune.webp", "⊗", "LOT OF\nFORTUNE"),
]


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / path), size=size)


SYMBOL_FONT = font("seguisym.ttf", 78)
ANGLE_FONT = font("georgiab.ttf", 56)
NAME_FONT = font("arialbd.ttf", 18)
SMALL_FONT = font("arialbd.ttf", 9)


def centered_text(draw: ImageDraw.ImageDraw, box, text, text_font, fill, spacing=3):
    bounds = draw.multiline_textbbox((0, 0), text, font=text_font, spacing=spacing, align="center")
    text_width = bounds[2] - bounds[0]
    text_height = bounds[3] - bounds[1]
    left, top, right, bottom = box
    x = left + (right - left - text_width) / 2
    y = top + (bottom - top - text_height) / 2 - bounds[1]
    draw.multiline_text((x, y), text, font=text_font, fill=fill, spacing=spacing, align="center")


def dashed_ellipse(draw: ImageDraw.ImageDraw, box, fill, width=1, dash=13, gap=9):
    angle = 0
    while angle < 360:
        draw.arc(box, angle, min(angle + dash, 360), fill=fill, width=width)
        angle += dash + gap


def create_card(background: Image.Image, glyph: str, label: str) -> Image.Image:
    opal = ImageOps.fit(background, (WIDTH, HEIGHT), method=Image.Resampling.LANCZOS)
    opal = ImageEnhance.Color(opal).enhance(1.18)
    opal = ImageEnhance.Contrast(opal).enhance(1.12).convert("RGBA")

    dark = Image.new("RGBA", (WIDTH, HEIGHT), (1, 7, 8, 0))
    dark_alpha = Image.new("L", (WIDTH, HEIGHT))
    alpha_pixels = dark_alpha.load()
    for y in range(HEIGHT):
        for x in range(WIDTH):
            edge = max(abs(x - WIDTH / 2) / (WIDTH / 2), abs(y - HEIGHT / 2) / (HEIGHT / 2))
            alpha_pixels[x, y] = int(140 + 74 * edge)
    dark.putalpha(dark_alpha)
    card = Image.alpha_composite(opal, dark)

    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    ImageDraw.Draw(mask).rounded_rectangle((1, 1, WIDTH - 2, HEIGHT - 2), radius=19, fill=255)
    card.putalpha(mask)

    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((35, 72, WIDTH - 35, 252), outline=(54, 227, 194, 105), width=6)
    glow = glow.filter(ImageFilter.GaussianBlur(12))
    card = Image.alpha_composite(card, glow)

    draw = ImageDraw.Draw(card)
    draw.rounded_rectangle((2, 2, WIDTH - 3, HEIGHT - 3), radius=18, outline=(216, 157, 55, 255), width=4)
    draw.rounded_rectangle((9, 9, WIDTH - 10, HEIGHT - 10), radius=13, outline=(7, 82, 67, 255), width=3)
    draw.ellipse((35, 72, WIDTH - 35, 252), outline=(231, 188, 91, 145), width=2)
    dashed_ellipse(draw, (57, 94, WIDTH - 57, 230), (121, 97, 205, 170), width=2)

    glyph_font = ANGLE_FONT if glyph in {"ASC", "MC", "Vx"} else SYMBOL_FONT
    centered_text(draw, (24, 108, WIDTH - 24, 214), glyph, glyph_font, (255, 222, 151, 255))
    centered_text(draw, (18, 245, WIDTH - 18, 303), label, NAME_FONT, (255, 225, 160, 255), spacing=1)
    centered_text(draw, (18, 313, WIDTH - 18, 339), "CORRESPONDENCE PENDING", SMALL_FONT, (114, 210, 189, 230))
    return card


def main() -> None:
    DESTINATION.mkdir(parents=True, exist_ok=True)
    background = Image.open(BACKGROUND).convert("RGB")
    for filename, glyph, label in CARDS:
        output = DESTINATION / filename
        create_card(background, glyph, label).save(output, "WEBP", quality=80, method=6)
        print(f"{output.relative_to(ROOT)} ({output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
