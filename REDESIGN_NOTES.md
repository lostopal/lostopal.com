# Lost Opal Tarot redesign brief

Status: planning notes approved in conversation. No redesign has been implemented
or published yet.

## Scope and safety

- Lost Opal Tarot is the working project.
- `working-site/` is the editable local website.
- `backups/` contains the preserved FTP snapshot.
- J&E's Fine Woodworking is a read-only visual reference. Never modify its local
  files or live website as part of this project.
- Build and review locally. Do not publish without explicit approval.

## Brand direction

The site should combine professional, plainspoken interfaces with an unmistakably
mystical visual identity. Let the design carry much of the mystery while keeping
navigation, money, contact, and instructions easy to understand.

Approved brand language:

> **Servant of the Sacred Fire**  
> Helping you care for the quiet light within—and find your way back to it when life feels dim.

Voice rule:

- Functional labels remain literal: Donations, Contact, Readings, Library,
  Card Meanings, and About.
- Brand headlines and selected passages may be poetic or mystical.
- Supporting copy should clearly explain what the poetic language means.
- Avoid fear tactics, inflated promises, or language visitors must decode before
  they can understand the service.

## Primary visitor experience

Many mobile visitors arrive by scanning a QR code after encountering Opal. The
opening screen must immediately:

1. Confirm that this is the official Lost Opal Tarot website.
2. Show the recognizable crest/logo prominently.
3. Make donation options immediately visible without consuming the full screen.
4. Provide an easy path into the rest of the site.

Donation links should use compact, polished circular icons inspired by the J&E
contact/social treatment. Include visible labels and accessible names. Current
options are Ko-fi/Stripe, Cash App, PayPal, and Venmo. Use the plain label
"Donations"; final supporting wording remains to be written.

The full crest remains a high-impact hero element, but it should be smaller and
more efficiently placed than it is now. A simplified mark or central opal motif
can be used in the persistent header. Do not repeat a large text logotype directly
under the full logo unless it adds information.

## Navigation and information architecture

Use a compact persistent header. Do not place every future destination in a
single row and do not use two full rows of navigation.

Recommended desktop structure:

- Home
- Readings (grouped menu)
- Learn (grouped menu)
- Library
- About
- Contact
- Donations action

Recommended grouped destinations:

### Readings

- Reading options
- Tarot Spreads
- What to expect
- Ethics and boundaries
- Booking (when ready)

### Learn

- Tarot
- Card Meanings
- Tree of Life
- Astrology
- Future subjects

Recommended URL structure:

```text
/
├── readings/
├── spreads/
├── learn/
│   ├── tarot/
│   ├── card-meanings/
│   ├── tree-of-life/
│   └── astrology/
├── library/
├── contact/
└── donations/
```

Mobile navigation should use a compact sticky header with a small brand mark,
Donations action, and hamburger menu. Grouped areas should open as clear accordion
sections in the mobile drawer.

## Homepage concept

The homepage remains a satisfying single-page scroll but serves as a gateway to
deeper pages.

Recommended order:

1. Persistent header.
2. Compact hero with full crest, approved Sacred Fire language, and a short clear
   description of the work.
3. Immediately visible circular donation links.
4. Mini Contact Opal form near the top (name, email, short message).
5. Short introduction/About section with an optional future portrait slot.
6. Ways to work with Opal/readings overview.
7. Explore Lost Opal portal grid linking to Spreads, Tarot, Card Meanings, Tree of
   Life, Astrology, and Library.
8. Short ethics/principles section.
9. Final contact/navigation invitation and polished footer.

On desktop, the hero can use a two-column composition. On mobile, order content as
identity, donations, contact, then exploration.

## Visual art direction

- Deep emerald and near-black foundation.
- Antique gold structure and interaction accents.
- Opal blue/green spectral highlights used sparingly.
- Warm parchment reading surfaces to provide contrast and breathing room.
- Translucent opal-glass panels where appropriate.
- Tall tarot-card proportions for subject portals.
- Gold filigree or symbolic linework as restrained separators.
- Ornate/blackletter typography reserved for the logo and rare accents.
- Elegant serif headings paired with a highly readable modern body face.
- Subtle depth, shimmer, and light; avoid excessive sparkles or generic occult
  clip art.
- Do not render every section as the same dark rounded card.

## Contact and booking

- Place a compact contact form near the top of the homepage.
- Create a complete dedicated Contact page with inquiry type, expectations,
  response time, and service-area/event information when known.
