# Lost Opal Tarot prototype design notes

Status: active local review  
Prototype version: luminous black-opal alternative  
Last updated: 2026-07-30

## Safety boundary

- This prototype remains separate from the working-site directory.
- The existing working homepage and FTP backups are not edited here.
- The mini-contact form never sends or stores data.
- Unbuilt destinations stay inside the prototype and show a local notice.
- Nothing in this directory should be published without explicit approval.

## Current design thesis

**Mystical in atmosphere. Plainspoken in use.**

This variation does not ask visitors to live in darkness. Sunlit ivory, dawn
peach, pale sky, coral, copper, and full-spectrum opal carry most of the page.
Deep ink and black-plum remain because the light needs contrast, but darkness is
now a chamber visitors move through rather than the permanent atmosphere.

The visual identity grows out of Lost Opal's actual symbolic language: Sacred
Fire, black opal, the classical planets, Hermetic geometry, elemental color,
and handmade devotional objects. Mystery comes from meaningful symbolism and
material character—not generic occult decoration.

## Why this alternative exists

- The emerald-and-antique-gold prototype felt too close to Labyrinthos within
  the shared tarot and learning category.
- The goal is not merely to recolor the same mystical academy interface.
- Lost Opal should read as one person's luminous sanctuary, working table, and
  symbolic practice rather than a school, app, or retail platform.
- The original `../phase-1-prototype/` remains untouched as a comparison point.

## Growing brand architecture

- Lost Opal is the umbrella identity.
- Lost Opal Tarot™ and Lost Opal Astrology™ are sibling branches rather than
  unrelated projects or one giant undifferentiated learning archive.
- Astrology receives its own visible homepage doorway and future top-level
  `/astrology/` content branch.
- The current homepage preview shows the subject map without generating empty
  public pages.
- Detailed architecture, editorial rules, structured fields, and sequencing are
  recorded in `ASTROLOGY_CONTENT_MAP.md`.
- Use one physical folder-based site with optional subdomain doorway redirects;
  do not maintain duplicate copies of the same branches.
- Keep the main Lost Opal homepage as the whole-person front door, with Tarot,
  Astrology, Library, Shop, and a possible Sanctum as distinct deeper rooms.
- Domain and logo reasoning is recorded in `BRAND_ARCHITECTURE.md`.

## Logo direction under discussion

- The master identity remains Lost Opal so future branches do not force another
  complete renaming.
- The working identity hierarchy is `Lost Opal` first, `Tarot & Astrology`
  second, and Hermetic meaning as a quieter symbolic or tertiary layer.
- Hide the solar glyph at the scale of the whole medallion: a large gold outer
  circle, broad black-opal body, and small gold-ringed opal center together form
  the solar circle and point without printing a separate `☉` over the artwork.
- Encode six through the six orbiting planets themselves. Do not draw the
  underlying hexagram or connecting star in the public mark.
- Put the six surrounding classical planets and twelve zodiac signs only in the
  large ceremonial seal.
- Use progressively simpler core, standard, and ceremonial variants so the mark
  remains readable at every size.
- Construct exact symbols and typography deterministically; use generated or
  photographed material only for the opal texture.
- Keep the public seal symbolically balanced. Offer a separate personal mode
  that gently emphasizes the Sun, Mercury as Gemini's ruler, and the Moon as
  Cancer's ruler without changing any traditional position or sequence.
- Begin the zodiac with Aries at the nine-o'clock position and proceed
  counterclockwise through Pisces.
- Put the zodiac on one continuous black-opal collar with slim gold boundaries.
  Do not break that collar into twelve separate stones or seats. Place the exact
  raised-gold signs on a mathematically even ring, beginning with Aries at nine
  o'clock and proceeding counterclockwise.
- Preserve the original crest's broad silhouette, black-opal center, layered
  gilded rings, symmetrical winged filigree, infinity motif, and dominant
  blackletter Lost Opal plaque.
- Place the six surrounding planets as simple raised-gold glyphs on the calm
  textured-black inner field. Remove individual stones, sockets, and connector
  lines. Keep the center Sun small, gold-ringed, and opal-accented.
- Use black opal as precious inlay: the continuous zodiac collar, the small Sun
  point, and a few inherited jewel accents. Do not texture every border, letter,
  or empty space.
- Place the infinity symbol at the literal highest point of the crest so it
  reads as the crown and governing statement rather than another ring detail.
- Do not include a Sulfur–Mercury–Salt cluster in the working logo. The symbol
  group is meaningful, but it asks this mark to explain one system too many.
- Keep `Lost Opal` visually foremost and use only `Tarot & Astrology` as the
  necessary public descriptor. Carry the Hermetic layer implicitly through the
  solar center, seven planets, zodiac, infinity, and crafted gold structure.

## Luminous palette direction

- **Sunlit ivory** — main reading field and spacious foundation.
- **Dawn peach / coral** — Sacred Fire, welcome, motion, and human warmth.
- **Copper** — structure and crafted detail in place of dominant antique gold.
- **Pale sky / opal blue** — breath, clarity, and spectral contrast.
- **Violet / rose / saffron** — full-spectrum planetary and portal variation.
- **Deep ink / black plum** — header, selected tools, and short immersive
  passages only.
- **Emerald** — no longer a structural brand color; green may occur naturally
  inside opal fire or traditional symbolic color correspondences.

## Symbolic art decisions

1. Add an original planetary cosmogram built from luminous black opal, copper,
   and a bright vellum field.
2. Use the Hermetic sevenfold planetary arrangement: Sun in the center, with
   Saturn above, Jupiter upper right, Venus lower right, Moon below, Mercury
   lower left, and Mars upper left.
3. Composite the exact planetary glyphs deterministically into a separate copy
   of the artwork. Keep the original image untouched, avoid generated symbols,
   and describe the full arrangement in the image alternative text and caption.
4. Keep the experimental Rose Cross lamen off the homepage until it can receive
   the serious refinement the symbol deserves.
5. Position the accessible planetary glyphs against measured centers in the
   source artwork rather than approximate percentages.
6. Treat planetary, elemental, alchemical, zodiacal, and Tree of Life imagery as
   a coherent language that can grow throughout later pages.

## Current layout decisions

1. A compact sticky header confirms the brand and keeps Donations visible.
2. The opening behaves as one compact welcome desk: logo, identity, and small
   donation choices on the left; introduction and contact form on the right.
3. On mobile, identity leads into the direct branded donation choices, then the
   combined contact panel.
4. The opening eyebrow reads `Seek the Higher Self`; the main heading reads
   `Lost Opal Tarot & Astrology`; the short promise is `Helping you find
   guidance when life feels dim.`
5. About uses the existing artwork as a deliberately labeled future media slot.
6. Reading options use three distinct paths—live stream, private video, and
   events/other inquiries—but every next step routes through contact.
7. Near the end of the homepage, after the major subject sections, visitors
   receive two onward paths: Library to learn and Shop to find relevant
   materials. This handoff sits immediately before the final invitation.
8. Existing tools and deck descriptions become one accessible tabbed feature
   instead of a long stack of equal cards.
9. Spread styles use a long editorial list to emphasize range without becoming
   a wall of boxes.
10. Ethics and boundaries appear inside `Meet the Work`, before the deeper
    Sacred Fire material, and link to a dedicated local page. The former
    late-homepage ethics section is removed.
11. The dedicated ethics page carries the five current reading principles and
    reserves a primary section for the Reader's Oath without inventing its text.

## Existing content adapted into this preview

- “Lost Opal Tarot is a conversation” / composed-circle introduction.
- Private, friendly, grounded, practical session language.
- Live-stream readings are free and donations are optional.
- Private video reading and event/in-person paths.
- Current deck and tool descriptions: RWS, Order of The Golden Dawn, Thoth, Marseille,
  historical Visconti–Sforza decks, Minchiate, Alchemical Tarot, oracle decks,
  runes, and osteomancy.
