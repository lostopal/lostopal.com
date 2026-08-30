# Lost Opal brand, domain, and logo architecture

Status: local design planning  
No DNS, hosting, logo, or publishing changes have been made.

## The constellation model

The main Lost Opal site should explain the whole practice and the person behind
it. The deeper branches can feel like distinct rooms without becoming unrelated
websites.

```text
lostopal.com
├── tarot/
├── astrology/
├── library/
├── sanctum/
└── about, contact, donations, and the shared front door
```

Recommended roles:

- **Lost Opal** — the umbrella identity and whole-person homepage.
- **Lost Opal Tarot™** — readings, spreads, card meanings, divination tools,
  and Tarot study.
- **Lost Opal Astrology™** — planets, signs, houses, aspects, chart literacy,
  cycles, and Astrology study.
- **Library** — sourced books, decks, references, articles, and further reading
  shared across subjects.
- **Shop** — relevant decks, books, stones, tools, house offerings, and clearly
  labeled affiliate recommendations connected to the learning branches.
- **Sanctum** — reserve for devotional practice, Sacred Fire, ritual, symbols,
  prayers/meditations, or material too personal and experiential for a general
  reference library.

`Learn` is useful as a navigation verb, but may not need to become a separate
place. Tarot and Astrology can each contain their own learning paths. `Wisdom`
is evocative but too broad to be a reliable first-level destination until its
content has a more specific purpose.

## Folder-first, subdomain-friendly

Build and maintain one physical website:

```text
https://lostopal.com/tarot/
https://lostopal.com/astrology/
https://lostopal.com/library/
https://lostopal.com/sanctum/
```

Then, if desired, add memorable aliases:

```text
https://tarot.lostopal.com      → https://lostopal.com/tarot/
https://astrology.lostopal.com  → https://lostopal.com/astrology/
https://library.lostopal.com    → https://lostopal.com/library/
https://sanctum.lostopal.com    → https://lostopal.com/sanctum/
```

The aliases should be permanent redirects, not duplicate copies of the same
content. Visitors get memorable doors; the public site keeps one canonical URL
for each page, one navigation system, one analytics history, and one publishing
workflow.

Use a true independently hosted subdomain only if a branch eventually becomes a
different application or requires a genuinely separate technical system.

## What DNS can and cannot do

A DNS `CNAME` record maps one hostname to another hostname. It does not map a
hostname to a URL path and cannot, by itself, turn
`tarot.lostopal.com` into `lostopal.com/tarot/`.

To use a subdomain as a doorway, two pieces are required:

1. A DNS record makes the subdomain resolve.
2. Cloudflare or the web server performs an HTTP redirect to the folder URL.

To keep the subdomain visible in the browser while secretly serving a main-site
folder, the origin or an edge worker must rewrite the request. That is more
complex and is not needed for memorable doorway aliases.

## Current hosting evidence

- The local publishing notes identify the FTP host as `ftpupload.net`.
- The live domain currently uses Cloudflare nameservers.
- Shared-hosting systems in this family commonly assign every added subdomain a
  separate `htdocs` directory rather than letting it share the primary site's
  document root.
- The hosting control panel's **Sub Domains** area is the definitive place to
  confirm the specific account's subdomain quota and folder behavior.

No DNS or hosting setting should be changed until the folder structure and
canonical URLs are approved locally.

## Logo system: one identity, several levels of detail

The logo should be a system, not one image forced to perform every job.

### 1. Core solar-opal mark

Used for the favicon, compact header, social avatar, stamps, and tiny contexts.

- A gold outer solar circle around the whole medallion.
- A broad black-opal body filling that solar circle.
- A small opal center held inside concentric gold rings, functioning as the
  solar point without adding a separate printed `☉` glyph.
- Six almost-hidden radial anchors or a restrained underlying hexagram to carry
  the personal sixfold relationship: Gemini, numerology, Tiphareth, The Lovers,
  and the solar center.

At tiny sizes, this is the entire mark. No planet or zodiac glyphs are forced
into an unreadable coin.

### 2. Standard Lost Opal lockup

Used in the site header, ordinary documents, cards, and public identification.

- Core solar-opal mark.
- `Lost Opal` wordmark.
- Optional branch line: `Tarot`, `Astrology`, `Library`, `Shop`, or `Sanctum`.

The umbrella wordmark stays stable even when another branch appears later.

