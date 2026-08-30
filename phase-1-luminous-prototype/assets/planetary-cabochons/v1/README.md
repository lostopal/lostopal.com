# Planetary Cabochons — v1

Reusable, matched planetary icon family for the local Lost Opal design prototype.

## Final assets

- `black-opal/` — Moon, Mercury, Mars, Saturn, Jupiter, Venus, and Sun
- `white-opal/` — matching white-opal versions of the same seven symbols
- `white-opal-outlined/` — visibility-enhanced white-opal variants with an
  extremely fine charcoal keyline around each illuminated glyph
- `planetary-cabochons-v1-contact-sheet.png` — visual QA sheet for the complete family

Each final icon is a 512 × 512 transparent PNG. Every member uses the same visual footprint, a centered illuminated glyph, and a clean uninterrupted gold bezel. There are no studs, chart lines, labels, filigree, or background ornaments in the reusable assets. The Sun is the same compact size as the other six icons.

## Visual system

- The Moon establishes the glyph treatment: pale luminous core, fine warm-gold edge, and a restrained rose-lilac halo.
- Black opal uses a near-black body with controlled blue, teal, violet, ember, and gold fire.
- White opal uses a luminous milky body with subtle pale-blue, peach, champagne, mint, and gold fire.
- The outlined white-opal variant preserves the illuminated core and halo while
  adding a restrained near-black engraved edge for pale-page and small-size use.
- Glyph geometry changes by planet; bezel, scale, crop, materials, and lighting remain consistent.

## Working sources

`_sources-chroma/` contains the generated green-screen masters used to produce the transparent files. The `*-alpha-raw.png` files are the initial chroma-key extractions. `build_icon_set.py` normalizes the extracted artwork to the shared 512 × 512 canvas and rebuilds the contact sheet.

These assets were generated locally with the built-in image-generation tool and have not been added to the website interface or published.