- Current spread examples, lightly edited for clarity and consistency.
- A standalone Stones as Living Allies preview with a six-image gallery shell,
  future Library notes, and related Shop materials.
- Adult-only, privacy, consent, no-diagnosis, and no-fear-tactics principles.

## Copy changes made for the prototype

- Long passages were tightened for web scanning.
- Typos and inconsistent capitalization were corrected.
- Predictive-sounding wording was reframed around present choices and momentum.
- Personal and service copy uses first person because this is currently a
  one-person practice. “Lost Opal Tarot” is reserved for naming the brand.
- The original intention and meaning were preserved; this is not final copy.

## Discuss first

- Is the implicit Hermetic layer legible enough to knowledgeable visitors
  without printing `Hermetic Arts` in the logo?
- Is Sanctum a public devotional room, a private/personal area, or only a mood
  word for now?
- Should subdomains be memorable redirects into folders, or should any branch
  eventually retain its own subdomain URL as a technically separate site?
- Should the ceremonial seal contain only the seven classical planets, or ever
  add the modern outer planets outside the traditional planetary ring?
- Should Lost Opal Astrology™ eventually become a top-level navigation item, or
  remain inside Learn until enough material exists?
- Should the first Astrology collection stay with the seven classical planets,
  or introduce the modern outer planets in the same release?
- Which astrological framework should be named as primary: tropical, sidereal,
  or explicitly comparative?
- Which house system should anchor explanations?
- Is Astrology initially an educational archive only, or could readings and
  consultations become a future service?
- Does this page feel illuminated rather than merely "light themed"?
- Is there enough dark contrast left to retain the depth I love?
- Does the planetary section feel like my practice rather than occult
  decoration?
- Should the planetary cosmogram become the primary recurring visual motif?
- How historically exact versus personally reinterpreted should future symbols
  be?
- Is the hero crest now the right size on desktop and mobile?
- Does the hero explanation sound like me, or too polished/corporate?
- Is the parchment contact section too bright, just right, or essential relief?
- Are live stream / private video / events the right three reading categories?
- Should “Roast Me” remain visibly playful among the more serious spreads?
- Does the tool-tab section feel inviting, or like too much information at once?
- How much of the Stones gallery remains on the homepage once its deeper Library
  and Shop pages exist?
- What authentic photo should eventually replace the About artwork?

## Open implementation decisions

- Final contact form provider and success/error behavior.
- Public phone-number policy.
- Final platform mix (Ko-fi, Patreon, or both) and the private-link workflow.
- Final reading prices, durations, and availability language.
- Whether Library, Shop, or both launch first in Phase 2.
- Final hero, donation, and service copy.
- Photography and alternative text.
- Affiliate disclosures and Library structure.

## Editorial commerce guardrails

- Relevant products, advertisements, and affiliate recommendations are allowed.
  They can help a visitor find the exact deck, book, stone, or tool discussed in
  a lesson while creating a reasonable income stream.
- Keep learning useful without requiring a purchase. A recommendation supports
  the lesson; it does not become the lesson.
- Label every advertisement, affiliate relationship, sponsored placement, or
  house product plainly and close to the link.
- Prefer contextual recommendations beside the relevant Library material and
  organized Shop collections over pop-ups, autoplay, or unrelated ad clutter.
- Keep editorial judgment independent. Payment never changes a tarot,
  astrology, spiritual, historical, or ethical conclusion.

## Review shorthand

When discussing the prototype, notes can be captured under:

- **Keep** — already working and should survive integration.
- **Tune** — good direction, but spacing, color, copy, or behavior needs work.
- **Move** — right material in the wrong place.
- **Cut** — not earning its space.
- **Add** — missing content or functionality.
- **Question** — needs an explicit decision before integration.

## Decision log

- 2026-07-30 — Reshape the homepage toward the J & E Woodworking rhythm at the
  level of information flow: establish the person and purpose, make contact
  easy, then invite visitors to browse deeper instead of keeping every subject
  inside one giant scroll.
- 2026-07-30 — Make Library and Shop the two primary next-step cards immediately
  after Contact. Library holds learning and sources; Shop gathers the books,
  decks, stones, tools, and related materials those lessons may call for.
- 2026-07-30 — Give Stones as Living Allies its own full homepage section for
  now, with placeholders for black opal, quartz, obsidian, amethyst, citrine,
  and tourmaline photography. Link the section toward future stone learning and
  related materials.
- 2026-07-30 — Plan for contextual ads, affiliate links, and product
  recommendations as legitimate future income. Keep them relevant, clearly
  disclosed, and subordinate to useful independent learning.
- 2026-07-30 — Increase only the Moon glyph's contrast against the purple fire
  in its opal: optically center a brighter ivory crescent with a restrained
  plum edge. Preserve every other planet and the underlying artwork unchanged.
- 2026-07-30 — Correction: contact-first applies to reading and booking
  inquiries, not donations. Restore direct Ko-fi/Stripe, Cash App, PayPal, and
  Venmo buttons with their real brand marks. Label the primary option `Secure
  Credit Card (Stripe)` and identify Ko-fi as the checkout.
- 2026-07-30 — Set the hero headline to `Tarot & Astrology - Seek the Higher
  Self`. Keep the first-person eyebrow above it and keep `Servant of the Sacred
  Fire` as a later About-section discovery.
- 2026-07-30 — Use `donations`, not `offerings`, throughout public-facing copy.
  Keep the tone generous and plain: live-stream readings are free, donations
  are welcome, and nobody owes me anything.
- 2026-07-30 — Superseded interpretation: make contact the only public next step for readings and
  donations. Send the current Ko-fi, Patreon, payment, or booking link
  personally while the long-term platform mix remains unsettled. This
  supersedes the same-day logo-card experiment below without deleting its local
  assets.
- 2026-07-30 — Reduce the overall vertical scale. Convert the seven oversized
  doorway cards into a compact navigation grid and visually join that grid with
  the planetary chapter.
- 2026-07-30 — Remove the experimental Rose Cross lamen from the homepage. Keep
  the study local for possible future refinement rather than presenting it as
  finished symbolic work.
- 2026-07-30 — Replace the separate browser overlay with a single composited
  planetary PNG. Place the exact glyphs directly on the measured opal centers,
  remove all added black circles and labels, and preserve the unlabeled source
  image unchanged.
- 2026-07-30 — Superseded headline study: open with a normal first-person introduction: `Hi. I’m the
  person behind Lost Opal.` and `I read tarot as a conversation.` Keep `Servant
  of the Sacred Fire` as a deeper discovery in About rather than the hero
  headline.
- 2026-07-30 — Use the actual official Ko-fi, Stripe, Cash App, PayPal, and Venmo
  marks in the donation choices. Make `Secure Credit Card` the primary visible
  option, identify Ko-fi as the checkout, and show that Stripe powers the card
  transaction.
- 2026-07-30 — Present the four donation methods as equal, compact circular
  brand buttons, borrowing the fixed-size icon treatment from the J & E site.
  Keep each service name beneath its circle and strictly contain every logo so
  wide brand artwork can never stretch the donation row.
- 2026-07-30 — Use the official standalone Cash App symbol and Venmo monogram
  inside their donation circles. Do not crop the companies' horizontal
  wordmarks to imitate app icons.
- 2026-07-30 — Dark plum and black-opal panels must set their own light heading
  and body colors explicitly. Never allow the light-theme ink color to inherit
  into a dark section.
- 2026-07-30 — Move ethics and boundaries out of the bottom-of-page position.
  Introduce them within `Meet the Work`, promote their navigation position, and
  create a dedicated local `/ethics/` page with a reserved Reader's Oath area.
- 2026-07-30 — Move the Library/Shop `Continue from here` handoff from directly
  after the opening to the second-to-last public content position, immediately
  before the closing invitation. Let visitors meet the work before presenting
  the deeper destinations.

- 2026-07-28 — Keep all redesign exploration in a separate local prototype.
- 2026-07-28 — Use the existing crest as the hero recognition element.
- 2026-07-28 — Put real donation options immediately after identity on mobile.
- 2026-07-28 — Expand the prototype with adapted content from the current site
  before integrating anything into the working homepage.