### 3. Full ceremonial seal

Used at large scale in the homepage hero, altar cloths, posters, print, or a
dedicated symbolic page.

From center outward:

1. The entire existing black-opal cabochon reframed as the hidden solar glyph:
   gold outer circle, black-opal body, and gold-ringed opal center point.
2. Concentric gold circles preserving the original crest's jewelry-like frame.
3. The twelve zodiac signs woven into the immediate scrollwork collar, starting
   with Aries at nine o'clock and proceeding counterclockwise.
4. Six subtle classical planetary glyphs hidden inside the black opal, with the
   Sun remaining central:
   Saturn at top, Jupiter upper right, Venus lower right, Moon below, Mercury
   lower left, and Mars upper left.
5. The original broad symmetrical filigree silhouette, crowned by the infinity
   motif at the highest point of the mark.
6. The dominant blackletter-inspired `Lost Opal` plaque beneath the medallion.
7. `Tarot & Astrology` replacing the former Tarot-only descriptor.

This is where all the desired symbolic information belongs. It should not be
used as the favicon or squeezed into a mobile header.

### 4. Branch lockups

Each room can inherit the same master geometry while changing only its
descriptor and one restrained secondary motif:

- **Tarot** — card/path accent.
- **Astrology** — planetary/ecliptic accent.
- **Library** — book/flame accent.
- **Shop** — crafted object/tool accent.
- **Sanctum** — Rose Cross/Sacred Fire accent.

## Preventing another AI-symbol nightmare

Do not ask an image model to render the finished logo, typography, planetary
glyphs, and zodiac order in one pass.

Build it in controlled layers:

1. Construct all circles, divisions, and sixfold geometry deterministically.
2. Place real planetary and zodiac glyphs in audited positions.
3. Verify the complete sequence before styling.
4. Create or select only the black-opal material as raster texture.
5. Mask that texture selectively into the planetary glyph strokes, solar body,
   and a small number of jewel settings.
6. Add gold/copper material, highlights, and depth without moving the symbols.
7. Keep the wordmark and descriptor as real typography until a final vector
   conversion is approved.
8. Test the core, standard, and ceremonial variants separately at their actual
   display sizes.

The machine may help create the opal surface. It must not be trusted to invent
or spell the symbolic system.

## Exact symbol audit

### Classical seven

```text
☉ Sun — center
♄ Saturn — top
♃ Jupiter — upper right
♀ Venus — lower right
☽ Moon — bottom
☿ Mercury — lower left
♂ Mars — upper left
```

### Zodiac twelve

```text
♈ Aries
♉ Taurus
♊ Gemini
♋ Cancer
♌ Leo
♍ Virgo
♎ Libra
♏ Scorpio
♐ Sagittarius
♑ Capricorn
♒ Aquarius
♓ Pisces
```

The Gemini glyph may receive an extremely restrained emphasis in the personal
ceremonial version, but the public zodiac ring should preserve the equal order
and weight of all twelve signs.

### Personal triad variant

The personal ceremonial variant may emphasize a three-part relationship:

- **Sun** — the solar/Tiphareth center already governing the whole mark;
- **Mercury** — ruler of Gemini;
- **Moon** — ruler of Cancer.

This is a layer of personal emphasis, not a replacement cosmology. Planetary
positions, the zodiac sequence, and the equal public version remain unchanged.

## Wording direction

The public working hierarchy now reads:

> LOST OPAL  
> TAROT & ASTROLOGY

`Hermetica` is best reserved for the historical body of writings attributed to
Hermes Trismegistus. It may become an excellent Library collection or subject
heading, but it does not automatically mean the living practice represented by
the logo. `Hermetic Arts` remains useful as site language, but the working logo
does not need to print it.

If a tertiary line is reconsidered later, alternatives can be compared without
changing the master mark:

- Tarot • Astrology • Hermetic Studies
- A Hermetic Practice of Tarot & Astrology
- Tarot & Astrology within the Hermetic Arts

Keeping the tertiary line removable prevents the entire logo from needing
reconstruction if the final phrase changes.

## Next logo step

Audit the revised flat construction proof before applying material:

- no opal texture;
- no lighting;
- no ornate wordmark;
- exact circles and a visible orbit without a visible hexagram;
- all nineteen non-central glyph positions audited;
- three separate size variants shown together.

Only after that proof is correct should the opal and gold materials be applied.
