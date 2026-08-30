# Lost Opal site audit

Audit date: 2026-08-04  
Scope: `phase-1-luminous-prototype` and generated `production-site` package  
Publishing status: published to `https://lostopal.com/` on 2026-08-04

## Result

The visitor-facing prototype now uses one black-opal shell, one navigation
order, one official navigation mark, one footer treatment, and one set of shared
design tokens. Home, Contact, and Ethics are the real content pages. Research-
heavy learning routes now state that they are coming soon instead of exposing
unfinished material.

## Route status

| Route | State | Notes |
| --- | --- | --- |
| `/` | Review-ready | Main public gateway and compact inquiry path |
| `/contact/` | Review-ready | Dedicated contact page and full inquiry form |
| `/donate/` | Review-ready | Shareable donation landing page with four official payment options |
| `/ethics/` | Review-ready | Code of practice and Reader&rsquo;s Oath |
| `/astrology/` | Coming Soon | Full hub preserved as `draft-learning-hub.html` |
| `/crystals/` | Coming Soon | Full hub preserved as `draft-learning-hub.html` |
| `/learn/reading-styles/` | Coming Soon | Full page preserved as `draft-learning-page.html` |
| Card Meanings | Coming Soon dialog | Planned route; no filler page published |
| Tree of Life | Coming Soon dialog | Planned route; no filler page published |
| Library | Coming Soon dialog | Planned route; no filler page published |
| Shop | Active external link | Ko-fi Shop |
| `/logo-lab/` | Internal only | Design workshop; exclude from a public upload |

## Shared visual system

The public routes load `site-audit.css` last. It establishes the final shell and
lets earlier prototype styles remain available while the design is still under
active review. This keeps the site coherent now without performing a risky,
thousand-line mechanical rewrite just before launch review.

The shared shell includes:

- the celestial black-opal background and readable dark panels;
- the same compact header, navigation order, CTA, and mobile drawer;
- the official transparent navigation logo;
- consistent gold, copper, cyan, magenta, text, rule, and surface tokens;
- a full-width footer with current-year copyright text;
- reduced-motion support for animated or transitioning elements.

## Code cleanup completed

- Public pages and shared Coming Soon notices no longer speak from a builder,
  Codex, local-development, or review-copy perspective. Unfinished areas now use
  direct Lost Opal language and point visitors back to available content.
- Shared JavaScript now runs in private scopes instead of leaking variables onto `window`.
- Navigation functions tolerate missing optional elements rather than crashing a page.
- Both contact forms block empty or invalid submissions and explain missing information inline without browser popups.
- Donation providers live on one purpose-built page instead of competing with the homepage introduction.
- The floating donation reminder is dismissible, reduces to a compact link, and never implies that donations purchase private services.
- Public routes no longer load obsolete page-specific learning themes.
- Copyright ranges are generated from the established year (2025).
- Comments document intent and maintenance traps without narrating obvious syntax.
- Draft learning documents remain local and unlinked.

## Post-launch follow-ups

These items need a real decision or external test before publication:

1. Activate and verify the FormSubmit destination for `opal@lostopal.com`, then send a real desktop and mobile test message.
2. Confirm the current Ko-fi, PayPal, Cash App, and Venmo destinations with small test transactions or account-owner verification.
3. Review the homepage, Contact, and Ethics pages on at least one small phone, the S25 Ultra, a tablet, and a desktop browser.
4. Run a final keyboard-only pass through menus, forms, dialogs, and the donation dock.
5. Recheck the public pages after meaningful design or content changes. Home,
   Contact, and Ethics are indexable; unfinished learning pages remain
   `noindex, nofollow` until their content is approved.

## Publication guard

Do not upload the draft learning pages, `/logo-lab/`, temporary artwork, or this
entire prototype directory. Build the explicit `production-site` package with
`prepare_production.ps1` before publication. The Astrology route must remain a
Coming Soon page until the user explicitly opens it.