- 2026-07-28 — Use first-person voice throughout personal and service copy;
  avoid writing about myself as “Opal” in third person.
- 2026-07-28 — Preserve the emerald prototype and explore the brighter direction
  as a separate local alternative.
- 2026-07-28 — Darkness remains welcome as contrast, but it no longer dominates
  the website's emotional weather.
- 2026-07-28 — Remove emerald as a structural brand color to create clearer
  distance from Labyrinthos.
- 2026-07-28 — Add original black-opal planetary and Rose Cross lamen artwork.
- 2026-07-28 — Use the historically recognized seven classical planets total,
  with the Sun at the center and six planetary forces around it.
- 2026-07-28 — Add Lost Opal Astrology™ as a sibling branch under the Lost Opal
  umbrella and give it a visible homepage preview.
- 2026-07-28 — Plan Astrology at `/astrology/` rather than burying it under the
  earlier `/learn/astrology/` route suggestion.
- 2026-07-28 — Let the Astrology archive grow alongside real study: cite
  sources, distinguish tradition from personal interpretation, and revise
  openly instead of pretending instant mastery.
- 2026-07-28 — Keep one folder-based canonical site and reserve subdomains as
  optional memorable redirects unless a branch becomes a genuinely separate
  application.
- 2026-07-28 — Treat the next logo as a responsive system: solar-opal core mark,
  stable Lost Opal wordmark, branch lockups, and a large ceremonial seal.
- 2026-07-28 — Never generate exact planetary/zodiac glyphs or wordmark text as
  raster AI art; construct and audit them separately, then apply opal material.
- 2026-07-28 — Build the first flat construction proof as a separate local logo
  lab inside the luminous prototype; it does not replace or revise the current
  site identity.
- 2026-07-28 — Treat Sun, Mercury, and Moon as the personal Gemini/Cancer triad,
  expressed as optional emphasis rather than a different planetary system.
- 2026-07-28 — Start Aries at nine o'clock and run the zodiac counterclockwise.
- 2026-07-28 — Remove the visible six-pointed star; the six orbiting planets
  carry the sixfold structure without connecting lines.
- 2026-07-28 — Make `Lost Opal` the central visual focus, with `Tarot &
  Astrology` embedded into the identity rather than relegating the name to the
  outer rim.
- 2026-07-28 — Use `Hermetic Arts` as the current practice descriptor and
  reserve `Hermetica` for material specifically about the historical Hermetic
  writings.
- 2026-07-28 — Consider the alchemical principles Sulfur, Mercury, and Salt as a
  restrained supporting triad.
- 2026-07-28 — Treat the original crest as the visual ancestor rather than
  designing a generic modern astrological seal from scratch.
- 2026-07-28 — Place the zodiac in the original squiggle band immediately around
  the opal; keep the wider filigree available for the six planetary jewels.
- 2026-07-28 — Build Concept 03 as an overlay study on an untouched prototype
  copy of the original crest so placement can be reviewed before any final logo
  artwork is commissioned or generated.
- 2026-07-28 — Cut the Sulfur–Mercury–Salt cluster from the working logo; keep
  the mark focused on Lost Opal, Tarot & Astrology, the solar opal, planets,
  zodiac, infinity, and inherited crest structure.
- 2026-07-28 — Move all six surrounding planets inside the black opal and render
  them as a quiet discoverable layer around the central Sun.
- 2026-07-28 — Keep the original Lost Opal wordmark visually in front of every
  symbolic layer and use `Tarot & Astrology` as the only necessary descriptor.
- 2026-07-28 — Construct the hidden Sun from the entire opal medallion rather
  than placing a small solar glyph on top of it: gold outer circle, black-opal
  body, and gold-ringed opal center.
- 2026-07-28 — Inlay the six exact planetary glyphs with controlled black-opal
  fire inside gold edges; reserve opal for meaningful accents instead of using
  it as an all-over texture.
- 2026-07-28 — Crown the logo with the infinity symbol at its highest visible
  point.
- 2026-07-28 — Render Material Base V1 with open pierced gold filigree replacing
  the former heavy wing-like side masses, an intended twelve-seat zodiac collar
  that rendered with eleven seats, six opal planetary settings, a whole-medallion
  hidden Sun, the infinity crown, and a blank lower plaque reserved for exact
  `Tarot & Astrology` typography.
- 2026-07-28 — Audit Render V1, catch its eleven-seat zodiac collar, and create
  Render V2 with the missing twelfth blank setting restored at six o'clock while
  preserving the open filigree, six opal settings, wordmark, crown, and plaque.
- 2026-07-28 — Correct the six inner planet settings in Render V3 to a true
  orbital hexagon: one alone at twelve o'clock, one alone at six o'clock, and
  one on each upper-left, upper-right, lower-left, and lower-right diagonal.
  Do not flatten them into two horizontal rows.
- 2026-07-28 — Add the twelve exact zodiac glyphs to V3 as a deterministic
  browser layer rather than generated marks: Aries at nine o'clock, followed
  counterclockwise by Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio,
  Sagittarius, Capricorn, Aquarius, and Pisces.
- 2026-07-28 — Replace the zodiac collar's white interiors with black-opal inlay,
  optically center the exact gold glyphs, and add all six exact classical planet
  glyphs to their inner settings: Saturn at top, Moon at bottom, Mars and Jupiter
  upper-left/right, Mercury and Venus lower-left/right.
- 2026-07-28 — Rebuild the underlying zodiac collar for V5 as twelve identical
  black-opal bezels evenly spaced at thirty-degree intervals; position exact
  glyphs against those measured centers instead of compensating for irregular
  generated sockets.
- 2026-07-28 — Calm the silhouette by removing the outermost long scroll loop
  and two small opal beads on both sides. Preserve the large side medallions and
  the shorter inner filigree that frames the solar seal.
- 2026-07-28 — Set `Tarot & Astrology` exactly in the lower plaque for the current
  review. Keep `Esoterica` as the leading one-word umbrella candidate;
  `Divination` is clearer but narrower, while `Arcana` is evocative but less
  descriptive. Do not replace the public descriptor until explicitly chosen.
- 2026-07-29 — Center the exact planet glyphs with individual optical offsets
  rather than trusting their unequal font advance boxes. Keep the reliable
  accessible text layer instead of a canvas-only symbol layer.
- 2026-07-29 — Restyle `Tarot & Astrology` in locally bundled UnifrakturCook
  blackletter so the lower plaque belongs to the main `Lost Opal` wordmark.
  Retain the font's OFL license with the prototype asset.
- 2026-07-29 — Replace the zodiac bezels' opal interiors with the same deep
  textured black used behind the `Lost Opal` wordmark. Keep opal reserved for
  the central solar body, the six inner planet settings, and inherited accents.
- 2026-07-29 — Restore the original logo's sharp lightning-fracture character to
  the main black opal and remove galaxy/nebula cues. Render every exact zodiac
  and planet glyph in solid high-contrast gold so no symbol disappears into its
  material background.
- 2026-07-29 — Move the opal hierarchy outward for Render V7: one continuous
  black-opal zodiac collar, one calm black inner field, six simple raised-gold
  planets with no individual settings, and one small opal-accented Sun.
- 2026-07-29 — Rebuild the twelve zodiac coordinates from a single symmetrical
  ring and give every glyph its own optical correction. Apply the same measured
  centering method to the six planets on their true hexagonal orbit.
- 2026-07-30 — Present Minchiate as its own 97-card system rather than grouping
  it under historic systems. Keep Visconti–Sforza as the historical-deck example.
- 2026-07-30 — Title the planetary-symbol section `Seven Astral Lords`, replacing
  the generic `The sky belongs here.` heading.
- 2026-07-30 — Give the Sacred Fire reveal dark plum body type and a stronger
  ember accent so the complete title remains readable on the luminous ground.
