# Lost Opal Tarot & Astrology

This repository contains the maintainable source for [lostopal.com](https://lostopal.com/) and its browser-based astrology-to-Tarot tool, [Nuncastra](https://lostopal.com/nuncastra/).

Lost Opal is a human-led Tarot and astrology practice created by Bryan C. Tucker. The public site combines reading information, spiritual education, ethical boundaries, and interactive symbolic tools in a celestial black-opal visual system.

## Start here

- `phase-1-luminous-prototype/` is the active source of truth.
- `phase-1-luminous-prototype/nuncastra/` contains the current Nuncastra application, its data, vendor components, licenses, and method page.
- `prepare_production.ps1` builds the deployable public package.
- `start_preview.ps1` serves the active source locally.
- `publish_ftp.ps1` compares a prepared package with the last deployed manifest and is a dry run unless `-Publish` is supplied.
- `AGENTS.md` gives coding agents project-specific working instructions.

Generated releases, private backups, former site trees, verification artifacts, raw image experiments, and local credentials are intentionally excluded from version control.

## Preview locally

```powershell
.\start_preview.ps1
```

Open the local URL printed by the script. The site is static, but Nuncastra must be served over HTTP rather than opened directly from the filesystem because it loads JavaScript modules and WebAssembly.

## Build

```powershell
.\prepare_production.ps1
```

The command recreates `production-site/` from an explicit public-file allowlist
and writes a SHA-256 deployment manifest. Do not edit `production-site/`
directly; it is generated and ignored by Git.

## Publish

Publishing uses credentials stored outside the repository. A plain invocation is a safe dry run:

```powershell
.\publish_ftp.ps1 -SourceDirectory production-site
```

The owner publishes only after reviewing the generated package and taking an appropriate live backup:

```powershell
.\publish_ftp.ps1 -SourceDirectory production-site -Publish
```

That command uploads only files whose content changed and preserves remote-only
files. To make hosting exactly match the generated public package—including
removing retired routes and old duplicate assets—use the explicit mirror mode:

```powershell
.\publish_ftp.ps1 -SourceDirectory production-site -Publish -Mirror
```

Mirror mode is guarded to the configured `lostopal.com/htdocs` root and prints
its upload/delete plan during a dry run before any live change is requested.

Never commit passwords, tokens, FTP credentials, private visitor information, or local backup archives.

## AI and crawler access

The public site provides:

- [`/robots.txt`](https://lostopal.com/robots.txt), which permits public crawlers while preserving intentionally hidden drafts and tools;
- [`/sitemap.xml`](https://lostopal.com/sitemap.xml), which lists public human-facing routes;
- [`/llms.txt`](https://lostopal.com/llms.txt), which gives agents concise semantic guidance; and
- [`/llms-full.txt`](https://lostopal.com/llms-full.txt), which explains Lost Opal's voice, Nuncastra, privacy behavior, and interpretation boundaries in more detail.

The repository is the best context for an AI helping with implementation. The live machine-facing guides are the best starting point for an AI trying to understand or accurately describe the public practice.

## Rights and third-party components

This is a mixed-rights repository, not a blanket public-domain release.

- Nuncastra includes AGPL-licensed Swiss Ephemeris components. See `phase-1-luminous-prototype/nuncastra/LICENSE.txt` and `THIRD_PARTY_NOTICES.txt`.
- The 1909 Rider-Waite-Smith scan set used by Nuncastra is treated as public-domain source imagery.
- Other third-party components retain their own licenses and attribution requirements.
- Lost Opal branding, original writing, custom interpretations, visual identity, and original artwork remain the property of their respective owner unless a file explicitly says otherwise.

Opening the source makes collaboration and inspection possible; it does not erase those distinctions.

## Brand language

> **Servant of the Sacred Fire**  
> Helping you care for the quiet light within—and find your way back to it when life feels dim.

Keep navigation and functional instructions plainspoken. Let the mystery live in the work, not in the visitor's ability to use the website.