- The site is static and needs a form-processing endpoint. Formspree or Basin are
  suitable options; the final provider/account must be configured before live
  submissions can be relied on.
- Contact notifications should go to `opal@lostopal.com`.
- Decide whether a public phone number is wanted. The current homepage includes a
  telephone number in structured data even though it is not visibly presented.
- Booking and Ko-fi store behavior will be researched and decided later. Design
  placeholders may be built locally without promising unavailable functionality.

## Library and affiliate links

The Library should be a curated resource area rather than a generic storefront.
Possible groups include books, decks, study resources, and tools personally used
or recommended by Opal. Each recommendation can include a short explanation,
appropriate audience/experience level, and external purchase link.

Affiliate programs, disclosures, link wording, and retailer requirements must be
reviewed before affiliate content is published.

## Content management: local Lost Opal Content Studio

Do not hand-code and maintain a separate HTML file for every tarot card, sephira,
planet, sign, or other reference entry.

Build a local-only content editor inspired by a small administrative portal. It
should not be uploaded publicly. The editor should allow Opal to:

1. Choose a collection: Tarot Cards, Sephirot, Astrology, Library, or another
   future collection.
2. Select an existing entry or create a new one.
3. Edit structured fields in a friendly form.
4. Preview the public page using the real website design.
5. Save drafts locally.
6. Mark entries as draft or published.
7. Generate the public static pages and indexes.

Recommended content architecture:

- Store source content as structured JSON or Markdown with front matter.
- Use one template per content type rather than duplicating full HTML.
- Generate SEO-friendly static URLs such as
  `/learn/card-meanings/the-fool/` for publishing to the existing FTP host.
- Keep private working notes separate from public fields so private notes are
  never included in generated website files.
- Keep draft entries out of navigation, search indexes, sitemaps, and search-engine
  indexing until they are published.

Possible Tarot Card fields:

- Name and number
- Slug
- Arcana/suit/rank
- Short meaning
- Full description
- Keywords
- Upright interpretation
- Reversed interpretation (optional)
- Imagery and symbols
- Elemental, astrological, numerological, and Tree of Life correspondences
- Questions for reflection
- Related cards and resources
- Image and alternative text
- Public sources/further reading
- Private working notes
- Draft/published status

The same editor framework can support the ten sephirot, twenty-two paths,
astrological signs, planets, houses, aspects, spreads, books, decks, and future
collections without rebuilding the editor each time.

## Coming-soon strategy

- It is acceptable to build the navigation and page architecture before all
  content is finished.
- Avoid publishing dozens of empty or thin card pages.
- Unfinished entries remain drafts and stay out of the sitemap.
- A polished hub may show one intentional coming-soon message when useful.
- Navigation destinations can be enabled as each area becomes ready.

## Photography

Reserve a flexible portrait/media slot in the About or homepage introduction.
Use the existing Lost Opal artwork until a professional headshot or authentic
working photo is available. Replacing the placeholder later should require only
an image/content change, not a redesign.

Desired future photography may include:

- A clear, warm headshot.
- Hands laying out cards.
- A real reading-table setup.
- A vendor/event setup.
- Detail images of decks, runes, opal, or other tools.

## Suggested implementation phases

### Phase 1: visual foundation

- Create a separate local design prototype so the existing working homepage stays
  intact during exploration.
- Establish color, typography, header/navigation, hero, donation icons, responsive
  behavior, and the top mini-contact treatment.
- Test desktop and mobile before integrating.

### Phase 2: site shell

- Apply the approved design to `working-site/`.
- Add the persistent grouped navigation and page directories.
- Build homepage, Contact, About, and initial hub placeholders.
- Update metadata, sitemap, structured data, and accessibility behavior.

### Phase 3: content studio

- Define the data model.
- Build the local-only editor and page generator.
- Implement Card Meanings first as the proving collection.

### Phase 4: deeper content and services

- Tarot Spreads.
- Tree of Life.
- Astrology.
- Library and affiliate program integration.
- Booking and Ko-fi store decisions.

### Phase 5: verification and publishing

- Review content and links.
- Verify forms and donation destinations.
- Test keyboard, mobile, responsive, and reduced-motion behavior.
- Take a fresh live-site backup.
- Publish only after explicit approval.

## Open decisions

- Final hero and Donations wording.
- Exact reading/service categories.
- Contact form provider and public phone-number policy.
- Booking workflow.
- Ko-fi store role.
- Affiliate programs and disclosure language.
- Tarot interpretation fields and reversed-card policy.
- Tree of Life and Astrology content scope.
- Final headshot/photography.