- 2026-07-30 — Rename the Sacred Fire reveal from `Further in` to `My role` and
  explain the phrase as service to the Sacred Fire of mankind, beginning with
  the person directly in front of me and preserving their agency.
- 2026-07-30 — Add a restrained gold, cyan, and ember glow behind donation
  options on hover and keyboard focus while preserving the circular brand marks.
- 2026-07-30 — Update the compact header lockup from `Tarot` to
  `Tarot & Astrology`, tightening the small-line tracking so it remains balanced
  with the `Lost Opal` wordmark and crest.
- 2026-07-30 — Add a low-contrast celestial wallpaper across the long homepage:
  all twelve zodiac signs, the seven classical planetary glyphs, four elemental
  alchemical signs, sparse star points, and very slow edge drift. Keep the field
  decorative, pointer-free, reduced-motion-safe, and away from primary reading
  columns so the page feels alive without sacrificing legibility.
- 2026-08-02 — Replace the crest-based media placeholder in Meet the Work with
  the supplied `20260801_234127` public-reading photograph. Use only this more
  centered, direct-gaze frame in the layout; keep it local to the Phase 1
  prototype.
- 2026-08-02 — Reframe the Sacred Fire copy around the reader taking their seat
  at the table. Describe the role as listening, sharing what I have learned, and
  helping the reader recognize and move toward mastery of their own inner fire.
- 2026-08-02 — Close the Sacred Fire definition by naming the larger role
  directly: `A servant of the Sacred Fire within humanity.`
- 2026-08-02 — Preserve the reader's exact two-sentence blessing statement:
  `My goal is to be a blessing to those around me. To help each of us find the
  Higher Self within and without.`
- 2026-08-02 — Identify the reader directly beneath the supplied photograph with
  a three-line caption: `Meet Opal`, `Reading in the wild`, and
  `Public tarot · conversation across the table`.
- 2026-08-02 — Give mobile visitors a donation-first entrance because existing
  event and table QR codes resolve to the homepage. Move the full donation panel
  to the top of the mobile hero, retain it contextually beneath reading options
  on desktop, and add a persistent mobile support bar with direct Card, PayPal,
  Cash App, and Venmo choices. Replace the desktop nav donation CTA with
  `Request a Reading` so the professional private-reading path leads there.
- 2026-08-02 — Expand the Meet the Work introduction beyond a Tarot-only
  identity. Present Tarot and Astrology as the primary working languages while
  leaving honest room for the broader esoteric field: numbers, stones, Hermetic
  thought, planetary and alchemical symbolism, and their connecting patterns.
  Center the invitation on those seeking the hidden gem within themselves and
  retain `I do not sell revelations; I host them.` as the closing statement.
- 2026-08-02 — Tighten that introduction in the reader's own words: name
  `astrology, tarot and other esoteric tools of study` together without trying
  to inventory the entire future scope of Lost Opal. Frame them as doors into
  conversation with the Higher Self and keep cards, numbers, stars, and symbols
  as the concrete listening language.
- 2026-08-02 — Capitalize `Astrology` and `Tarot` in that introduction as the
  two named primary disciplines of Lost Opal.
- 2026-08-02 — Broaden the homepage's emotional and commercial range without
  weakening its ethics. Recast the reading options as three equal, explicit
  paths: private readings; parties, corporate events, weddings, festivals, and
  other gatherings; and free public/live readings supported by donations.
- 2026-08-02 — Replace the hero promise with `Tarot for reflection,
  celebration, and the road ahead.` so the first screen holds private insight,
  social enjoyment, and future-facing work at once.
- 2026-08-02 — Combine mysticism and professionalism in one compact black-opal
  `How I Read` panel rather than adding another oversized homepage chapter.
  State that the past reveals roots, the present reveals patterns, and the
  future reveals possibilities rather than fixed fate. Explicitly allow Tarot
  to be profound, strange, playful, surprising, or simply memorable while
  retaining a clear four-step process and adult-services note.
