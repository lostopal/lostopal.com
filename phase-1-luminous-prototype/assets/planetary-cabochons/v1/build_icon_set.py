from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
VARIANTS = ("black-opal", "white-opal", "white-opal-outlined")
GLYPHS = ("moon", "mercury", "mars", "saturn", "jupiter", "venus", "sun")
FINAL_SIZE = 512
ART_SIZE = 448
ALPHA_CROP_THRESHOLD = 18


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= ALPHA_CROP_THRESHOLD else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("Image has no visible pixels")
    return bbox


def normalize_icon(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    crop = image.crop(alpha_bbox(image))

    # Match every cabochon's largest visible dimension while preserving its shape.
    scale = min(ART_SIZE / crop.width, ART_SIZE / crop.height)
    resized = crop.resize(
        (max(1, round(crop.width * scale)), max(1, round(crop.height * scale))),
        Image.Resampling.LANCZOS,
    )

    canvas = Image.new("RGBA", (FINAL_SIZE, FINAL_SIZE), (0, 0, 0, 0))
    x = (FINAL_SIZE - resized.width) // 2
    y = (FINAL_SIZE - resized.height) // 2
    canvas.alpha_composite(resized, (x, y))
    destination.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(destination, optimize=True)


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
    sheet = Image.new(
        "RGBA",
        (cell_width * 7, cell_height * len(VARIANTS)),
        (31, 25, 34, 255),
    )
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=20)

    for row, variant in enumerate(VARIANTS):
        for column, glyph in enumerate(GLYPHS):
            x = column * cell_width
            y = row * cell_height
            tile = checkerboard((cell_width, cell_height))
            icon = Image.open(ROOT / variant / f"{glyph}.png").convert("RGBA")
            icon.thumbnail((232, 232), Image.Resampling.LANCZOS)
            tile.alpha_composite(icon, ((cell_width - icon.width) // 2, 12))
            label = f"{variant} / {glyph}"
            label_box = draw.textbbox((0, 0), label, font=font)
            label_width = label_box[2] - label_box[0]
            tile_draw = ImageDraw.Draw(tile)
            tile_draw.text(
                ((cell_width - label_width) // 2, 260),
                label,
                font=font,
                fill=(255, 238, 205, 255),
            )
            sheet.alpha_composite(tile, (x, y))

    sheet.save(destination, optimize=True)


def main() -> None:
    for variant in VARIANTS:
        for glyph in GLYPHS:
            source = ROOT / f"{variant}-{glyph}-alpha-raw.png"
            destination = ROOT / variant / f"{glyph}.png"
            normalize_icon(source, destination)

    create_contact_sheet(ROOT / "planetary-cabochons-v1-contact-sheet.png")


if __name__ == "__main__":
    main()
