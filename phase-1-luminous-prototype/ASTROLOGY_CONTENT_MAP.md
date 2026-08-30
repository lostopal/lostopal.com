# Lost Opal Astrology™ content map

Status: local planning and implementation document  
Implementation: standalone local `/astrology/` hub is now active; deeper collections remain future work  
Publishing: nothing here is approved for publication

Publication guard: the full `/astrology/` hub remains local while its meanings,
sources, and reference entries are developed. On the site's initial public
release, serve `astrology/coming-soon.html` at the public `/astrology/` route.
Do not expose the workshop until the owner explicitly approves it.

## Brand architecture

**Lost Opal** is the umbrella identity.

- **Lost Opal Tarot™** — readings, spreads, cards, divination tools, ethics,
  and reflective practice.
- **Lost Opal Astrology™** — planets, signs, houses, aspects, chart literacy,
  cycles, correspondences, and the record of learning.
- Shared material language — Sacred Fire, black opal, copper, living color,
  Hermetic symbolism, and first-person voice.

The two branches should feel related without collapsing into one enormous
"Learn" pile. Tarot and Astrology can cross-link where the correspondence is
useful, but each subject needs its own clear path and editorial structure.

## Proposed URL structure

```text
/astrology/
├── foundations/
├── planets/
│   ├── sun/
│   ├── moon/
│   ├── mercury/
│   ├── venus/
│   ├── mars/
│   ├── jupiter/
│   └── saturn/
├── signs/
│   ├── aries/
│   ├── taurus/
│   ├── gemini/
│   ├── cancer/
│   ├── leo/
│   ├── virgo/
│   ├── libra/
│   ├── scorpio/
│   ├── sagittarius/
│   ├── capricorn/
│   ├── aquarius/
│   └── pisces/
├── houses/
├── aspects/
├── chart-basics/
├── cycles/
└── sources/
```

This moves Astrology from the earlier `/learn/astrology/` suggestion to a
top-level `/astrology/` branch because it is now a named sibling identity, not
merely one topic inside a general learning menu. Navigation may still group it
under Learn until the public site becomes large enough to justify a dedicated
top-level item.

## First release sequence

1. **Astrology hub** — what this area is, what it is not, and how the learning
   will be sourced and revised.
2. **The seven classical planets** — the existing black-opal cosmogram already
   gives this collection a visual anchor.
3. **Signs overview** — element, modality, polarity, rulership, and twelve
   carefully separated entries.
4. **Houses overview** — fields of experience, with the chosen house system
   named clearly.
5. **Major aspects** — conjunction, opposition, trine, square, and sextile,
   with relationship and tension explained without "good/bad" shortcuts.
6. **Chart foundations** — how planet, sign, house, and aspect work together.
7. **Cycles and transits** — later, after the static grammar is solid.

Do not generate dozens of empty public pages. Build one complete collection at
a time, keep unfinished entries as local drafts, and publish only useful pages.

## Future wild branches

These belong on the horizon, not in the first release:

- traditional and modern rulership;
- dignities and debilities;
- sect, triplicities, terms, faces, and decans;
- planetary days and hours;
- retrogrades, stations, speed, and visibility;
- chart rulers and dispositors;
- nodes, eclipses, lots, fixed stars, and outer planets;
- synastry and composite techniques;
- electional, horary, mundane, and medical history;
- astrology–tarot, astrology–Qabalah, and alchemical correspondences.

## Editorial covenant

Every published Astrology page should:

- distinguish sourced tradition from my interpretation;
- name the tradition or school when different systems disagree;
- avoid fatalistic claims and identity traps;
- explain that a placement is part of a whole chart, not a sentence handed down
  in isolation;
- cite public sources and further reading;
- carry a visible last-reviewed date;
- allow revision as understanding develops;
- avoid medical, legal, financial, or guaranteed predictive claims;
- use first person when I discuss my practice or interpretation;
- never manufacture authority I have not earned.

The learning itself can be part of the voice. "Here is what I understand now,
where it comes from, and what I am still working through" is more trustworthy
than pretending the archive arrived complete.

## Shared page anatomy

Each reference page can use the same structural rhythm:

1. Name, glyph, and one-sentence orientation.
2. What this symbol represents in the selected tradition.
3. Core qualities and functions.
4. How it changes by sign, house, or relationship.
5. Constructive expression, distortion, and questions for reflection.
6. Traditional correspondences and clearly labeled modern additions.
7. Tarot, Qabalistic, alchemical, or mythic cross-links when genuinely useful.
8. Sources, further reading, and last-reviewed date.
9. Private working notes stored only in the local Content Studio.

## Suggested structured fields

### Planet

- name, glyph, slug, and short orientation;
- classical or modern classification;
- function, temperament, sect, and speed notes where relevant;
- sign rulership, exaltation, detriment, and fall;
- day, metal, color, mythic figures, and Hermetic correspondences;
- expression by sign and house;
- major aspects and cycles;
- tarot and Tree of Life relationships;
- reflection questions, sources, private notes, and draft status.

### Sign

- name, glyph, slug, and short orientation;
- element, modality, polarity, and ruler;
- season and tropical/sidereal framework;
- constructive expression and common distortions;
- planets in the sign;
- decans or subdivisions when the chosen system is ready;
- reflection questions, sources, private notes, and draft status.

### House

- number, angular/succedent/cadent quality, and life topics;
- house-system context;
- planets and signs interacting with the house;
- traditional meanings versus modern psychological extensions;
- reflection questions, sources, private notes, and draft status.

### Aspect

- name, glyph, angle, default orb guidance, and family;
- applying/separating notes when appropriate;
- relational function without reducing it to benefic/malefic shorthand;
- planetary examples;
- reflection questions, sources, private notes, and draft status.

## Decisions needed before public implementation

- Tropical, sidereal, or explicitly comparative scope.
- Primary house system and how alternatives will be acknowledged.
- Traditional versus modern rulership policy.
- When outer planets, nodes, asteroids, and calculated points enter the map.
- Educational archive only versus future astrology consultations.
- Whether birth-chart calculations ever happen on the site. That would introduce
  personal birth data, privacy, technical accuracy, and consent requirements.
- Source and citation standard for every page.
- Final relationship between the Lost Opal Tarot™ and Lost Opal Astrology™
  names in navigation, page titles, metadata, and future legal review.