- 2026-08-02 — Revise the hero explanation in the reader's words to name `the
  pleasure of bonding while we turn a card together`, removing the earlier
  `unexpected pleasure` phrasing.
- 2026-08-02 — State the service area without a map: in-person work throughout
  Greater Phoenix, with nationwide availability for remote readings and select
  travel. Keep the information compact within the contact panel.
- 2026-08-02 — Keep the public site email-first until a dedicated business line
  is ready. Add `Request a Call` beside the contact options and as a desktop nav
  button; it preselects a call request and collects the visitor's phone number
  without publishing the reader's personal number. Do not advertise texting
  until two-way replies can reliably come from the same business line.
- 2026-08-02 — Make the local contact form prepare a complete email addressed to
  `opal@lostopal.com`, including inquiry type, optional location, optional phone,
  and the exact prompt `How may I serve?`. A phone number becomes required only
  for call requests. The visitor reviews the message in their own email app
  before sending; a hosted form endpoint can replace this later.
- 2026-08-02 — Reverse the call-request experiment after reviewing it in layout.
  Remove both call buttons, the call inquiry, phone and preferred-time fields,
  and the redundant email/call pills. Keep the form deliberately email-first,
  balanced in two columns, and keep only `Request a Reading` as the header CTA.
- 2026-08-02 — Replace the visible `Home` nav label with the familiar `⌂` house
  glyph in a small gold solar medallion. Preserve an accessible `Home` label and
  title so the visual treatment feels esoteric without making its function
  obscure.
- 2026-08-02 — Plan distinct production roles for the remaining contact links.
  Keep the compact homepage form as the quickest conversion path and let the
  header `Request a Reading` CTA reach that form. When built, point the ordinary
  `Contact` nav link to a crawlable `/contact/` page containing complete inquiry,
  service-area, event, response-time, and email information. On interior pages,
  `Request a Reading` can point to the contact page with the reading inquiry
  preselected. The brand lockup and house medallion always return to `/`.
- 2026-08-02 — Match the existing J & E contact delivery method without changing
  J & E: submit Lost Opal inquiries through FormSubmit's free AJAX endpoint for
  `opal@lostopal.com`, include the same hidden honeypot and a Lost Opal-specific
  subject, and show real sending, success, and failure states. Do not fall back
  to opening the visitor's email application.
- 2026-08-02 — Restore call requests as a conditional form choice rather than a
  header or contact CTA. A `Request a call?` checkbox reveals phone number and
  best-time fields; both stay hidden, disabled, and optional until checked, then
  become visible and required.
- 2026-08-02 — Rework form legibility after screenshot review: give text fields,
  the select, and the message area a subtle light-gray fill, complete border,
  comfortable internal padding, rounded corners, and a clearer plum focus ring.
  Keep the conditional call fields evenly spaced in their own two-column row.
- 2026-08-02 — Return donation options to their original DOM position directly
  beneath the homepage's main introductory copy on both desktop and mobile. The
  broader hero now establishes private, public, and event work before asking
  for support, so the donation choices no longer need to be deferred beneath
  the service cards or pulled above the mobile introduction. Retain the sticky
  mobile support bar, title the inline panel simply `Donations`, and clarify
  that both public and live-stream readings are free.
- 2026-08-02 — Use the reader's exact service-area labels in the contact panel:
  `Greater Phoenix Area, Arizona, USA` for in-person work and `Contact for
  details!` beneath `Available nationally`.
- 2026-08-02 — Restore the visitor's default email application strictly as the
  failure fallback for FormSubmit. Normal submissions still go directly through
  FormSubmit; only a rejected or unreachable request opens a fully populated
  message containing every completed form field so the inquiry is not lost.
- 2026-08-02 — Collapse the `Request a call?` control from a full-width form
  panel into a compact, content-width inline row. Keep its helper sentence on
  the same line on larger screens and allow a tidy two-line stack only on small
  phones.
- 2026-08-02 — Order the three ways to work as `Public & Live Readings`,
  `Private Readings`, then `Events & Gatherings`, renumbering them 01–03 and
  matching the introductory sentence to the same hierarchy.
- 2026-08-02 — Add a very small trademark superscript to `Seven Astral Lords`
  and normalize every visible trademark mark across the homepage and Ethics
  page as a quiet, low-opacity superscript. Keep the Seven Astral Lords mark
  smaller still so no ™ competes with the name it protects.
- 2026-08-02 — Add `© 2025–[current year] Lost Opal. All rights reserved.` to
  the homepage and Ethics footers. Treat 2025 as the fixed establishment year
  and generate the ending year from the visitor's current date, collapsing to a
  single year if viewed during 2025.
- 2026-08-02 — Remove the full Lost Opal Astrology™ learning roadmap from the
  homepage and make `/astrology/` a real standalone learning hub. Keep Astrology
  grouped beneath Learn in navigation, but let its six current doorways use
  working on-page anchors until complete reference collections justify child
  pages. Preserve Seven Astral Lords™ on the homepage as shared symbolic work;
  defer the relationship between Astrology and the broader Tarot & Tools section
  until that content architecture is discussed separately.
- 2026-08-02 — Remove the complete `Stones as Living Allies` gallery from the
  homepage and establish `/crystals/` as the dedicated Crystal Work route. Keep
  `Stones & crystal work` under Learn in desktop and mobile navigation. Preserve
  the six-stone gallery as a working page foundation, distinguish symbolic use
  from medical claims, and leave deeper reference entries, real photography,
  sourcing guidance, and shop integration for later development.
- 2026-08-02 — Retire the miniature opal image used as the header logo across
  the homepage and interior prototype pages. Until the primary logo is resolved,
  use a typography-first Lost Opal lockup with a narrow solar thread as its only
  accent. Replace the font-dependent `⌂` navigation character with a precisely
  centered CSS house silhouette inside the existing solar medallion.
- 2026-08-02 — Broaden the homepage promise from Tarot alone to `Insights for
  reflection, celebration, and the road ahead.` Describe the work as readings
  and insights for private, public, and event settings, making room for mystery,
  possible futures, companionship, and convening with the energy of the cosmos.
- 2026-08-02 — Calm the standalone Astrology page after screenshot review: keep
  its opening artwork fully visible at a restrained maximum size, reduce the
  headline and header scale, and let the complete first viewport orient the
  visitor instead of presenting a cropped billboard. Keep the full learning hub
  local while its meanings and sources are written. Prepare a separate
  `astrology/coming-soon.html` and serve that file at the public `/astrology/`
  route during the initial launch; the workshop remains private until the owner
  explicitly approves its publication.
- 2026-08-02 — Bring the Ethics page navigation into the shared interior-page
  system: dark plum header, solar-thread wordmark, centered geometric Home
  control, compact contextual links, and the gold `Request a Reading` action.
  Do not leave Ethics as the lone light-header exception.
- 2026-08-02 — Replace the mistaken `Golden Tarot` tool entry with `Order of The
  Golden Dawn`. The decorative Golden Tarot deck is a Visconti-style deck, not
  the Hermetic system previously assumed. Describe the Golden Dawn as a current
  of study connecting Tarot, Astrology, Qabalah, color, and elemental symbolism,
  rather than misidentifying it as a particular deck.
- 2026-08-02 — Rebuild the flat tools list as a five-branch practice browser in
  this order: Tarot, Astrology, Oracle, Runes, and Osteomancy. Keep Tarot as the
  largest visible room and preserve its interactive deck/system browser. Add
  explicit lanes for Qabalistic Tarot, Order of The Golden Dawn, O.T.O., and
  B.O.T.A.; do not treat those organizations, currents, correspondences, and
  decks as interchangeable. Point Astrology into its real local learning hub.
  Give Oracle, Runes, and Osteomancy compact subtopic maps now so each can grow
  into a dedicated, properly structured section or page later.
- 2026-08-02 — Present the donation language as a compact ethical promise rather
  than ordinary supporting copy. State that public and live-stream readings are
  free, visibly emphasize `you owe me nothing`, and follow it with `I do not hold
  money in my heart.` in a warmer secondary voice. Keep this callout restrained
  in size and leave the four direct donation choices unchanged.
- 2026-08-02 — Keep the persistent donation control visible at every viewport,
  including a maximized desktop window, but reduce it to a slim floating strip.
  Frame the action as a voluntary thank-you after receiving a free reading—not
  payment for access—with `Enjoyed your free reading? Donate if it helped.` and
  `Always optional`. Replace the ambiguous heart-only control with an explicit
  `Donate` label while retaining the direct payment choices in the opened tray.
- 2026-08-02 — Separate the overall reading practice from Tarot layouts. Broaden
  `How I Read` to explain questions about love, work, family, creativity,
  personal growth, present energy, past roots, and possible futures, alongside
  custom Tarot work, Astrology charts and cycles, mythology, art, numbers, and
  symbolism. Rename `Spread styles` to `Reading Styles` and nest that compact
  list inside the Tarot practice chapter. Move Lenormand and Grand Tableau into
  Oracle rather than presenting them as Tarot, and keep the homepage overview
  centered on synthesis rather than any one tool.
- 2026-08-02 — Correction: `Reading Styles` belongs in Learn as its own page,
  not inside the homepage Tarot chapter. Create `/learn/reading-styles/`, move
  the full Tarot spread material there, place its navigation entry under Learn,
  and retain only a compact learning-page doorway inside the Tarot practice
  chapter. Keep the broad `How a reading takes shape` explanation on the
  homepage because it describes the complete service rather than Tarot alone.
- 2026-08-02 — Remove the visible `Local design review / Now we decide what
  stays` scaffold from the homepage. Design review remains an internal process
  recorded in these notes; it is not visitor-facing site content. Let the real
  closing invitation lead directly into the footer.
- 2026-08-02 — Retire the CSS-drawn Home glyph after repeated optical-centering
  problems. Replace it across the local prototype with a generated, purpose-built
  black-opal medallion: one centered gold house, a sparse dark opal field, and a
  restrained gold rim. Keep it legible at navigation size and avoid additional
  symbols or filigree.
- 2026-08-02 — Remove `Why so many?` from the Tarot tab browser because it
  describes the complete Lost Opal practice rather than a Tarot deck, lineage,
  or system. Let Rider–Waite–Smith become the browser's first active entry.
  Preserve the larger idea as a compact `A council at the table` note inside
  the broad reading-process panel, naming decks, charts, crystals, and systems
  as different voices available to the question.
- 2026-08-02 — Preserve the first black-opal Home medallion as v1, but revise
  the active navigation mark into a place of learning: a compact Roman temple
  or library threshold with one gold pediment, exactly two gold columns, and a
  dark open doorway. Keep the surrounding black-opal cabochon and gold rim so
  the symbol still reads as Home while also suggesting entry into the work.
- 2026-08-02 — Until a dedicated Lost Opal shop is built, route every active
  `Shop` doorway directly to the Lost Opal Ko-fi shop in a new tab. Keep the
  future first-party shop represented in the information architecture without
  leaving visitors at an unfinished local placeholder.
- 2026-08-02 — Never spend a full route on filler for a planned room. Library,
  Card Meanings, Tree of Life, and every future unbuilt destination should stay
  on the current page and open one polished black-opal `Coming Soon!` threshold
  instead. Preserve each planned path as page metadata so the real route can be
  restored cleanly when its content exists.
- 2026-08-02 — Restore the original black-opal header cutout from the old main
  logo across every prototype page. The luminous opal, gold ring, and restrained
  glow carry the identity more clearly than the temporary solar-thread glyph;
  keep the accompanying Lost Opal Tarot & Astrology wordmark unchanged.
- 2026-08-02 — Establish a reusable v1 planetary cabochon family rather than
  repeatedly cropping symbols from larger compositions. Build seven matched
  black-opal icons and seven matching white-opal icons for the Moon, Mercury,
  Mars, Saturn, Jupiter, Venus, and Sun. Use the Moon's restrained illuminated
  glyph as the style master, keep every symbol optically centered, make the Sun
  the same compact scale as the other luminaries, and use one uninterrupted
  gold bezel with no studs. Store the final artwork as interchangeable 512 × 512
  transparent PNGs under `assets/planetary-cabochons/v1/`; do not install the
  family into the site until its actual placements are designed.
- 2026-08-02 — Preserve the original white-opal icon family and add a sibling
  `white-opal-outlined` variant for stronger small-size legibility. Give only
  the illuminated planetary glyphs an extremely fine near-black charcoal
  keyline; retain their pale core and rose-gold glow, the white-opal material,
  the uninterrupted stud-free bezel, and the compact circle-and-dot Sun. Keep
  the outline closer to engraved definition than a heavy graphic stroke.
- 2026-08-02 — Change the contact-message invitation from the generic `A short
  message is perfect.` to `Speak and be heard. ♡`. Use the quiet outlined heart
  rather than a typed `<3` or decorative flourish so the field remains warm,
  direct, and professional.
- 2026-08-02 — Tighten the desktop donation introduction so its left title is
  vertically centered against the optional-donation promise rather than hanging
  along the card's bottom edge. Pull the title upward, reduce the section's top
  padding, and keep only a small deliberate gap before the payment buttons to
  shorten the page without crowding the donation choices.
- 2026-08-02 — Retire the separate Astrology, Crystal Work, Ethics, and Reading
  Styles header systems. Every visitor-facing prototype route now uses the same
  primary Lost Opal navigation as the homepage: identical opal wordmark, Home
  medallion, Readings and Learn menus, Library, Shop, About, Contact, reading
  request action, breakpoint, and mobile drawer. Use active context inside the
  shared menus rather than replacing the global navigation with page anchors.
  Keep the shared header sticky at the true viewport top so page artwork never
  appears in an artificial strip above it after the prototype notice scrolls
  away.
- 2026-08-02 — Replace the flat plum form button and persistent donation dock
  with one restrained black-opal control treatment: near-black glassy depth,
  small blue-teal and violet fire, a fine warm-gold edge, and a controlled opal
  glow on hover or focus. Keep the effect material and dimensional rather than
  turning every control into a noisy galaxy texture; preserve the brighter gold
  action pill inside the donation dock as the immediate visual instruction.
- 2026-08-02 — Extend that restrained black-opal material into the shared
  navigation itself. Use near-black depth, quiet blue-teal and violet fire, and
  a thin gold lower edge on the sticky header, dropdowns, and mobile drawer so
  navigation belongs to the same visual system as the primary controls without
  sacrificing text contrast or turning into a galaxy banner.
- 2026-08-02 — Give Contact a real local route at `/contact/` while retaining
  the compact homepage form. The dedicated page becomes the central hub for
  readings, events, general questions, collaborations, future affiliate work,
  YouTube, and Twitch. All global Contact links now open that page, and booking
  links land directly on its working form; the form still sends through
  FormSubmit and preserves the mail-app fallback. The confirmed social profiles
  are YouTube `@LostOpalTarot`, Twitch `lostopaltarot`, TikTok `@lostopaltarot`,
  and Instagram `lostopaltarot`. Clearly label any future affiliate relationship,
  keep the Greater Phoenix and national service language, and add neither a map
  nor a public phone number without a later decision.
- 2026-08-02 — In-page donation links must scroll the document, never a hidden
  section scroller. The homepage hero still clips its decorative ambient art,
  but uses `overflow: clip` instead of `overflow: hidden`; this prevents direct
  `#donations` navigation from silently scrolling the hero box and trapping its
  opening content above an unreachable internal boundary.
