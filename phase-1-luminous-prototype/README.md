# Lost Opal local design prototype

This directory is the source of truth for the working Lost Opal site. The root
build script copies its public allowlist into `../production-site/`; publishing
then compares that package with the remote deployment manifest.

The active direction is a celestial black-opal theme with a compact shared
header, restrained gold accents, readable dark surfaces, the official Lost Opal
seal, and a responsive navigation drawer. Mystery belongs in the work. Finding
the Contact page should not require initiation into a secret order.

## Current visitor-facing routes

- `/` &mdash; homepage, readings, donations, practice overview, About, and compact contact form
- `/contact/` &mdash; dedicated contact and inquiry page
- `/ethics/` &mdash; code of practice and Lost Opal Reader&rsquo;s Oath
- `/astrology/` &mdash; Coming Soon holding page
- `/crystals/` &mdash; Coming Soon holding page
- `/learn/reading-styles/` &mdash; Coming Soon holding page
- `/nuncastra/` &mdash; private-by-link astronomical Tarot tool

Card Meanings, Tree of Life, and the future Library currently use the shared
Coming Soon dialog. The Ko-fi Shop link is external and remains available.

## Preserved working drafts

Unfinished learning content was preserved before its visitor-facing route was
closed:

- `astrology/draft-learning-hub.html`
- `crystals/draft-learning-hub.html`
- `learn/reading-styles/draft-learning-page.html`

## Shared files

- `styles.css` contains the original structural foundation.
- `luminous.css` contains the evolved component system and responsive header.
- `black-opal-theme.css` contains the celestial black-opal theme.
- `site-audit.css` is the final shared presentation layer for the current public shell.
- `prototype.js` handles navigation, the mobile drawer, contact forms, tabs,
  donation-dock state, the shared atmosphere, planned-route dialog, and footer years.
- `black-opal-sky.js` draws the motion-aware celestial background.

The CSS remains layered intentionally so the site's established design system
can evolve without a framework migration.

## Contact form

The form submits to FormSubmit and falls back to the visitor&rsquo;s email app if the
service cannot complete the request. FormSubmit activation and a real-world test
remain launch checks; see `SITE_AUDIT.md`.

## Local preview

From this directory:

```powershell
.\start_preview.ps1
```

Then open <http://localhost:8082/>.

See `SITE_AUDIT.md` for the launch-facing audit, `DESIGN_NOTES.md` for the design
history, and `ASTROLOGY_CONTENT_MAP.md` for the future learning architecture.
