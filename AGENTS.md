# Working on Lost Opal with an AI agent

## Source of truth

- Work in `phase-1-luminous-prototype/`.
- Treat `production-site/` as generated output. Never make a lasting fix only there.
- Keep the existing static HTML/CSS/JavaScript architecture unless the owner explicitly approves a framework migration.
- Nuncastra lives at `phase-1-luminous-prototype/nuncastra/`. Its legacy routes under `astrology/` are redirects or preserved history, not the active app.

## Before changing anything

1. Read the root `README.md`.
2. Inspect the relevant existing HTML, the last applicable CSS layer, and the JavaScript that owns the interaction.
3. Preserve unrelated owner changes. This project is often edited in a live, iterative design conversation.
4. Check Nuncastra's `source.html`, `LICENSE.txt`, and `THIRD_PARTY_NOTICES.txt` before changing calculations, vendors, privacy claims, or attribution.

## Design and voice

- The established visual language is celestial black opal, emerald, gold, oxblood, parchment for print, subtle cosmic light, and readable dark surfaces.
- Lost Opal's custom display face is accent typography, not body copy. Large text must scale cleanly and remain readable.
- Keep controls obvious, touch-friendly, keyboard-accessible, and consistent with the shared site header and buttons.
- Keep functional language direct and relatable. Avoid title case for ordinary sentences.
- Preserve the site's spiritual warmth without making deterministic, medical, legal, financial, or fear-based claims.
- Bryan's interpretive system is intentional. Do not silently replace Lost Opal correspondences with a generic Tarot or astrology table.

## Nuncastra boundaries

- Astronomical calculations should remain in the browser unless the owner explicitly chooses a server architecture.
- Do not add collection, analytics, or transmission of birth data, coordinates, or completed readings without explicit approval and corresponding privacy copy.
- Time, place, timezone, zodiac system, houses, angles, nodes, and ephemeris accuracy are coupled. Validate calculation changes against more than one date and location.
- Preserve visible uncertainty language for unknown or estimated birth time and birthplace.
- Preserve third-party attributions and AGPL source availability.

## Build and validation

Run:

```powershell
.\prepare_production.ps1
```

The build must finish without a missing-file error. For JavaScript changes, run syntax checks on changed scripts when Node.js is available. For route or crawler changes, verify `robots.txt`, `sitemap.xml`, `llms.txt`, and the affected HTML metadata in the generated package.

Publishing is an external action. Do not run `publish_ftp.ps1 -Publish`, use its
`-Mirror` pruning mode, create releases, or push to a remote unless the owner
asked for it in the current task. Never add secrets to source control.

## Asset policy

- Prefer the optimized WebP files already used by the production build.
- Do not reintroduce heavyweight PNG/JPEG design experiments into public routes.
- Preserve image aspect ratio and orientation metadata by baking orientation into exported assets.
- Keep the 1909 RWS card filenames and ordering stable unless every data reference is migrated together.

## Completion standard

A change is complete when it is made in source, the production package builds, the relevant code or metadata is validated, and the handoff explains any remaining owner decision. Do not claim a live deployment unless the published URLs were checked after upload.