- 2026-08-02 — Install the finished v1 black-opal cabochons into the Seven
  Astral Lords diagram as reusable transparent layers rather than regenerating
  its planetary glyphs. Preserve the existing copper geometry as the foundation,
  cover the six older outer settings with the matched Saturn, Mars, Jupiter,
  Mercury, Venus, and Moon cabochons, and replace the pale center with the
  matching black-opal Sun while retaining the surrounding solar mandala. Keep
  every position tied proportionally to the square artwork so the alignment
  survives responsive scaling and future icon-family revisions.
- 2026-08-03 — Retire the repeated stone body inside the v1 cabochon family.
  Build v2 with a genuinely distinct opal field for Moon, Mercury, Mars,
  Saturn, Jupiter, Venus, and Sun in both black-opal and white-opal materials;
  propagate the matching unique white fields into the outlined-white family.
  Preserve the approved glyph geometry, centering, scale, transparent canvas,
  and uninterrupted stud-free bezel. The homepage diagram now consumes v2,
  while v1 remains intact as the recoverable original family.
- 2026-08-03 - Reverse the repeated black-opal surface treatment across global
  interface controls. Material identity should come from hierarchy and contrast,
  not from placing the same simulated stone texture everywhere. Keep navigation
  quiet and ink-like; give `Request a Reading` a distinct solar-gold capsule;
  render form-submit actions as restrained black lacquer with a warm metal edge;
  and give the persistent donation dock its own deep Jupiter/olive-green field
  with a clear gold Donate control. Opal color remains strongest in artwork,
  cabochons, and select identity marks rather than every functional surface.
- 2026-08-03 - Reintroduce black opal to high-value actions through dedicated
  image materials derived from the approved Sun cabochon, not a repeated CSS
  gradient. Reading and form buttons use a warm ember-and-gold field with a dark
  center for clear labels; the persistent donation dock uses a separate diagonal
  emerald, cobalt, and gold composition with a quiet text zone. Keep the main
  navigation ink/plum and untextured so these controls remain distinct. Variance
  should come from the opal composition, crop, and overlay rather than recoloring
  one identical surface for every role.
- 2026-08-03 - Begin a reversible Celestial Black Opal homepage theme study.
  Black is the foundation, internal opal fire supplies living color, warm gold
  provides structure, and ivory carries primary text. Keep section surfaces
  translucent enough for a fixed scroll-reactive sky to remain perceptible,
  while using near-black glass panels behind long copy and forms. The sky moves
  stars and irregular gaseous clouds gently downward with page scroll, limits
  density on narrow screens, and becomes static under reduced-motion settings.
  Preserve pale astronomical artwork as intentional illuminated ceremonial
  plates rather than inverting it. The theme lives in its own stylesheet and
  motion file so the earlier luminous study remains recoverable; extend it to
  secondary pages only after the homepage direction is reviewed.
- 2026-08-03 - The celestial canvas must never animate continuously while the
  page is idle. Render only while scroll position is changing, then settle and
  release the frame loop. Keep the canvas non-interactive and explicitly retain
  vertical pan behavior so the atmosphere cannot compete with basic navigation.
- 2026-08-03 - Combine `How a reading takes shape` and `Seven Astral Lords` into
  one reading framework. Begin with the visitor's lived question, explain Tarot,
  Astrology, and the wider symbolic vocabulary as interpretive tools, then make
  the classical planetary currents the visual and conceptual center of the
  process. Keep both `#what-to-expect` and `#symbolic-cosmos` as working anchors.
  The planetary wheel now sits beside a five-step table process and is explicitly
  reserved for accessible hover/focus overlays on desktop and tap disclosures on
  touch devices in the next design pass.
- 2026-08-03 - Make the Seven Astral Lords diagram genuinely explorable. Each
  cabochon is now a keyboard-focusable control with a concise Lost Opal reading
  of that planet's current; hover and focus preview the meaning, while click or
  tap pins it for unhurried reading. A pinned insight closes through its close
  control, Escape, a second activation, or a click outside the diagram. Keep the
  language introductory and practical so these are invitations into the future
  library rather than attempts to contain a complete planetary doctrine.
- 2026-08-03 - Begin assigning the cabochons their planetary color identities
  instead of treating every astral body as black opal. Keep Saturn as the
  black-opal anchor; render Mercury in luminous orange opal, Venus in emerald-
  green opal, and the central Sun in radiant yellow opal. Leave the remaining
  planet materials unchanged until their own color correspondences are reviewed.
