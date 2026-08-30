"""Build the right-sized WebP assets used by the public Lost Opal release.

The original PNG/JPEG artwork remains untouched as the source master. Run this
script before prepare_production.ps1 whenever one of those masters changes.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "phase-1-luminous-prototype"


@dataclass(frozen=True)
class ImageJob:
    source: str
    destination: str
    max_dimension: int
    quality: int = 84


JOBS = (
    ImageJob(
        "assets/logo/lost-opal-logo-cabochons-transparent-v1.png",
        "assets/logo/lost-opal-logo-cabochons-transparent-v1.webp",
        640,
        86,
    ),
    ImageJob(
        "assets/logo/lost-opal-nav-mark-transparent-v1.png",
        "assets/logo/lost-opal-nav-mark-transparent-v1.webp",
        512,
        86,
    ),
    ImageJob(
        "assets/logo/lost-opal-ornate-yin-yang-nav.png",
        "assets/logo/lost-opal-ornate-yin-yang-nav.webp",
        256,
        86,
    ),
    ImageJob(
        "assets/bryan-c-tucker-professional-portrait.png",
        "assets/bryan-c-tucker-professional-portrait.webp",
        900,
        84,
    ),
    ImageJob(
        "assets/lost-opal-public-reading-primary.jpg",
        "assets/lost-opal-public-reading-primary-upright-v1.webp",
        1400,
        84,
    ),
    ImageJob(
        "assets/lost-opal-mark.webp",
        "assets/lost-opal-mark-optimized.webp",
        640,
        82,
    ),
    ImageJob(
        "assets/ui-materials/black-opal-button-material-v1.webp",
        "assets/ui-materials/black-opal-button-material-v1-optimized.webp",
        1024,
        80,
    ),
    ImageJob(
        "assets/ui-materials/black-opal-donation-material-v1.webp",
        "assets/ui-materials/black-opal-donation-material-v1-optimized.webp",
        1024,
        80,
    ),
    ImageJob(
        "assets/payment-logos/kofi.png",
        "assets/payment-logos/kofi.webp",
        128,
        84,
    ),
    ImageJob(
        "assets/payment-logos/venmo-monogram.png",
        "assets/payment-logos/venmo-monogram.webp",
        128,
        84,
    ),
    *(
        ImageJob(
            f"assets/planetary-cabochons/v2/black-opal/{planet}.png",
            f"assets/planetary-cabochons/v2/black-opal/{planet}.webp",
            256,
            84,
        )
        for planet in ("jupiter", "mars", "mercury", "moon", "saturn", "sun", "venus")
    ),
    *(
        ImageJob(
            f"assets/planetary-cabochons/v3-planet-colors/{filename}.png",
            f"assets/planetary-cabochons/v3-planet-colors/{filename}.webp",
            256,
            84,
        )
        for filename in ("mercury-orange-opal", "sun-yellow-opal", "venus-emerald-opal")
    ),
)


def resize_to_fit(image: Image.Image, max_dimension: int) -> Image.Image:
    width, height = image.size
    scale = min(1.0, max_dimension / max(width, height))
    if scale == 1.0:
        return image.copy()
    size = (max(1, round(width * scale)), max(1, round(height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS)


def optimize(job: ImageJob) -> tuple[int, int, tuple[int, int]]:
    source = SOURCE / job.source
    destination = SOURCE / job.destination
    if not source.is_file():
        raise FileNotFoundError(f"Missing image source: {source}")

    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        image = resize_to_fit(image, job.max_dimension)
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(
            destination,
            "WEBP",
            quality=job.quality,
            method=6,
            exact=True,
        )
        dimensions = image.size

    return source.stat().st_size, destination.stat().st_size, dimensions


def main() -> None:
    original_total = 0
    optimized_total = 0
    for job in JOBS:
        original, optimized, dimensions = optimize(job)
        original_total += original
        optimized_total += optimized
        saving = 100 * (1 - optimized / original)
        print(
            f"{job.destination}: {dimensions[0]}x{dimensions[1]}, "
            f"{original / 1024:.1f} KB -> {optimized / 1024:.1f} KB "
            f"({saving:.1f}% smaller)"
        )

    saving = 100 * (1 - optimized_total / original_total)
    print(
        f"Optimized {len(JOBS)} assets: {original_total / 1024 / 1024:.2f} MB -> "
        f"{optimized_total / 1024 / 1024:.2f} MB ({saving:.1f}% smaller)"
    )


if __name__ == "__main__":
    main()