- 2026-08-03 - Restore breathing room between the three reading paths and the
  combined reading/cosmos chapter. Replace the one-pixel card seam with a real
  responsive gap, remove the unexplained upward lift from the private-reading
  card, and increase the chapter break before `How a reading takes shape`.
  Preserve the three distinct card atmospheres without making them collide.
- 2026-08-03 - Collapse the homepage footer into one compact reading flow.
  Keep the trademark line, reflective-reading disclaimer, and copyright together
  at the left. Remove the redundant `Local review copy · Not published` message
  from prototype footers because the banner at the top already communicates that
  status. Allow the trademark line to wrap cleanly on small screens without
  introducing horizontal overflow.
- 2026-08-03 - Replace the abstract diamond medallion above the final invitation
  with a warm cursive neon message: `When you are ready…`. Let the orange-gold
  tube glow pick up small rose and turquoise echoes from the black-opal palette,
  while keeping the lettering calm, legible, and distinct from the opal-textured
  action buttons below it.
- 2026-08-03 - Remove the false `footer gap`, which was actually 136 pixels of
  bottom padding inside the closing invitation before the footer began. Retain
  48 pixels of breathing room after the closing actions on both desktop and
  mobile so the invitation still resolves cleanly without becoming a dead band.
- 2026-08-03 - Give visitors an explicit escape from the persistent donation
  reminder. Add a small, accessible close control to the floating dock and keep
  it dismissed for the remainder of that browser session. The full Donations
  section remains available, and mobile bottom padding collapses with the dock
  so dismissing it does not leave a phantom gap.
- 2026-08-03 - Restore the roaming zodiac, planetary, and alchemical glyphs as
  a visible part of the black-opal atmosphere. The dark theme had accidentally
  buried their wallpaper layer beneath the page sections; move it above the dark
  glass surfaces, preserve non-interactivity, and use violet, cyan, and amber
  glows at restrained but readable opacity. Keep the mobile layer quieter.
- 2026-08-03 - Recast the interior of the Seven Astral Lords diagram as a living
  black-opal vortex inspired by the converging color currents in the supplied
  `On the Matter of Names` artwork. Use a procedural canvas to draw cyan, green,
  gold, fire, rose, and violet filaments spiraling toward the central Sun while
  preserving the copper foundation and interactive cabochons above it. Animate
  only while the diagram is near the viewport, throttle the rendering, pause in
  hidden tabs, and provide a static composition for reduced-motion visitors.
- 2026-08-03 - Reject the first vortex pass as too string-like and remove the
  parchment foundation image entirely. Rebuild the field as broad overlapping
  nebula clouds and Milky-Way-like star dust that slowly spiral toward the Sun.
  Redraw only restrained copper rings, spokes, and orbital geometry directly on
  the canvas so the planets retain structure without restoring the pale plate.

- 2026-08-03 - Make the shared homepage/contact footer full-bleed across the viewport while keeping its text aligned to the standard page shell.
- 2026-08-03 - Replace the ethics checkpoint's surviving cream pill with the shared black-opal button material, keeping its gold rim and high-contrast label.
- 2026-08-03 - Keep the official black Powered by Stripe badge legible on the dark theme by mounting its transparent SVG on a compact light payment-label plate.
- 2026-08-03 - Replace the Ethics page's five-item preview and oath placeholder with an original, comprehensive Lost Opal code of practice and Reader's Oath. Keep the page restrained and ethics-only; distinguish private from public-reading privacy, retain clear routes back to the homepage/readings/contact, and credit Anthony Louis's *Llewellyn's Complete Book of Tarot* as an influence without reproducing its prose.
- 2026-08-03 - Revise the Ethics copy away from repetitive polished triads and unnecessary em dashes. Use real bullet points where a group is being stated, make the Reader's Oath sound spoken rather than generated, and use "theology" rather than "religion" in the belief boundary.
- 2026-08-03 - Compact the Ethics page's vertical rhythm. Keep the short-version kicker with its heading, vertically center the right-hand summary against the left, and remove the large doubled padding between the summary, code, oath, source, and return sections.
- 2026-08-04 - Bring the homepage atmosphere into the Ethics page with the shared animated black-opal sky, a restrained zodiac/planetary/alchemical wallpaper, and subtle opal light around the hero and Reader's Oath. Keep all decoration behind the document so the code remains direct and readable.
- 2026-08-04 - Remove the local-design-prototype banner from every prototype page. Localhost already communicates the review context, so the shared navigation should be the true top of the experience.
- 2026-08-04 - Begin the dedicated mobile refinement by removing the oversized reading CTA from the narrow header, labeling the hamburger control "NAV," and retaining Request a Reading as a full-width action inside the drawer. Keep the desktop header unchanged.
- 2026-08-04 - Promote Ethics from the Readings dropdown to a top-level navigation item immediately after Readings on desktop and mobile. Keep the active state visible on the Ethics page.
- 2026-08-04 - Restore the black-opal reading CTA to the mobile header with responsive copy: "Get a Reading" on ordinary phones and "Reading" on very narrow screens. Preserve the full "Request a Reading" wording on desktop and keep the labeled NAV control beside it.
- 2026-08-04 - At widths below 360px, reduce the header brand to its opal mark so the compact Reading CTA and labeled NAV control remain fully visible rather than clipping.
- 2026-08-04 - Make donation-reminder dismissal last only for the current page load. A normal refresh should restore the floating donation bar on desktop and mobile.
- 2026-08-04 - Replace refresh-reset dismissal with a respectful persistent reminder. The full donation bar appears on a fresh visit; closing it collapses it into a small black-opal Donate chip for the current tab session; the chip can restore the full bar; and choosing a donation option keeps the reminder compact for the rest of that calendar day.
- 2026-08-04 - Rebuild the Tarot browser as three compact shelves. Modern
  Foundations contains Rider–Waite–Smith, Golden Dawn, Thoth, and the modern
  Minchiate deck used in this practice. Orders & Esoteric Languages contains
  Qabalistic Tarot, B.O.T.A., O.T.O., and Alchemical Tarot. Historic Deck
  Traditions gives Tarot de Marseille, Sola Busca, and Visconti–Sforza distinct
  entries instead of hiding them behind a generic Historic Decks label. Remove
  the awkward `The largest room` kicker from the Tarot heading.
- 2026-08-04 - Remove Lenormand and the Grand Tableau from the Oracle summary.
  Present them together in a compact, full-width card below the primary practice
  sections because Lenormand has its own combinations, houses, and reading
  structure rather than functioning as a subtype of Oracle.
- 2026-08-04 - Remove the oversized blank ending on mobile. The page was
  reserving donation-dock clearance twice: once below the entire body and again
  inside the footer. Let the footer alone clear the fixed reminder, reduce that
  clearance to the reminder's actual height, and retain a smaller allowance when
  the reminder is collapsed so the page terminates in the footer rather than an
  empty black band.
- 2026-08-04 - Rebuild the practice map as seven distinct doors in this order:
  Tarot, Astrology, Numerology, Oracles, Lenormand & Grand Tableau, Runes, and
  Osteomancy. Keep Tarot as the detailed primary chapter and Astrology as the
  wide secondary branch. Present the remaining five as a smaller, consistent
  card field so their languages stay visible without competing with the two main
  areas or turning the homepage into another endless corridor.
- 2026-08-04 - Describe the Library as Lost Opal's academic heart and connect
  the Shop to tools and materials for understanding the Magnum Opus, or Great
  Work. Keep these as two paragraphs rather than flattening both ideas together.
- 2026-08-04 - Tighten the transition from the Library and Shop into the final
  invitation. Both adjoining sections were contributing large vertical padding,
  creating a broad strip of empty sky before the neon message. Keep the visual
  breath, but let the invitation arrive before the visitor files a missing-person
  report for the rest of the page.
- 2026-08-04 - Reframe the contact-page partnership block as Affiliates. Lead
  with honest, hand-picked product and service recommendations related to the
  craft instead of opening with legalistic future-disclosure language.
- 2026-08-04 - Give the Contact page one unified social hub. Keep the large
  doorway cards for inquiries, then present YouTube, Twitch, TikTok, and
  Instagram together with their official circular marks inside the shared
  black-opal visual system.
- 2026-08-04 - Launch the reviewed black-opal redesign at `lostopal.com` from a
  clean public package. Make Home, Contact, and Ethics indexable; retain uniform
  noindex Coming Soon pages for unfinished learning rooms; and exclude the logo
  lab, source art, draft content, and internal design documents from FTP.
- 2026-08-12 - Replace the uneven seven-door practice map and its long stack of
  chapters with seven equal, centered tabs controlling one shared explorer.
  Keep all seven doors in one row on wide screens and make that row horizontally
  swipeable at narrower widths. Preserve the detailed Tarot browser inside its
  panel, give every other discipline a concise explanatory panel, and expand
  Astrology to cover natal analysis, transits and significant dates, solar and
  planetary returns, relationship charts, and electional timing. The Astrology
  learning center remains Coming Soon; the homepage explanation is available now.
- 2026-08-12 - Consolidate donation access into one shareable `/donate/` landing
  page. Remove the four payment providers from the homepage, route the Public &
  Live reading card and floating reminder to the new page, and keep the reminder
  dismissible. Use broad homepage wording so it welcomes both free-reading
  recipients and visitors who value the work. The donation page retains all four
  official services, states that giving is optional, and clearly distinguishes a
  donation from booking or paying for a private reading or event.
- 2026-08-12 - Restore the shared thin gold chapter divider above the Practice
  Map. Its tabbed redesign had lost that border, leaving an accidental-looking
  stretch of empty sky between sections.
- 2026-08-12 - Remove internal production language from every public route.
  Replace references to local development, rebuilding, prototypes, review
  copies, and the site's builder with ordinary visitor-facing copy. Unfinished
  learning rooms should state plainly what is still being researched or written,
  then direct visitors toward available readings, contact, or the rest of Lost
  Opal. Keep private draft pages and internal design notes out of the public
  package rather than trying to explain them to visitors.
- 2026-08-13 - Use the user's exact donation-reminder copy: "Just got a free
  reading? Donate if it helped." Follow it with the compact reassurance
  "Always optional · Secure Payments" rather than counting providers or
  broadening the message.
- 2026-08-13 - Make the professional headshot part of the homepage's first
  introduction alongside the Lost Opal seal and primary message. Move the
  contact form to the final neon invitation, where it becomes the natural next
  step rather than occupying the first viewport. Return the public-reading
  photograph to the About section and remove the inflated Reader, Astrologer,
  and Founder title; the page itself already explains the work.
- 2026-08-13 - Reframe the Astrology explorer around six visitor-facing
  doorways: Birth Chart and Inner Archetypes, Birthday and Year Ahead,
  Relationships, Your Current Chapter, Important Dates and Beginnings, and
  Travel, Place and Relocation. Keep Solar Return work prominent inside the
  birthday service, and explain elsewhere on the homepage that Astrology,
  Tarot, myth, number, art, and symbol operate as related languages rather than
  isolated products.
- 2026-08-13 - Identify Bryan as an "Esoteric Interpreter" beneath the opening
  portrait. Remove the oversized closing slogan so the neon "When you are
  ready..." invitation leads directly into the contact form.
- 2026-08-13 - Rebuild the shared Learn navigation as a real learning map.
  Group Tarot beneath Major Arcana, Minor Arcana, The Fool's Journey, The 4
  Suits, Court Cards, Reading Styles, Incorporating Astrology, and Qaballah. Give
  Astrology its own clearly labelled group, followed by the remaining study
  branches. Use "Astrology" in the menu rather than the full Lost Opal
  Astrology brand name, and write navigation labels in Title Case.
- 2026-08-13 - Let the study map grow beyond the original seven-door idea.
  Use ten primary areas in this order: Tarot, Astrology, Qaballah, Numerology,
  Rituals, I Ching, Runes, Oracles, Lenormand, and Osteomancy. The Learn menu
  must mirror those same areas and place their future lessons beneath the
  correct heading. Keep the homepage controls compact enough to share one row
  on genuinely wide screens, then switch to a deliberate horizontal scroller
  instead of crushing them when the viewport runs out of room.
- 2026-08-13 - Replace the provisional LO header medallion with the original
  ornate black-opal yin-yang artwork supplied by the user. Use the transparent
  source consistently in every public page header while the newer LO mark
  remains in development.
- 2026-08-13 - Introduce the person behind Lost Opal publicly as "Opal" rather
  than using the legal name in the homepage portrait. Use "Esoteric Guide ·
  Praeceptor · Student" as the working role line. Explain Esoteric and
  Praeceptor through small accessible definitions on hover, focus, and tap;
  connect Praeceptor to teaching, paths of practice, continued study, and
  service to the Sacred Fire.
- 2026-08-13 - Replace the study-map carousel with compact, centered controls
  containing only each symbol and title. Let the controls share one row when
  room permits and wrap into balanced rows when it does not. Remove the
  scrollbar, tile subtitles, and all visitor-facing copy that explains the
  mechanics of the webpage rather than the work itself.
- 2026-08-13 - Present the portrait role line consistently in capitals as
  "ESOTERIC GUIDE · PRAECEPTOR · STUDENT." Keep every term the same color and
  use only a subtle underline beneath the three defined phrases. The complete
  phrase "ESOTERIC GUIDE," rather than Esoteric alone, opens its definition.
  Define STUDENT through continued study, listening, discernment, and service
  to the Sacred Fire.
- 2026-08-13 - Turn the homepage atmosphere into a scroll-directed cosmic
  convergence. Seven widely dispersed black-opal nebula currents gradually
  gather toward a dark lotus-like event horizon near the final invitation.
  Use a compressed still, scroll-position changes, and translucent chapter
  surfaces rather than a continuous particle simulation or video. Keep mobile
  quieter and provide a static composition when reduced motion is requested.
### Role-line capitalization

- Apply uppercase directly to the interactive definition terms beneath “Opal.” Button defaults can override inherited capitalization, so “ESOTERIC GUIDE,” “PRAECEPTOR,” and “STUDENT” now remain visually consistent.
### Candid portrait caption

- Remove the redundant “Meet Opal” heading from the candid-reading photograph. The primary introduction has already established who Opal is, so this caption begins with “Reading in the wild.”
### Donation landing page

- Treat `/donate/` as a genuine Lost Opal landing page: use the shared cosmic black-opal atmosphere, place the primary Lost Opal seal in the opening composition, and lead with the simple title “Ways to give.”
- Keep the voluntary-giving promise in the first viewport without letting it compete with the payment choices.
- Crop the Ko-fi mark cleanly into its icon medallion so its square artwork does not create a conspicuous white field.
- Keep the introduction and all four secure-payment choices together in the first desktop viewport. The seal establishes identity at a restrained size; it must not delay the visitor from reaching the purpose of the page.
- Do not use spacer-like chapter blocks on the donation page. Let the cosmic field run continuously behind the introduction, payment choices, and boundary note, using only compact content padding and a restrained rule where clarification is needed.
- Give the donation route its own fixed black-opal mineral-nebula field rather
  than inheriting the homepage's scroll-directed cosmic journey. Keep the page
  as one continuous landing composition with no section kickers or scenic
  dividers. Present the four providers as compact horizontal payment doors in a
  balanced two-by-two grid, with subdued provider-specific opal accents. Keep
  the voluntary-giving promise, security reassurance, and paid-service boundary
  visible without turning any of them into another oversized content card.
- Center the Lost Opal seal inside the donation title so it becomes the visual
  hinge between “Ways to” and “give,” rather than sitting by itself at the side.
  Keep the four provider doors genuinely compact. End the page with a distinct
  aqua-mint neon “Thank you!” signed “— Opal,” and use “Contact Me” for the
  paid-services action. The collapsible heart donation reminder belongs on
  every ordinary public route, with `/donate/` itself as the only intentional
  exception.
