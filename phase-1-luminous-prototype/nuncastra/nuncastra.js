/*
 * Nuncastra: the stars as they are now
 * Copyright (C) 2026 Lost Opal
 *
 * This calculator is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License, version 3.
 * See ./LICENSE.txt and ./source.html for source and third-party notices.
 */

import SwissEphemeris, {
  Asteroid,
  CalculationFlag,
  HouseSystem,
  LunarPoint,
  Planet,
  SiderealMode,
} from "./vendor/swisseph/swisseph-browser.js";
import { lookup as lookupTimezone } from "./vendor/timezone-lookup.js";

const CARD_BASE = "../assets/tarot/1909-rws";
const CARD_PREVIEW_BASE = "../assets/tarot/1909-rws-draw";
const PLACEHOLDER_BASE = "./assets/placeholders";
const EPHEMERIS_FILES = ["sepl_18.se1", "semo_18.se1", "seas_18.se1"];
const SIGN_DEGREES = 30;
const DECAN_DEGREES = 10;
const INTRO_STORAGE_KEY = "nuncastra-intro-seen-v1";
const DONATE_DISMISSED_STORAGE_KEY = "nuncastra-donate-dismissed-v1";
const RECENT_PLACES_STORAGE_KEY = "nuncastra-recent-places-v1";

const ZODIAC_SYSTEMS = {
  tropical: { label: "Tropical · Default", siderealMode: null },
  lahiri: { label: "Sidereal Zodiac · Lahiri Ayanamsa · Lost Opal Tarot Hybrid", siderealMode: SiderealMode.Lahiri },
  fagan: { label: "Sidereal Zodiac · Fagan–Bradley Ayanamsa · Lost Opal Tarot Hybrid", siderealMode: SiderealMode.FaganBradley },
};

const MAJORS = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant",
  "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune", "Justice",
  "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower", "The Star",
  "The Moon", "The Sun", "Judgement", "The World",
];

const HERMETIC_MAJOR_TITLES = [
  "The Spirit of Ether",
  "The Magus of Power",
  "The Priestess of the Silver Star",
  "The Daughter of the Mighty Ones",
  "Son of the Morning, Chief among the Mighty",
  "The Magus of the Eternal Gods",
  "Children of the Voice Divine, The Oracle of the Mighty Gods",
  "Child of the Powers of the Waters, Lord of the Triumph of Light",
  "Daughter of the Flaming Sword, Leader of the Lion",
  "Prophet of the Eternal, Magus of the Voice of Power",
  "The Lord of the Forces of Life",
  "Daughter of the Lords of Truth, Ruler of the Balance",
  "The Spirit of the Mighty Waters",
  "Child of the Great Transformers, Lord of the Gates of Death",
  "Daughter of the Reconcilers, Bringer-Forth of Life",
  "Lord of the Gates of Matter, Child of the Forces of Time",
  "The Lord of the Hosts of the Mighty",
  "Daughter of the Firmament, Dweller Between the Waters",
  "Ruler of Flux and Reflux, Child of the Sons of the Mighty",
  "The Lord of the Fire of the World",
  "The Spirit of the Primal Fire",
  "The Great One of the Night of Time",
];

const HERMETIC_MINOR_TITLES = {
  Wands: [
    "Root of the Powers of Fire", "Lord of Dominion", "Lord of Established Strength", "Lord of Perfected Work",
    "Lord of Strife", "Lord of Victory", "Lord of Valour", "Lord of Swiftness", "Lord of Great Strength", "Lord of Oppression",
    "Princess of the Shining Flame, Rose of the Palace of Fire", "Lord of the Flame and Lightning, King of the Spirits of Fire",
    "Queen of the Thrones of Flame", "Prince of the Chariot of Fire",
  ],
  Cups: [
    "Root of the Powers of Water", "Lord of Love", "Lord of Abundance", "Lord of Blended Pleasure",
    "Lord of Loss in Pleasure", "Lord of Pleasure", "Lord of Illusionary Success", "Lord of Abandoned Success", "Lord of Material Happiness", "Lord of Perfected Success",
    "Princess of the Waters, Lotus of the Palace of the Floods", "Lord of the Waves and the Waters, King of the Hosts of the Sea",
    "Queen of the Thrones of the Waters", "Prince of the Chariot of the Waters",
  ],
  Swords: [
    "Root of the Powers of Air", "Lord of Peace Restored", "Lord of Sorrow", "Lord of Rest from Strife",
    "Lord of Defeat", "Lord of Earned Success", "Lord of Unstable Effort", "Lord of Shortened Force", "Lord of Despair and Cruelty", "Lord of Ruin",
    "Princess of the Rushing Winds, Lotus of the Palace of Air", "Lord of the Winds and the Breezes, King of the Spirits of Air",
    "Queen of the Thrones of Air", "Prince of the Chariot of the Winds",
  ],
  Pentacles: [
    "Root of the Powers of Earth", "Lord of Harmonious Change", "Lord of Material Works", "Lord of Earthly Power",
    "Lord of Material Trouble", "Lord of Material Success", "Lord of Success Unfulfilled", "Lord of Prudence", "Lord of Material Gain", "Lord of Wealth",
    "Princess of the Echoing Hills, Rose of the Palace of Earth", "Lord of the Wide and Fertile Land, King of the Spirits of Earth",
    "Queen of the Thrones of Earth", "Prince of the Chariot of Earth",
  ],
};

const HERMETIC_CARD_TITLES = [
  ...HERMETIC_MAJOR_TITLES,
  ...HERMETIC_MINOR_TITLES.Wands,
  ...HERMETIC_MINOR_TITLES.Cups,
  ...HERMETIC_MINOR_TITLES.Swords,
  ...HERMETIC_MINOR_TITLES.Pentacles,
];

const MAJOR_KEY_MEANINGS = [
  "The beginning before a fixed form: openness, possibility, trust, and the courage to enter experience.",
  "Directed will, skill, agency, and the power to bring an unseen possibility into deliberate form.",
  "Inner knowing, mystery, receptivity, and the wisdom found by listening beneath the obvious answer.",
  "Creation, nourishment, abundance, embodiment, and the conditions that allow living things to flourish.",
  "Structure, authority, boundaries, responsibility, and the stewardship required to make order dependable.",
  "Tradition, teaching, initiation, shared values, and the living relationship between knowledge and practice.",
  "Relationship, meaningful choice, attraction, and the alignment of action with what the heart truly values.",
  "Purposeful movement, discipline, direction, and the ability to carry opposing forces toward one destination.",
  "Courage joined with gentleness: instinct met consciously, patiently, and without surrendering inner authority.",
  "Solitude, discernment, inner wisdom, and the small guiding light found through honest self-examination.",
  "Cycles, turning circumstances, consequence, timing, and the invitation to move intelligently with change.",
  "Truth, balance, accountability, proportion, and the consequences that restore integrity to a situation.",
  "Suspension, surrender, changed perception, and the insight that appears when ordinary movement is released.",
  "An irreversible ending, the grief of releasing an old form, and the transformation invited by the next sacred moment.",
  "Integration, healing proportion, patience, and the careful blending of forces that once seemed incompatible.",
  "Attachment, appetite, fear, material entanglement, and the power reclaimed by recognizing where choice still exists.",
  "Revelation, disruption, and the collapse of a structure that can no longer contain the truth arriving through it.",
  "Hope, renewal, authenticity, spiritual orientation, and the quiet guidance that returns after upheaval.",
  "Intuition, uncertainty, dream, shadow, and the need to feel through what cannot yet be seen with complete clarity.",
  "Clarity, vitality, warmth, recognition, and the freedom to participate openly in the life that is present.",
  "Awakening, reckoning, vocation, renewal, and the call to rise into a more truthful relationship with life.",
  "Completion, integration, wholeness, and the threshold where one finished world becomes passage into another.",
];

function majorKeyLabel(value) {
  return String(value);
}

const RULER_DATA = {
  Sun: {
    glyph: "☉",
    majorIndex: 19,
    influence: "vitality, centered identity, illumination, and creative radiance",
    description: "The Sun gathers experience into a coherent center. It describes the identity through which life becomes organized and expressed: who you are becoming, what gives you vitality, and where the mind’s illuminating attention is presently focused.",
  },
  Moon: {
    glyph: "☽",
    majorIndex: 18,
    influence: "instinct, memory, feeling, belonging, and responsive cycles",
    description: "The Moon is the inner space where the unmanifest is weighed and given room to move. It holds hopes, fears, dreams, memories, emotions, and intuitive information. Its current may emerge untamed like the wolf or become trusted and familiar like the loyal dog.",
  },
  Mercury: {
    glyph: "☿",
    majorIndex: 1,
    influence: "thought, language, exchange, perception, and adaptable movement",
    description: "Mercury is the intelligence that notices, names, connects, and carries information between worlds. It describes thought, speech, learning, exchange, perception, and the ability to adapt an idea so it can actually travel.",
  },
  Venus: {
    glyph: "♀",
    majorIndex: 3,
    influence: "attraction, value, relationship, beauty, pleasure, and receptive creation",
    description: "Venus describes how we recognize value and become receptive to what draws us. It governs attraction, beauty, relationship, pleasure, harmony, and the desire to cultivate what feels worthy.",
  },
  Mars: {
    glyph: "♂",
    majorIndex: 16,
    influence: "desire, courage, conflict, severance, and decisive action",
    description: "Mars gives desire a direction and supplies the force required to act. It describes courage, pursuit, anger, conflict, severance, and the decisive boundary that turns intention into consequence.",
  },
  Jupiter: {
    glyph: "♃",
    majorIndex: 10,
    influence: "expansion, meaning, faith, opportunity, wisdom, and the larger pattern",
    description: "Jupiter widens the field so experience can become meaning. It describes growth, faith, opportunity, teaching, wisdom, generosity, and the larger pattern that helps a life understand what it is participating in.",
  },
  Saturn: {
    glyph: "♄",
    majorIndex: 21,
    influence: "boundary, time, consequence, responsibility, endurance, and mastery",
    description: "Saturn gives experience a boundary, a duration, and a consequence. It describes time, responsibility, discipline, limitation, endurance, and the mastery earned by remaining accountable to what is real.",
  },
  Uranus: {
    glyph: "♅",
    influence: "disruption, liberation, unprecedented possibility, and radical reorientation",
    description: "Uranus interrupts the established circuit so a possibility without precedent can enter. It describes disruption, liberation, invention, awakening, and the radical reorientation required when an old structure can no longer conduct the future.",
  },
  Neptune: {
    glyph: "♆",
    influence: "vision, compassion, imagination, surrender, and the dissolving of boundaries",
    description: "Neptune loosens ordinary certainty and opens perception to image, longing, compassion, and the unseen. It describes vision, imagination, surrender, glamour, spiritual feeling, and the need to distinguish revelation from projection.",
  },
  Pluto: {
    glyph: "♇",
    influence: "power, underworld truth, irreversible transformation, grief, and renewal",
    description: "Pluto exposes the buried power inside endings that cannot be reversed. It describes underworld truth, grief, compulsion, transformation, and the renewal that becomes possible only after an exhausted form is released.",
  },
};

const CELESTIAL_MYTHS = {
  Sun: ["Helios", "Apollo", "Ra"],
  Moon: ["Selene", "Artemis", "Khonsu"],
  Mercury: ["Hermes", "Thoth", "Nabu"],
  Venus: ["Aphrodite", "Inanna", "Hathor"],
  Mars: ["Ares", "Nergal", "Anhur"],
  Jupiter: ["Zeus", "Marduk", "Amun"],
  Saturn: ["Cronus", "Ninurta", "Geb"],
  Uranus: ["Ouranos", "Caelus"],
  Neptune: ["Poseidon", "Neptune", "Enki"],
  Pluto: ["Hades", "Pluto", "Ereshkigal"],
  Chiron: ["Chiron"],
  "North Node": ["Rahu"],
  "South Node": ["Ketu"],
  Lilith: ["Lilith"],
  Ceres: ["Demeter"],
  Pallas: ["Athena"],
  Juno: ["Hera"],
  Vesta: ["Hestia"],
};

const CELESTIAL_STONES = {
  Sun: ["Sunstone", "Ruby", "Citrine"],
  Moon: ["Moonstone", "Selenite", "Labradorite"],
  Mercury: ["Agate", "Fluorite", "Citrine"],
  Venus: ["Rose Quartz", "Emerald", "Malachite"],
  Mars: ["Carnelian", "Red Jasper", "Bloodstone"],
  Jupiter: ["Amethyst", "Lapis Lazuli", "Turquoise"],
  Saturn: ["Onyx", "Obsidian", "Smoky Quartz"],
  Uranus: ["Labradorite", "Aquamarine", "Amazonite"],
  Neptune: ["Aquamarine", "Amethyst", "Moonstone"],
  Pluto: ["Obsidian", "Smoky Quartz", "Garnet"],
  Chiron: ["Rhodonite", "Malachite", "Turquoise"],
  "North Node": ["Labradorite", "Moonstone", "Iolite"],
  "South Node": ["Smoky Quartz", "Obsidian", "Labradorite"],
  Lilith: ["Black Obsidian", "Labradorite", "Garnet"],
  Ceres: ["Moss Agate", "Emerald", "Moonstone"],
  Pallas: ["Lapis Lazuli", "Sodalite", "Fluorite"],
  Juno: ["Garnet", "Rose Quartz", "Emerald"],
  Vesta: ["Carnelian", "Fire Agate", "Garnet"],
};

const SIGN_DATA = [
  { name: "Aries", glyph: "♈", majorIndex: 4, ruler: "Mars", field: "direct courage, ignition, sovereignty, and the right to begin" },
  { name: "Taurus", glyph: "♉", majorIndex: 5, ruler: "Venus", field: "embodiment, value, continuity, and patient cultivation" },
  { name: "Gemini", glyph: "♊", majorIndex: 6, ruler: "Mercury", field: "choice, language, exchange, and the joining of perspectives" },
  { name: "Cancer", glyph: "♋", majorIndex: 7, ruler: "Moon", field: "protection, belonging, memory, and emotionally guided movement" },
  { name: "Leo", glyph: "♌", majorIndex: 8, ruler: "Sun", field: "radiance, creative heart, noble courage, and visible self-expression" },
  { name: "Virgo", glyph: "♍", majorIndex: 9, ruler: "Mercury", field: "discernment, service, repair, and devotion to useful craft" },
  { name: "Libra", glyph: "♎", majorIndex: 11, ruler: "Venus", field: "relationship, proportion, reciprocity, and ethical balance" },
  { name: "Scorpio", glyph: "♏", majorIndex: 13, ruler: "Mars", modernRuler: "Pluto", field: "truth beneath appearances, surrender, intimacy, and transformation" },
  { name: "Sagittarius", glyph: "♐", majorIndex: 14, ruler: "Jupiter", field: "meaning, synthesis, pilgrimage, and the expansion of perspective" },
  { name: "Capricorn", glyph: "♑", majorIndex: 15, ruler: "Saturn", field: "structure, consequence, mastery, and material responsibility" },
  { name: "Aquarius", glyph: "♒", majorIndex: 17, ruler: "Saturn", modernRuler: "Uranus", field: "liberation, collective vision, originality, and future-minded truth" },
  { name: "Pisces", glyph: "♓", majorIndex: 18, ruler: "Jupiter", modernRuler: "Neptune", field: "mystery, permeability, imagination, and spiritual feeling" },
];

const HOUSE_DATA = [
  { title: "Self & Approach", short: "identity, embodiment, presence, and approach", meaning: "The 1st House is the doorway through which a life or moment becomes visible. It describes identity, embodiment, immediate presence, and the way this current approaches experience before a longer story has had time to form." },
  { title: "Resources & Worth", short: "resources, values, self-worth, and sustainability", meaning: "The 2nd House describes what helps life feel supported and substantial. It includes possessions and material resources, but also skills, personal values, self-worth, and the things we depend upon for stability. In this line, the cards speak through questions of what is valuable, sustainable, and truly yours." },
  { title: "Learning & Exchange", short: "language, learning, neighbors, and exchange", meaning: "The 3rd House is the living network through which information moves. It describes speech, writing, everyday learning, siblings, neighbors, short journeys, and the mental habits that shape how we notice and exchange what is happening nearby." },
  { title: "Home & Roots", short: "home, family, ancestry, and private foundations", meaning: "The 4th House is the private ground beneath the visible life. It describes home, family, ancestry, belonging, memory, and the emotional foundation to which a person or beginning returns for shelter and orientation." },
  { title: "Creation & Joy", short: "creativity, pleasure, play, and wholehearted expression", meaning: "The 5th House is where inner vitality risks becoming visible. It describes creativity, pleasure, romance, children, play, performance, and the wholehearted expression that lets a life discover what it genuinely loves to make and share." },
  { title: "Work & Care", short: "daily work, care, practice, and maintenance", meaning: "The 6th House brings meaning into the repeated work of tending life. It describes daily labor, service, health routines, maintenance, apprenticeship, and the humble practices through which skill, usefulness, and care become dependable." },
  { title: "Partnership & Mirrors", short: "partnership, agreements, mirrors, and open conflict", meaning: "The 7th House is the field of meaningful encounter with an equal other. It describes partnership, agreements, collaboration, open conflict, and the parts of ourselves that become recognizable only through relationship and reflection." },
  { title: "Intimacy & Transformation", short: "shared resources, vulnerability, loss, and transformation", meaning: "The 8th House begins where absolute self-sufficiency ends. It describes shared resources, intimacy, vulnerability, inheritance, debt, loss, merging, and the irreversible transformations that ask us to meet power and dependence consciously." },
  { title: "Meaning & Horizon", short: "worldview, higher study, pilgrimage, and meaning", meaning: "The 9th House stretches experience toward a wider horizon. It describes higher study, worldview, spiritual or philosophical seeking, teaching, long journeys, and the search for a meaning large enough to reorganize what we thought we knew." },
  { title: "Calling & Public Life", short: "vocation, reputation, authority, and responsibility", meaning: "The 10th House is where private development becomes visible in the world. It speaks to vocation, reputation, authority, responsibility, and the role a person is gradually prepared to embody. It asks what you are willing to become accountable for." },
  { title: "Community & Future", short: "friendship, groups, causes, and collective hopes", meaning: "The 11th House gathers individual effort into a future imagined with others. It describes friendship, groups, communities, causes, patrons, shared hopes, and the networks through which possibility becomes collective rather than merely personal." },
  { title: "Retreat & the Unseen", short: "solitude, dreams, hidden patterns, and surrender", meaning: "The 12th House holds what lives beyond ordinary conscious control: solitude, dreams, inherited patterns, surrender, hidden fears, spiritual refuge, and the parts of life that require compassion rather than conquest." },
];

const DECAN_DATA = [
  [
    ["Two of Wands", "Dominion", "Wands", 2, "focuses raw fire into a chosen direction and asks will to become intentional", "Name the direction before spending the fire."],
    ["Three of Wands", "Established Strength", "Wands", 3, "extends the first decision into foresight, cooperation, and purposeful expansion", "Act for the horizon, not only the immediate spark."],
    ["Four of Wands", "Perfected Work", "Wands", 4, "stabilizes fire through celebration, shared ground, and a completed first structure", "Acknowledge what is working before beginning again."],
  ],
  [
    ["Five of Pentacles", "Material Trouble", "Pentacles", 5, "reveals scarcity, instability, or the fear of losing what the body depends upon", "Separate an actual need from a fear of not having enough."],
    ["Six of Pentacles", "Material Success", "Pentacles", 6, "restores circulation through fair exchange, support, and material reciprocity", "Give or receive in a way that preserves dignity."],
    ["Seven of Pentacles", "Success Unfulfilled", "Pentacles", 7, "slows the harvest so effort, timing, and true value can be reassessed", "Inspect the roots before demanding fruit."],
  ],
  [
    ["Eight of Swords", "Shortened Force", "Swords", 8, "shows energy narrowed by a mental frame, an assumption, or an incomplete view", "Test the rule that seems to leave you no choice."],
    ["Nine of Swords", "Despair and Cruelty", "Swords", 9, "amplifies thought until fear or self-judgment becomes louder than the evidence", "Bring the fear into daylight and verify what is actually true."],
    ["Ten of Swords", "Ruin", "Swords", 10, "brings a mental story all the way into embodied finality: what has ended must be named before its blade can be reclaimed as truth, justice, and illumination", "Name what ended. Reach back for the blade without passing the wound onward."],
  ],
  [
    ["Two of Cups", "Love", "Cups", 2, "opens mutual recognition, emotional honesty, and the possibility of true meeting", "Make one sincere exchange without performing around it."],
    ["Three of Cups", "Abundance", "Cups", 3, "lets feeling multiply through friendship, witness, and shared celebration", "Let supportive people participate in the good."],
    ["Four of Cups", "Blended Pleasure", "Cups", 4, "pauses emotional movement so desire can be distinguished from habit or numbness", "Notice the invitation that boredom has hidden."],
  ],
  [
    ["Five of Wands", "Strife", "Wands", 5, "creates friction among competing impulses so strength and motive can be clarified", "Turn conflict into practice instead of spectacle."],
    ["Six of Wands", "Victory", "Wands", 6, "makes earned confidence visible and allows effort to be recognized by the field", "Receive recognition without making it your identity."],
    ["Seven of Wands", "Valour", "Wands", 7, "tests the courage to hold a meaningful position while pressure rises around it", "Protect the boundary that protects the work."],
  ],
  [
    ["Eight of Pentacles", "Prudence", "Pentacles", 8, "grounds insight in repetition, apprenticeship, refinement, and skillful attention", "Choose one craft, system, or habit and improve it carefully."],
    ["Nine of Pentacles", "Material Gain", "Pentacles", 9, "ripens disciplined effort into competence, autonomy, and embodied sufficiency", "Enjoy what your steady labor has made possible."],
    ["Ten of Pentacles", "Wealth", "Pentacles", 10, "places material life inside lineage, inheritance, systems, and long-term stewardship", "Make one choice your future people can stand on."],
  ],
  [
    ["Two of Swords", "Peace Restored", "Swords", 2, "holds two truths in deliberate stillness until reaction gives way to clear proportion", "Pause long enough to hear both sides of the mind."],
    ["Three of Swords", "Sorrow", "Swords", 3, "names the clean pain of a truth that cannot be made painless by avoidance", "Let accuracy be kinder than denial."],
    ["Four of Swords", "Rest from Strife", "Swords", 4, "withdraws the mind from conflict so perspective and nervous-system quiet can return", "Schedule the silence instead of waiting to collapse into it."],
  ],
  [
    ["Five of Cups", "Loss in Pleasure", "Cups", 5, "lets grief tell the truth about attachment while reminding the heart that not everything is gone", "Honor the loss, then turn toward what remains alive."],
    ["Six of Cups", "Pleasure", "Cups", 6, "returns feeling to memory, innocence, generosity, and the gifts carried forward from the past", "Receive the past as nourishment, not a place to live."],
    ["Seven of Cups", "Illusionary Success", "Cups", 7, "multiplies images and desires until discernment is needed to separate vision from projection", "Choose the cup whose consequences you are willing to live."],
  ],
  [
    ["Eight of Wands", "Swiftness", "Wands", 8, "releases concentrated fire into movement, messages, alignment, and rapid development", "Move promptly while the path is genuinely open."],
    ["Nine of Wands", "Great Strength", "Wands", 9, "gathers endurance at the threshold and protects what long effort has made possible", "Stand ready without treating every arrival as an attack."],
    ["Ten of Wands", "Oppression", "Wands", 10, "shows fire burdened by excess responsibility, overextension, or a mission carried alone", "Put down the load that was never truly yours."],
  ],
  [
    ["Two of Pentacles", "Harmonious Change", "Pentacles", 2, "keeps material life responsive through rhythm, prioritization, and graceful adjustment", "Change the rhythm before adding another obligation."],
    ["Three of Pentacles", "Material Works", "Pentacles", 3, "builds competence through planning, collaboration, and respect for each contributor's craft", "Ask what quality requires from every person involved."],
    ["Four of Pentacles", "Earthly Power", "Pentacles", 4, "consolidates resources and boundaries while testing whether security has become control", "Protect what matters without closing the circulation."],
  ],
  [
    ["Five of Swords", "Defeat", "Swords", 5, "exposes the cost of winning through separation, humiliation, or a strategy that poisons the field", "Decide which argument is too expensive to win."],
    ["Six of Swords", "Earned Success", "Swords", 6, "uses sober understanding to cross away from turbulence toward a more workable mental shore", "Carry the lesson, not the entire wreckage."],
    ["Seven of Swords", "Unstable Effort", "Swords", 7, "tests strategy, independence, and the hidden weakness created when a plan lacks integrity", "Make the clever plan answer to the whole truth."],
  ],
  [
    ["Eight of Cups", "Abandoned Success", "Cups", 8, "walks beyond an emotionally complete form because the soul can no longer pretend completion is fulfillment", "Leave respectfully when the deeper call is unmistakable."],
    ["Nine of Cups", "Material Happiness", "Cups", 9, "fills the emotional vessel with satisfaction, pleasure, gratitude, and the test of enoughness", "Let contentment be felt before asking for more."],
    ["Ten of Cups", "Perfected Success", "Cups", 10, "widens private feeling into belonging, shared joy, and an image of emotional wholeness", "Contribute to the belonging you want to experience."],
  ],
];

const BODY_DATA = [
  { name: "Sun", glyph: "☉", body: Planet.Sun, majorIndices: [19], essence: "Solar purpose, vitality, identity, and the power to illuminate move to the front", ground: "Act from the center you want the rest of life to organize around." },
  { name: "Moon", glyph: "☽", body: Planet.Moon, majorIndices: [18], essence: "Instinct, emotional weather, memory, and bodily knowing become the immediate messenger", ground: "Notice the feeling before turning it into a conclusion." },
  { name: "Mercury", glyph: "☿", body: Planet.Mercury, majorIndices: [1], essence: "Mind, language, perception, and the ability to connect symbols are active", ground: "Name the signal clearly and ask what it connects." },
  { name: "Venus", glyph: "♀", body: Planet.Venus, majorIndices: [3], essence: "Attraction, value, relationship, beauty, and receptive creativity seek expression", ground: "Choose what you are willing to nourish with attention." },
  { name: "Mars", glyph: "♂", body: Planet.Mars, majorIndices: [16], essence: "Desire, conflict, severance, courage, and catalytic action press for release", ground: "Use the force to free truth, not merely to discharge tension." },
  { name: "Jupiter", glyph: "♃", body: Planet.Jupiter, majorIndices: [10], essence: "Growth, faith, meaning, opportunity, and the turning of a larger cycle become visible", ground: "Expand what deserves to become a world, not every passing appetite." },
  { name: "Saturn", glyph: "♄", body: Planet.Saturn, majorIndices: [21], essence: "Boundary, time, consequence, maturity, and the work of completion set the terms", ground: "Honor the limit that makes durable form possible." },
  {
    name: "Uranus",
    glyph: "♅",
    body: Planet.Uranus,
    majorIndices: [0, 13, 12],
    keyLabels: ["Arrival", "Severance", "Suspension"],
    numerologyIndex: 0,
    treeSeat: "Daath",
    essence: "Uranus arrives through three linked keys: The Fool names unprecedented possibility, Death the severance of a form that cannot contain it, and The Hanged Man the human interval of surrender and reorientation",
    ground: "Let the interruption reveal what is newly possible without pretending the loss or uncertainty is unreal.",
  },
  { name: "Neptune", glyph: "♆", body: Planet.Neptune, majorIndices: [12], essence: "Vision, surrender, compassion, glamour, and dissolution loosen ordinary certainty", ground: "Let mystery remain mysterious while checking the facts that protect you." },
  {
    name: "Pluto",
    glyph: "♇",
    body: Planet.Pluto,
    majorIndices: [13, 20],
    keyLabels: ["Astrological Face", "Tree of Life Face"],
    numerologyIndex: 13,
    treeSeat: "Kether",
    essence: "Pluto bears two keys: Death describes the irreversible ending of a form, while Judgement names the awakening that may call through and beyond it",
    ground: "Mourn the self or future that cannot be returned to. Then pour your whole being into the sacred next moment without demanding that grief become optimism.",
  },
  { name: "Chiron", glyph: "⚷", body: Asteroid.Chiron, majorIndices: [5], tradition: "Lost Opal", essence: "The wound that becomes wisdom asks to be held inside teaching, tradition, and lived initiation", ground: "Offer medicine from what you have embodied, not merely understood." },
  { name: "North Node", glyph: "☊", body: LunarPoint.TrueNode, majorIndices: [18], essence: "The evolutionary pull points toward unfamiliar emotional intelligence and future growth", ground: "Take one honest step toward the pattern that asks more consciousness of you." },
  { name: "Lilith", technicalName: "Mean Black Moon Lilith", glyph: "⚸", body: LunarPoint.MeanApogee, majorIndices: [], seal: "⚸", placeholderImage: `${PLACEHOLDER_BASE}/lilith.webp`, sealVisualLabel: "Lilith", sealKind: "Celestial Point", correspondencePending: true, essence: "Lilith marks the lunar apogee as a point of refusal, estrangement, sovereignty, and material that resists polite containment", ground: "Name what has been exiled without letting the exile become your only identity." },
  { name: "Ceres", glyph: "⚳", body: Asteroid.Ceres, majorIndices: [], seal: "⚳", placeholderImage: `${PLACEHOLDER_BASE}/ceres.webp`, sealVisualLabel: "Ceres", sealKind: "Celestial Point", correspondencePending: true, essence: "Ceres brings nourishment, separation, grief, return, and the terms through which care becomes sustainable", ground: "Ask what truly feeds the life in front of you." },
  { name: "Pallas", glyph: "⚴", body: Asteroid.Pallas, majorIndices: [], seal: "⚴", placeholderImage: `${PLACEHOLDER_BASE}/pallas.webp`, sealVisualLabel: "Pallas", sealKind: "Celestial Point", correspondencePending: true, essence: "Pallas brings pattern-recognition, strategy, craft, and the intelligence that sees how the pieces may be arranged", ground: "Solve the pattern without sacrificing the people inside it." },
  { name: "Juno", glyph: "⚵", body: Asteroid.Juno, majorIndices: [], seal: "⚵", placeholderImage: `${PLACEHOLDER_BASE}/juno.webp`, sealVisualLabel: "Juno", sealKind: "Celestial Point", correspondencePending: true, essence: "Juno brings covenant, equality, loyalty, power-sharing, and the promises through which relationship becomes consequential", ground: "Examine whether the agreement honors every person bound by it." },
  { name: "Vesta", glyph: "⚶", body: Asteroid.Vesta, majorIndices: [], seal: "⚶", placeholderImage: `${PLACEHOLDER_BASE}/vesta.webp`, sealVisualLabel: "Vesta", sealKind: "Celestial Point", correspondencePending: true, essence: "Vesta tends devotion, sacred concentration, the hearth, and the living flame protected through disciplined attention", ground: "Return one fragment of scattered attention to what you call sacred." },
];

const ANGLE_DATA = {
  ascendant: {
    name: "Ascendant",
    glyph: "ASC",
    seal: "ASC",
    placeholderImage: `${PLACEHOLDER_BASE}/ascendant.webp`,
    sealVisualLabel: "Ascendant",
    sealKind: "Celestial Angle",
    correspondencePending: true,
    isAngle: true,
    essence: "The eastern threshold describes the manner in which this moment enters embodiment and meets the world",
    ground: "Meet the moment through the quality you actually want to emanate.",
  },
  mc: {
    name: "Midheaven",
    glyph: "MC",
    seal: "MC",
    placeholderImage: `${PLACEHOLDER_BASE}/midheaven.webp`,
    sealVisualLabel: "Midheaven",
    sealKind: "Celestial Angle",
    correspondencePending: true,
    isAngle: true,
    essence: "The highest point describes the visible direction, public culmination, and calling of the moment",
    ground: "Align the visible action with the summit the work is truly serving.",
  },
  vertex: {
    name: "Vertex",
    glyph: "Vx",
    seal: "Vx",
    placeholderImage: `${PLACEHOLDER_BASE}/vertex.webp`,
    sealVisualLabel: "Vertex",
    sealKind: "Celestial Angle",
    correspondencePending: true,
    isAngle: true,
    essence: "The western auxiliary angle describes encounters that arrive through other people, turning points, and events that feel larger than personal intention",
    ground: "Meet the encounter without surrendering discernment to the feeling of fate.",
  },
  fortune: {
    name: "Lot of Fortune",
    glyph: "⊗",
    seal: "⊗",
    placeholderImage: `${PLACEHOLDER_BASE}/lot-of-fortune.webp`,
    sealVisualLabel: "Lot of Fortune",
    sealKind: "Calculated Point",
    correspondencePending: true,
    isAngle: true,
    essence: "The Lot of Fortune joins Sun, Moon, horizon, and sect to describe the material conditions through which vitality may find embodiment",
    ground: "Work with the circumstances that are actually present rather than the ones the mind expected.",
  },
};

const RESULT_GROUPS = [
  {
    title: "Luminaries & Mind",
    tabLabel: "Identity & Feelings",
    names: ["Sun", "Moon", "Mercury"],
    description: "Who am I being? What am I feeling? How am I thinking—and how am I speaking it?",
    definition: "In astrology, the Luminaries are the Sun and Moon: the two great lights associated with conscious identity and instinctive, emotional life. Mercury is placed beside them here because it names, connects, and communicates what those lights are experiencing.",
  },
  {
    title: "Desire, Action & Growth",
    tabLabel: "Desire & Growth",
    names: ["Venus", "Mars", "Jupiter"],
    description: "What am I drawn toward? What am I willing to do? Where is life asking me to grow?",
    definition: "Venus describes attraction, value, pleasure, and relationship. Mars describes drive, assertion, conflict, and decisive movement. Jupiter describes faith, opportunity, meaning, and the urge to expand beyond the present boundary.",
  },
  {
    title: "Structure & Outer Weather",
    tabLabel: "Outer Weather",
    names: ["Saturn", "Uranus", "Neptune"],
    description: "What is shaping the limits? What is breaking the pattern? What dream—or fog—is moving through it?",
    definition: "Outer Weather is our plain-language name for the slower planetary currents. Saturn defines the structure and its limits, Uranus interrupts what has become fixed, and Neptune dissolves certainty so imagination, longing, or confusion can enter.",
  },
  {
    title: "Underworld, Wound & Shadow",
    tabLabel: "Shadow & Wound",
    names: ["Pluto", "Chiron", "Lilith"],
    description: "What must change? What still hurts? What has been refused, exiled, or left unnamed?",
    definition: "Underworld and Shadow do not mean evil. They name the material hidden below ordinary awareness: Pluto’s irreversible transformation, Chiron’s wound becoming lived wisdom, and Lilith’s encounter with refusal, exile, and uncompromised sovereignty.",
  },
  {
    title: "Direction & Inheritance",
    tabLabel: "Direction",
    names: ["North Node", "South Node", "Lot of Fortune"],
    description: "What do I already know by heart? What unfamiliar direction asks me to grow? What makes the path livable now?",
    definition: "Inheritance is the pattern already carried into the moment, represented here by the South Node. Direction is the developing path of the North Node. The Lot of Fortune joins the Sun, Moon, horizon, and sect to describe where those themes meet material circumstance.",
  },
  {
    title: "Nourishment, Strategy & Covenant",
    tabLabel: "Care & Covenant",
    names: ["Ceres", "Pallas", "Juno"],
    description: "What sustains me? What pattern needs a wiser strategy? What promise asks to be honored?",
    definition: "Ceres concerns nourishment, separation, grief, and return. Pallas concerns pattern-recognition, strategy, and craft. Juno concerns covenant: the promises, loyalties, power-sharing, and consequences that make a relationship binding.",
  },
  {
    title: "Devotion & Local Angles",
    tabLabel: "Devotion & Angles",
    names: ["Vesta", "Ascendant", "Midheaven", "Vertex"],
    description: "What receives my devotion? How do I enter this moment? What is becoming visible—and what encounter is arriving?",
    definition: "Angles anchor the sky to an exact time and place. The Ascendant is the eastern doorway, the Midheaven is the visible summit, and the Vertex is a western point associated with consequential encounters. Vesta joins them here as the flame of devotion and sustained attention.",
  },
];

const ROW_PROMPTS = {
  Sun: "Who am I being?",
  Moon: "What am I feeling?",
  Mercury: "How am I thinking—and how am I speaking it?",
  Venus: "What am I drawn toward?",
  Mars: "What am I willing to do?",
  Jupiter: "Where is life asking me to grow?",
  Saturn: "What is shaping the limits?",
  Uranus: "What is breaking the pattern?",
  Neptune: "What dream—or fog—is moving through it?",
  Pluto: "What must change?",
  Chiron: "What still hurts—and what wisdom is it becoming?",
  Lilith: "What has been refused, exiled, or left unnamed?",
  "North Node": "What unfamiliar direction asks me to grow?",
  "South Node": "What do I already know by heart?",
  "Lot of Fortune": "What makes the path livable now?",
  Ceres: "What sustains me?",
  Pallas: "What pattern needs a wiser strategy?",
  Juno: "What promise asks to be honored?",
  Vesta: "What receives my devotion?",
  Ascendant: "How do I enter this moment?",
  Midheaven: "What is becoming visible?",
  Vertex: "What encounter is arriving?",
};

const NUMBER_MEANINGS = {
  1: ["Initiation", "A singular impulse asks to become conscious direction, self-definition, and a genuine beginning."],
  2: ["Polarity", "Two forces seek relationship, reflection, receptivity, and an honest way to coexist without erasing difference."],
  3: ["Expression", "The line wants to create, communicate, multiply, and give an inner pattern a visible or relational form."],
  4: ["Foundation", "Energy seeks order, boundary, reliability, and a structure strong enough to hold what is becoming real."],
  5: ["Change", "Friction breaks stagnation and asks for movement, experimentation, freedom, and a more adaptive center."],
  6: ["Integration", "The row returns to choice, responsibility, harmony, relationship, and the work of bringing parts into accord."],
  7: ["Discernment", "Experience turns inward for testing, contemplation, strategy, and knowledge that cannot be borrowed from the crowd."],
  8: ["Power", "The current concerns embodiment, consequence, reciprocity, endurance, and the ethical handling of material force."],
  9: ["Completion", "The line gathers wisdom, compassion, culmination, and the release required before another cycle can begin."],
  10: ["Renewal", "Completion turns into a new cycle: experience asks to be carried forward without repeating the former pattern unconsciously."],
  11: ["Illumination", "A master-number tension heightens intuition and asks inspiration to pass through a balanced, conscious channel."],
  12: ["Creative Service", "Individual will and relationship combine into expression that serves a purpose larger than either force alone."],
  13: ["Transformation", "A former structure must be changed through disciplined work so its essential value can enter a more enduring form."],
  14: ["Measured Freedom", "Movement and experimentation ask for restraint, rhythm, and enough structure to keep freedom from becoming dispersion."],
  15: ["Magnetic Responsibility", "Desire, relationship, and material attraction ask to be handled consciously rather than allowed to choose by compulsion."],
  16: ["Reorientation", "A false or outgrown structure breaks open so inner truth, humility, and a more accurate foundation can emerge."],
  17: ["Guiding Faith", "Independent purpose is refined through contemplation, hope, and the testing that turns private insight into trustworthy direction."],
  18: ["Compassionate Power", "Material force meets collective feeling; influence must be handled without confusing projection, sacrifice, and genuine care."],
  19: ["Self-Sovereignty", "A completed cycle returns to the individual, asking confidence, visibility, and leadership to remain answerable to the whole."],
  20: ["Awakening Partnership", "Sensitivity and relationship become a call to conscious participation, shared responsibility, and renewed choice."],
  21: ["Creative Fulfillment", "Expression reaches completion and asks its wisdom to be shared before the next beginning takes form."],
  22: ["Embodied Vision", "A master-number current asks a large vision to become useful, durable, and fully present in material form."],
};

const SEPHIROTH = [
  { number: 1, name: "Kether", title: "Crown", x: 50, y: 11, current: "the first concentration of limitless possibility into being" },
  { number: 2, name: "Chokmah", title: "Wisdom", x: 78, y: 24, current: "unbounded force, impulse, and the first outpouring of creative energy" },
  { number: 3, name: "Binah", title: "Understanding", x: 22, y: 24, current: "form, boundary, comprehension, and the great receiving intelligence" },
  { number: 4, name: "Chesed", title: "Mercy", x: 78, y: 43, current: "expansion, generosity, order, and benevolent authority" },
  { number: 5, name: "Geburah", title: "Severity", x: 22, y: 43, current: "strength, correction, consequence, and the courage to cut" },
  { number: 6, name: "Tiphareth", title: "Beauty", x: 50, y: 55, current: "integration, sacrifice, identity, and the harmonizing solar heart" },
  { number: 7, name: "Netzach", title: "Victory", x: 78, y: 71, current: "desire, attraction, feeling, endurance, and living relationship" },
  { number: 8, name: "Hod", title: "Splendour", x: 22, y: 71, current: "language, pattern, analysis, symbol, and the shaping intelligence" },
  { number: 9, name: "Yesod", title: "Foundation", x: 50, y: 84, current: "image, dream, memory, transmission, and the subtle foundation of form" },
  { number: 10, name: "Malkuth", title: "Kingdom", x: 50, y: 95, current: "embodiment, material fact, consequence, and the world in which the current must be lived" },
];

const DAATH = { number: null, name: "Daath", title: "Knowledge / Threshold", x: 50, y: 34, current: "an unnumbered threshold in the Abyss, not an eleventh ordinary Sephirah" };

const PATH_DATA = [
  { number: 11, hebrew: "א", letter: "Aleph", from: "Kether", to: "Chokmah", majorIndex: 0 },
  { number: 12, hebrew: "ב", letter: "Beth", from: "Kether", to: "Binah", majorIndex: 1 },
  { number: 13, hebrew: "ג", letter: "Gimel", from: "Kether", to: "Tiphareth", majorIndex: 2 },
  { number: 14, hebrew: "ד", letter: "Daleth", from: "Chokmah", to: "Binah", majorIndex: 3 },
  { number: 15, hebrew: "ה", letter: "Heh", from: "Chokmah", to: "Tiphareth", majorIndex: 4 },
  { number: 16, hebrew: "ו", letter: "Vav", from: "Chokmah", to: "Chesed", majorIndex: 5 },
  { number: 17, hebrew: "ז", letter: "Zayin", from: "Binah", to: "Tiphareth", majorIndex: 6 },
  { number: 18, hebrew: "ח", letter: "Cheth", from: "Binah", to: "Geburah", majorIndex: 7 },
  { number: 19, hebrew: "ט", letter: "Teth", from: "Chesed", to: "Geburah", majorIndex: 8 },
  { number: 20, hebrew: "י", letter: "Yod", from: "Chesed", to: "Tiphareth", majorIndex: 9 },
  { number: 21, hebrew: "כ", letter: "Kaph", from: "Chesed", to: "Netzach", majorIndex: 10 },
  { number: 22, hebrew: "ל", letter: "Lamed", from: "Geburah", to: "Tiphareth", majorIndex: 11 },
  { number: 23, hebrew: "מ", letter: "Mem", from: "Geburah", to: "Hod", majorIndex: 12 },
  { number: 24, hebrew: "נ", letter: "Nun", from: "Tiphareth", to: "Netzach", majorIndex: 13 },
  { number: 25, hebrew: "ס", letter: "Samekh", from: "Tiphareth", to: "Yesod", majorIndex: 14 },
  { number: 26, hebrew: "ע", letter: "Ayin", from: "Tiphareth", to: "Hod", majorIndex: 15 },
  { number: 27, hebrew: "פ", letter: "Peh", from: "Netzach", to: "Hod", majorIndex: 16 },
  { number: 28, hebrew: "צ", letter: "Tzaddi", from: "Netzach", to: "Yesod", majorIndex: 17 },
  { number: 29, hebrew: "ק", letter: "Qoph", from: "Netzach", to: "Malkuth", majorIndex: 18 },
  { number: 30, hebrew: "ר", letter: "Resh", from: "Hod", to: "Yesod", majorIndex: 19 },
  { number: 31, hebrew: "ש", letter: "Shin", from: "Hod", to: "Malkuth", majorIndex: 20 },
  { number: 32, hebrew: "ת", letter: "Tav", from: "Yesod", to: "Malkuth", majorIndex: 21 },
];

const WORLD_DATA = {
  Wands: { name: "Atziluth", hebrew: "אֲצִילוּת", translation: "Emanation", element: "Fire", elementGlyph: "🜂", phrase: "the archetypal world of emanation and will" },
  Cups: { name: "Briah", hebrew: "בְּרִיאָה", translation: "Creation", element: "Water", elementGlyph: "🜄", phrase: "the creative world of feeling and reception" },
  Swords: { name: "Yetzirah", hebrew: "יְצִירָה", translation: "Formation", element: "Air", elementGlyph: "🜁", phrase: "the formative world of image, language, and mind" },
  Pentacles: { name: "Assiah", hebrew: "עֲשִׂיָּה", translation: "Action", element: "Earth", elementGlyph: "🜃", phrase: "the active material world of embodiment and consequence" },
};

const SUIT_START = { Wands: 22, Cups: 36, Swords: 50, Pentacles: 64 };
const formatterCache = new Map();
const state = { deviceLocation: null, confirmedPlace: null, engine: null, engineReady: false, busy: false, lines: [], activeTreeLine: null, personalContext: null, generation: 0, activeGroup: 0, searchQuery: "" };
const hasDocument = typeof document !== "undefined";

const form = hasDocument ? document.querySelector("[data-snapshot-form]") : null;
const momentDateControl = form?.querySelector("[data-date-control]") || null;
const momentTimeControl = form?.querySelector("[data-time-control]") || null;
const status = hasDocument ? document.querySelector("[data-snapshot-status]") : null;
const locationButton = hasDocument ? document.querySelector("[data-use-location]") : null;
const momentLocationField = hasDocument ? document.querySelector("[data-moment-location-field]") : null;
const momentLocationInput = hasDocument ? document.querySelector("[data-moment-location-input]") : null;
const momentLocationResults = hasDocument ? document.querySelector("[data-moment-location-results]") : null;
const momentLocationMessage = hasDocument ? document.querySelector("[data-moment-location-message]") : null;
const calculateButton = hasDocument ? document.querySelector("[data-calculate]") : null;
const results = hasDocument ? document.querySelector("[data-snapshot-results]") : null;
const resultsMeta = hasDocument ? document.querySelector("[data-results-meta]") : null;
const pages = hasDocument ? document.querySelector("[data-snapshot-pages]") : null;
const snapshotNavigator = hasDocument ? document.querySelector("[data-snapshot-navigator]") : null;
const snapshotSearch = hasDocument ? document.querySelector("[data-snapshot-search]") : null;
const snapshotSearchClear = hasDocument ? document.querySelector("[data-snapshot-search-clear]") : null;
const snapshotSearchStatus = hasDocument ? document.querySelector("[data-snapshot-search-status]") : null;
const snapshotSectionTabs = hasDocument ? document.querySelector("[data-snapshot-section-tabs]") : null;
const snapshotQuickMore = hasDocument ? document.querySelector("[data-snapshot-quick-more]") : null;
const snapshotQuickMoreList = hasDocument ? document.querySelector("[data-snapshot-quick-more-list]") : null;
const printButton = hasDocument ? document.querySelector("[data-print]") : null;
const printModeSelect = hasDocument ? document.querySelector("[data-print-mode]") : null;
const artModeSelect = hasDocument ? document.querySelector("[data-art-mode]") : null;
const entry = hasDocument ? document.querySelector("[data-seeker-entry]") : null;
const entrySkip = hasDocument ? document.querySelector("[data-entry-skip]") : null;
const birthDialog = hasDocument ? document.querySelector("[data-birth-dialog]") : null;
const birthForm = hasDocument ? document.querySelector("[data-birth-form]") : null;
const birthDateControl = birthForm?.querySelector("[data-date-control]") || null;
const birthTimeConfidence = hasDocument ? document.querySelector("[data-birth-time-confidence]") : null;
const birthTimeControl = hasDocument ? document.querySelector("[data-birth-time-control]") : null;
const birthTimeNote = hasDocument ? document.querySelector("[data-birth-time-note]") : null;
const birthLocationField = hasDocument ? document.querySelector("[data-birth-location-field]") : null;
const birthLocationInput = hasDocument ? document.querySelector("[data-birth-location-input]") : null;
const birthLocationResults = hasDocument ? document.querySelector("[data-birth-location-results]") : null;
const birthLocationMessage = hasDocument ? document.querySelector("[data-birth-location-message]") : null;
const personalContext = hasDocument ? document.querySelector("[data-personal-context]") : null;
const treeDialog = hasDocument ? document.querySelector("[data-tree-dialog]") : null;
const treeCanvas = hasDocument ? document.querySelector("[data-tree-canvas]") : null;
const treeNodes = hasDocument ? document.querySelector("[data-tree-nodes]") : null;
const treeReading = hasDocument ? document.querySelector("[data-tree-reading]") : null;
const cardDialog = hasDocument ? document.querySelector("[data-card-dialog]") : null;
const cardDialogImage = hasDocument ? document.querySelector("[data-card-dialog-image]") : null;
const cardDialogName = hasDocument ? document.querySelector("[data-card-dialog-name]") : null;
const cardDialogHermeticTitle = hasDocument ? document.querySelector("[data-card-dialog-hermetic-title]") : null;
const cardDialogCategory = hasDocument ? document.querySelector("[data-card-dialog-category]") : null;
const cardDialogCategorySymbol = hasDocument ? document.querySelector("[data-card-dialog-category-symbol]") : null;
const cardDialogCategoryLabel = hasDocument ? document.querySelector("[data-card-dialog-category-label]") : null;
const cardDialogDescription = hasDocument ? document.querySelector("[data-card-dialog-description]") : null;
const infoDialog = hasDocument ? document.querySelector("[data-info-dialog]") : null;
const infoDialogTitle = hasDocument ? document.querySelector("[data-info-dialog-title]") : null;
const infoDialogBody = hasDocument ? document.querySelector("[data-info-dialog-body]") : null;
const donateFloat = hasDocument ? document.querySelector("[data-donate-float]") : null;
const donateFloatClose = hasDocument ? document.querySelector("[data-donate-float-close]") : null;

function cardFile(index) {
  return `${CARD_BASE}/${String(index).padStart(2, "0")}.webp`;
}

function cardPreviewFile(index) {
  return `${CARD_PREVIEW_BASE}/${String(index).padStart(2, "0")}.webp`;
}

function sephirahSealFile(number) {
  return `./assets/sephiroth/${String(number).padStart(2, "0")}.svg`;
}

function minorCardIndex(suit, number) {
  return SUIT_START[suit] + number - 1;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function entityNameForProse(name, sentenceStart = false) {
  if (name === "Sun" || name === "Moon") return `${sentenceStart ? "The" : "the"} ${name}`;
  return name;
}

function normalizeLongitude(value) {
  return ((value % 360) + 360) % 360;
}

function signAndDecan(longitude) {
  const normalized = normalizeLongitude(longitude);
  const signIndex = Math.floor(normalized / SIGN_DEGREES);
  const degreeInSign = normalized - signIndex * SIGN_DEGREES;
  const decanIndex = Math.min(2, Math.floor(degreeInSign / DECAN_DEGREES));
  const sign = SIGN_DATA[signIndex];
  const ruler = { name: sign.ruler, ...RULER_DATA[sign.ruler] };
  const modernRuler = sign.modernRuler ? { name: sign.modernRuler, ...RULER_DATA[sign.modernRuler] } : null;
  const [cardName, title, suit, number, meaning, ground] = DECAN_DATA[signIndex][decanIndex];
  return {
    sign,
    ruler: { ...ruler, modern: modernRuler },
    signIndex,
    degreeInSign,
    decanIndex,
    decan: { cardName, title, suit, number, meaning, ground, cardIndex: minorCardIndex(suit, number) },
  };
}

function formatZodiacPosition(longitude) {
  const totalSeconds = Math.round(normalizeLongitude(longitude) * 3600) % (360 * 3600);
  const signIndex = Math.floor(totalSeconds / (30 * 3600));
  const withinSign = totalSeconds % (30 * 3600);
  const degree = Math.floor(withinSign / 3600);
  const minute = Math.floor((withinSign % 3600) / 60);
  const second = withinSign % 60;
  return `${String(degree).padStart(2, "0")}° ${String(minute).padStart(2, "0")}′ ${String(second).padStart(2, "0")}″ ${SIGN_DATA[signIndex].name}`;
}

function ordinalDecan(index) {
  return ["first", "second", "third"][index];
}

function decanLabel(index) {
  return ["1st Decan", "2nd Decan", "3rd Decan"][index];
}

function ordinalHouse(number) {
  const remainder = number % 100;
  if (remainder >= 11 && remainder <= 13) return `${number}th`;
  return `${number}${({ 1: "st", 2: "nd", 3: "rd" })[number % 10] || "th"}`;
}

function houseNumberFor(longitude, cusps) {
  const target = normalizeLongitude(longitude);
  for (let number = 1; number <= 12; number += 1) {
    const start = normalizeLongitude(cusps[number]);
    const next = normalizeLongitude(cusps[number === 12 ? 1 : number + 1]);
    const span = normalizeLongitude(next - start);
    const offset = normalizeLongitude(target - start);
    if (offset < span) return number;
  }
  return 12;
}

function houseCuspsAreUsable(cusps) {
  if (!Array.isArray(cusps) || cusps.length < 13) return false;
  return Array.from({ length: 12 }, (_, index) => index + 1).every((number) => {
    const start = cusps[number];
    const next = cusps[number === 12 ? 1 : number + 1];
    return Number.isFinite(start)
      && Number.isFinite(next)
      && normalizeLongitude(next - start) > 0.0001;
  });
}

function houseFor(longitude, cusps, system) {
  const number = houseNumberFor(longitude, cusps);
  return {
    ...HOUSE_DATA[number - 1],
    number,
    label: ordinalHouse(number),
    system,
  };
}

function naturalHouseForSign(signIndex) {
  const number = signIndex + 1;
  return {
    ...HOUSE_DATA[signIndex],
    number,
    label: ordinalHouse(number),
    system: "Natural zodiac",
  };
}

function motionFromSpeed(speed, definition = {}) {
  if (definition.motionLabel) return { label: definition.motionLabel, className: "", explanation: "This row uses a defined symbolic motion state." };
  if (definition.isAngle) {
    return definition.name === "Lot of Fortune"
      ? { label: "Calculated Point", className: "", explanation: "The Lot of Fortune is derived from the Sun, Moon, Ascendant, and whether the chart is diurnal or nocturnal. It does not move directly or retrograde like a planet." }
      : { label: "Angle", className: "", explanation: "This is a local chart angle calculated from the selected time and horizon. Direct and retrograde motion do not apply to it." };
  }
  if (Math.abs(speed) < 0.001) return { label: "Stationing", className: "", explanation: "From Earth, this body appears nearly motionless while changing between direct and retrograde motion. Its symbolism is often concentrated or held at a threshold." };
  if (speed < 0) return { label: "Retrograde", className: "snapshot-motion--retrograde", explanation: "From Earth, this body appears to move backward through the zodiac. The current is often experienced inwardly, revisited, revised, or expressed less directly." };
  return { label: "Direct", className: "", explanation: "From Earth, this body is moving forward through the zodiac in its ordinary apparent direction. Its current tends to express more openly and straightforwardly." };
}

function buildLine(definition, longitude, speed, options = {}) {
  const correspondence = signAndDecan(longitude);
  const entityCardIndices = Array.isArray(definition.majorIndices)
    ? definition.majorIndices
    : definition.majorIndex === null || definition.majorIndex === undefined ? [] : [definition.majorIndex];
  const entityCards = entityCardIndices.map((index, cardPosition) => ({
    index,
    name: MAJORS[index],
    label: definition.keyLabels?.[cardPosition] || (entityCardIndices.length > 1 ? `Key ${cardPosition + 1}` : "Celestial Entity"),
  }));
  const numerologyIndex = definition.numerologyIndex ?? entityCardIndices[0] ?? null;
  return {
    ...correspondence,
    name: definition.name,
    glyph: definition.glyph || definition.seal || "✦",
    technicalName: definition.technicalName || definition.name,
    longitude: normalizeLongitude(longitude),
    speed,
    entityCards,
    entityCardIndex: numerologyIndex,
    entityCardName: numerologyIndex === null ? definition.name : MAJORS[numerologyIndex],
    entityEssence: definition.essence,
    entityGround: definition.ground,
    seal: definition.seal || null,
    placeholderImage: definition.placeholderImage || null,
    sealVisualLabel: definition.sealVisualLabel || definition.name,
    sealKind: definition.sealKind || "Celestial Point",
    correspondencePending: Boolean(definition.correspondencePending),
    tradition: definition.tradition || (entityCardIndices.length > 1 ? "Lost Opal" : "Golden Dawn lineage"),
    treeSeat: definition.treeSeat || null,
    nodeGlyph: options.nodeGlyph || null,
    reversed: Boolean(options.reversed),
    motion: motionFromSpeed(speed, definition),
  };
}

function readingFor(line) {
  const reversal = line.reversed
    ? " Here The Moon is reversed: the image turns toward inherited familiarity, memory, and the shadow of automatic repetition."
    : "";
  const signVoice = line.sign.majorIndex === 18 && line.name === "Moon"
    ? "The Moon doubles its emphasis and shapes that voice"
    : `${MAJORS[line.sign.majorIndex]} shapes that voice`;
  return `${line.entityEssence}. ${signVoice} through ${line.sign.field}. ${line.decan.cardName} ${line.decan.meaning}.${reversal}`;
}

function tarotLineFor(line) {
  const reversed = line.reversed ? " (reversed)" : "";
  const entityVoice = line.entityCards.length
    ? line.entityCards.map((card, index) => `${card.name}${index === 0 ? reversed : ""}`).join(" / ")
    : line.entityCardName;
  return `${entityVoice} + ${MAJORS[line.sign.majorIndex]} + ${line.decan.cardName}`;
}

function cardFigureHtml({ category, name, cardIndex, description = "", reversed = false, nodeGlyph = null, seal = null, placeholderImage = null, sealKind = "Celestial Point", sealVisualLabel = name, correspondencePending = false, sourceName = "" }) {
  const safeName = escapeHtml(name);
  const hermeticTitle = Number.isInteger(cardIndex) ? HERMETIC_CARD_TITLES[cardIndex] || "" : "";
  let visual;
  if (placeholderImage || seal) {
    const imageSource = placeholderImage || `${PLACEHOLDER_BASE}/developing-correspondence.webp`;
    visual = `<div class="snapshot-placeholder-card" role="img" aria-label="${safeName}; ${escapeHtml(sealKind)}"><img src="${escapeHtml(imageSource)}" alt="" width="216" height="360" loading="lazy" decoding="async" fetchpriority="low" data-print-image></div>`;
  } else {
    const reverseClass = reversed ? " snapshot-card-visual--reversed" : "";
    const reverseAlt = reversed ? ", reversed" : "";
    const badge = nodeGlyph ? `<span class="snapshot-node-seal" aria-hidden="true">${escapeHtml(nodeGlyph)}</span>` : "";
    visual = `<button class="snapshot-card-button" type="button" data-card-open data-card-name="${safeName}" data-card-hermetic-title="${escapeHtml(hermeticTitle)}" data-card-category="${escapeHtml(category)}" data-card-description="${escapeHtml(description)}" data-card-src="${cardFile(cardIndex)}" data-card-reversed="${reversed ? "true" : "false"}" aria-label="Enlarge ${safeName}${reverseAlt}"><span class="snapshot-card-visual${reverseClass}"><img src="${cardFile(cardIndex)}" alt="${safeName} tarot card${reverseAlt}" width="320" height="533" loading="lazy" decoding="async" fetchpriority="low" data-print-image>${badge}</span></button>`;
  }
  const warning = correspondencePending
    ? `<details class="correspondence-warning" data-info-title="Developing correspondence"><summary aria-label="Explain this developing correspondence" aria-haspopup="dialog">!</summary><p>Additional correspondence and definition in development.</p></details>`
    : "";
  const source = sourceName ? `<span class="snapshot-card-source">${escapeHtml(sourceName)}</span>` : "";
  return `<figure>${visual}<figcaption><small>${escapeHtml(category)}</small><span class="snapshot-card-name">${safeName}${reversed ? " · Reversed" : ""}</span>${source}${warning}</figcaption></figure>`;
}

function entityCardDescription(line, card) {
  if (line.name === "Uranus") {
    const uranusVoices = {
      "The Fool": "For Uranus, The Fool is arrival before form: unprecedented possibility entering the field before anyone can say what it must become.",
      Death: "For Uranus, Death is the severance of a form that can no longer contain what is arriving. The break is real, even when it opens freedom.",
      "The Hanged Man": "For Uranus, The Hanged Man is the human interval of suspension: the water beneath thought, where orientation dissolves before a new perspective can be lived.",
    };
    return uranusVoices[card.name];
  }
  if (line.name === "Pluto") {
    return card.name === "Death"
      ? "For Pluto, Death is the embodied astrological face: irreversible change, mourning for the self that cannot be returned to, and the sacred demand to enter the next moment."
      : "For Pluto, Judgement is the Tree of Life face at Kether: an awakening call through dissolution, shown beside Death so neither grief nor renewal is erased.";
  }
  return `${card.name} is the celestial voice of ${entityNameForProse(line.name)} in this row. ${line.entityEssence}.`;
}

function entityCardsHtml(line) {
  if (!line.entityCards.length) {
    return `<div class="snapshot-card-group snapshot-card-group--single" style="--card-count:1">${cardFigureHtml({
      category: line.sealKind,
      name: line.name,
      seal: line.seal,
      placeholderImage: line.placeholderImage,
      sealKind: line.sealKind,
      sealVisualLabel: line.sealVisualLabel,
      correspondencePending: line.correspondencePending,
    })}</div>`;
  }
  const cards = line.entityCards.map((card, index) => cardFigureHtml({
    category: line.entityCards.length > 1 ? card.label : "Celestial Entity",
    name: card.name,
    cardIndex: card.index,
    description: entityCardDescription(line, card),
    reversed: index === 0 && line.reversed,
    nodeGlyph: index === 0 ? line.nodeGlyph : null,
    sourceName: line.name,
  }));
  if (cards.length > 1) {
    const carouselCards = cards.map((card, index) => `<div class="snapshot-carousel-card" data-carousel-card data-carousel-index="${index}"${index === 0 ? "" : " hidden"}>${card}</div>`).join("");
    return `
      <div class="snapshot-card-carousel" data-card-carousel aria-label="${escapeHtml(line.name)} has ${cards.length} Tarot correspondences">
        <div class="snapshot-carousel-track">${carouselCards}</div>
        <div class="snapshot-carousel-controls">
          <button type="button" data-carousel-prev aria-label="Previous ${escapeHtml(line.name)} card">&lsaquo;</button>
          <span data-carousel-status aria-live="polite">1 / ${cards.length}</span>
          <button type="button" data-carousel-next aria-label="Next ${escapeHtml(line.name)} card">&rsaquo;</button>
        </div>
      </div>`;
  }
  return `<div class="snapshot-card-group snapshot-card-group--single" style="--card-count:1">${cards[0]}</div>`;
}

function signCardsHtml(line) {
  const signCard = cardFigureHtml({
    category: `${line.sign.glyph} ${line.sign.name}`,
    name: MAJORS[line.sign.majorIndex],
    cardIndex: line.sign.majorIndex,
    description: `${MAJORS[line.sign.majorIndex]} carries ${line.sign.name}'s field of ${line.sign.field} in this row.`,
  });
  const rulerCardName = MAJORS[line.ruler.majorIndex];
  const rulerCard = cardFigureHtml({
    category: `Traditional Ruler · ${line.ruler.glyph} ${line.ruler.name}`,
    name: rulerCardName,
    cardIndex: line.ruler.majorIndex,
    description: `${line.sign.name} is traditionally ruled by ${line.ruler.name}. For this reading, that planet is translated into its Tarot card, ${rulerCardName}; the card carries ${line.ruler.influence} into the way this zodiacal field conducts the line.`,
  });
  const cards = [
    { label: "Sign Key", html: signCard },
    { label: "Ruler", html: rulerCard },
  ];
  return `
    <div class="snapshot-card-carousel snapshot-card-carousel--sign" data-card-carousel aria-label="${escapeHtml(line.sign.name)} sign key and traditional ruling planet card">
      <div class="snapshot-carousel-track">${cards.map((card, index) => `<div class="snapshot-carousel-card" data-carousel-card data-carousel-index="${index}" data-carousel-label="${escapeHtml(card.label)}"${index === 0 ? "" : " hidden"}>${card.html}</div>`).join("")}</div>
      <div class="snapshot-carousel-controls">
        <button type="button" data-carousel-prev aria-label="Previous ${escapeHtml(line.sign.name)} correspondence">&lsaquo;</button>
        <span data-carousel-status aria-live="polite">Sign Key</span>
        <button type="button" data-carousel-next aria-label="Next ${escapeHtml(line.sign.name)} correspondence">&rsaquo;</button>
      </div>
    </div>`;
}

function moveCarousel(button, direction) {
  const carousel = button.closest("[data-card-carousel]");
  if (!carousel) return;
  const cards = [...carousel.querySelectorAll("[data-carousel-card]")];
  const current = cards.findIndex((card) => !card.hidden);
  const next = (current + direction + cards.length) % cards.length;
  cards.forEach((card, index) => { card.hidden = index !== next; });
  carousel.querySelector("[data-carousel-status]").textContent = cards[next].dataset.carouselLabel || `${next + 1} / ${cards.length}`;
}

function standaloneSentence(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const capitalized = trimmed.replace(/[A-Za-z]/, (letter) => letter.toUpperCase());
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function identityTileHtml({ id, glyph, name, kind, description, modifier = "" }) {
  const tooltip = standaloneSentence(description);
  return `
    <button class="snapshot-identity-tile${modifier ? ` ${modifier}` : ""}" type="button" data-identity-explainer data-info-title="${escapeHtml(`${kind}: ${name}`)}" aria-haspopup="dialog" aria-describedby="${escapeHtml(id)}" aria-label="${escapeHtml(`${kind}: ${name}. Show a short explanation.`)}">
      <b aria-hidden="true">${escapeHtml(glyph)}</b>
      <strong>${escapeHtml(name)}</strong>
      <span class="snapshot-identity-tooltip" id="${escapeHtml(id)}" role="tooltip"><em>${escapeHtml(kind)}:</em> ${escapeHtml(tooltip)}</span>
    </button>`;
}

function celestialAssociationTilesHtml(line, rowId) {
  const myths = CELESTIAL_MYTHS[line.name] || [];
  const stones = CELESTIAL_STONES[line.name] || [];
  const mythTile = myths.length
    ? `<button class="snapshot-identity-tile snapshot-identity-tile--association" type="button" data-identity-explainer data-info-title="Myth" aria-haspopup="dialog" aria-describedby="${escapeHtml(`${rowId}-myth-tip`)}" aria-label="Myth for ${escapeHtml(entityNameForProse(line.name, true))}. Show names.">
        <b aria-hidden="true">📖</b>
        <strong>Myth</strong>
        <span class="snapshot-identity-tooltip" id="${escapeHtml(`${rowId}-myth-tip`)}" role="tooltip">${escapeHtml(myths.join(" · "))}</span>
      </button>`
    : "";
  const stoneTile = stones.length
    ? `<button class="snapshot-identity-tile snapshot-identity-tile--association" type="button" data-identity-explainer data-info-title="Stones" aria-haspopup="dialog" aria-describedby="${escapeHtml(`${rowId}-stones-tip`)}" aria-label="Stones for ${escapeHtml(entityNameForProse(line.name, true))}. Show common correspondences.">
        <b aria-hidden="true">◆</b>
        <strong>Stones</strong>
        <span class="snapshot-identity-tooltip" id="${escapeHtml(`${rowId}-stones-tip`)}" role="tooltip">${escapeHtml(stones.join(" · "))}</span>
      </button>`
    : "";
  return `${mythTile}${stoneTile}`;
}

function contextHelpHtml({ id, label, description }) {
  return `<button class="snapshot-context-help" type="button" data-identity-explainer data-info-title="${escapeHtml(label.replace(/^Explain\s+/i, ""))}" aria-haspopup="dialog" aria-describedby="${escapeHtml(id)}" aria-label="${escapeHtml(label)}">?<span class="snapshot-identity-tooltip" id="${escapeHtml(id)}" role="tooltip">${escapeHtml(description)}</span></button>`;
}

function treePreviewHtml(line) {
  const sephirah = SEPHIROTH.find((item) => item.number === line.decan.number);
  const world = WORLD_DATA[line.decan.suit];
  return `
    <div class="snapshot-tree-preview">
      <img class="snapshot-tree-preview__seal" src="${sephirahSealFile(sephirah.number)}" alt="${escapeHtml(`${sephirah.number} · ${sephirah.name}`)}" width="72" height="72" loading="lazy" decoding="async">
      <img class="snapshot-tree-preview__card" src="${cardPreviewFile(line.decan.cardIndex)}" alt="${escapeHtml(`${line.decan.cardName} tarot card`)}" width="72" height="120" loading="lazy" decoding="async">
      <div>
        <p><strong>${escapeHtml(sephirah.name)} · ${escapeHtml(sephirah.title)}</strong> The ${escapeHtml(line.decan.cardName)} places this row in ${escapeHtml(sephirah.name)}, expressed through ${escapeHtml(world.name)} (${escapeHtml(world.element)}).</p>
        <button class="snapshot-enter-tree" type="button" data-enter-tree="${escapeHtml(line.name)}">View Tree</button>
      </div>
    </div>`;
}

function rowHtml(line) {
  const rowId = line.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  const numerology = numerologyFor(line);
  const plainLine = `${entityNameForProse(line.name, true)} in ${line.sign.name}, ${decanLabel(line.decanIndex)}; ${line.sign.name} carries the ${line.naturalHouse.label} Natural House, while this chart places the line in the ${line.calculatedHouse.label} Calculated House. ${line.sign.name} is traditionally ruled by ${line.ruler.name}.`;
  const decanNumber = decanLabel(line.decanIndex).replace(" Decan", "");
  const housesConverge = line.naturalHouse.number === line.calculatedHouse.number;
  const houseRelationship = housesConverge
    ? `The natural and calculated layers converge in the ${line.naturalHouse.label} House. The sign’s native terrain and the chart’s present location are emphasizing the same field of life.`
    : `The Natural House shows the sign’s native terrain—how this current most instinctively knows how to be itself. The Calculated House shows where the selected time and place ask that current to operate now.`;
  const modernRulerNote = line.ruler.modern
    ? ` Modern astrology also associates ${line.sign.name} with ${line.ruler.modern.name}, adding a later lens of ${line.ruler.modern.influence}.`
    : "";
  return `
    <article class="snapshot-row" data-snapshot-row data-line-name="${escapeHtml(line.name)}">
      <div class="snapshot-card-column">
        <p class="snapshot-row-prompt">${escapeHtml(ROW_PROMPTS[line.name] || "What is this current asking me to notice?")}</p>
        <div class="snapshot-cards" aria-label="${escapeHtml(tarotLineFor(line))}">
          ${entityCardsHtml(line)}
          ${signCardsHtml(line)}
          ${cardFigureHtml({ category: decanLabel(line.decanIndex), name: line.decan.cardName, cardIndex: line.decan.cardIndex, description: `${line.decan.cardName} ${line.decan.meaning}. Ground it: ${line.decan.ground}` })}
        </div>
      </div>
      <div class="snapshot-reading">
        <p class="snapshot-search-match" data-search-match hidden></p>
        <div class="snapshot-reading__title">
          <div>
            <div class="snapshot-reading__position">
              <p>${escapeHtml(formatZodiacPosition(line.longitude))}</p>
              <button class="snapshot-motion ${line.motion.className}" type="button" data-motion-explainer data-info-title="${escapeHtml(`${line.motion.label} motion`)}" aria-haspopup="dialog" aria-describedby="${rowId}-motion-explanation">
                ${escapeHtml(line.motion.label)}
                <span class="snapshot-motion__tooltip" id="${rowId}-motion-explanation" role="tooltip">${escapeHtml(line.motion.explanation)}</span>
              </button>
            </div>
            <div class="snapshot-reading__identity" aria-label="${escapeHtml(plainLine)}">
              ${identityTileHtml({ id: `${rowId}-entity-tip`, glyph: line.glyph, name: line.name, kind: "Celestial Voice", description: `${line.entityEssence}.` })}
              ${celestialAssociationTilesHtml(line, rowId)}
              ${identityTileHtml({ id: `${rowId}-sign-tip`, glyph: line.sign.glyph, name: line.sign.name, kind: "Zodiacal Field", description: `${line.sign.name} shapes expression through ${line.sign.field}.` })}
              ${identityTileHtml({ id: `${rowId}-decan-tip`, glyph: decanNumber, name: "Decan", kind: "Decan Action", description: `${line.decan.cardName} ${line.decan.meaning}.`, modifier: "snapshot-identity-tile--decan" })}
              ${identityTileHtml({ id: `${rowId}-natural-house-tip`, glyph: line.naturalHouse.label, name: "Natural House", kind: "Natural House", description: `${line.sign.name} belongs to the ${line.naturalHouse.label} House on the Aries-first natural wheel. This is the sign’s native terrain of ${line.naturalHouse.short}.`, modifier: "snapshot-identity-tile--house snapshot-identity-tile--natural-house" })}
              ${identityTileHtml({ id: `${rowId}-calculated-house-tip`, glyph: line.calculatedHouse.label, name: "Calculated House", kind: "Calculated House", description: `For this selected time and place, ${entityNameForProse(line.name)} falls in the ${line.calculatedHouse.label} House through ${line.calculatedHouse.short}.`, modifier: "snapshot-identity-tile--house snapshot-identity-tile--calculated-house" })}
              ${identityTileHtml({ id: `${rowId}-ruler-tip`, glyph: line.ruler.glyph, name: line.ruler.name, kind: "Traditional Ruler", description: `${line.sign.name} is ruled by ${line.ruler.name}, bringing ${line.ruler.influence} to its field.`, modifier: "snapshot-identity-tile--ruler" })}
            </div>
            <p class="snapshot-identity-hint">Tap a tile to learn more.</p>
            <p class="snapshot-reading__plain-line">${escapeHtml(plainLine)}</p>
          </div>
        </div>
        <div class="snapshot-reading__context">
          <p><strong>Natural House &middot; ${escapeHtml(line.naturalHouse.label)} &middot; ${escapeHtml(line.naturalHouse.title)}:</strong> ${contextHelpHtml({ id: `${rowId}-natural-house-context-tip`, label: "Explain Natural and Calculated Houses", description: houseRelationship })} ${escapeHtml(line.naturalHouse.meaning)}</p>
          <p><strong>Calculated House &middot; ${escapeHtml(line.calculatedHouse.label)} &middot; ${escapeHtml(line.calculatedHouse.title)}:</strong> ${contextHelpHtml({ id: `${rowId}-calculated-house-context-tip`, label: "Explain Natural and Calculated Houses", description: houseRelationship })} ${escapeHtml(line.calculatedHouse.meaning)} <span class="snapshot-reading__context-system">${escapeHtml(line.calculatedHouse.system)} houses for the selected time and place.</span></p>
          <p><strong>${escapeHtml(line.ruler.glyph)} ${escapeHtml(line.ruler.name)} &middot; Traditional Ruler of ${escapeHtml(line.sign.name)}:</strong> ${escapeHtml(line.ruler.description)} In this Nuncast, that planetary current is translated into its Tarot card, ${escapeHtml(MAJORS[line.ruler.majorIndex])}, so the planet becomes a visible voice within the line.${modernRulerNote ? `<span class="snapshot-reading__modern-ruler">${escapeHtml(modernRulerNote)}</span>` : ""}</p>
        </div>
        <div class="snapshot-reading__tabs" role="tablist" aria-label="Perspectives for ${escapeHtml(line.name)}">
          <button type="button" role="tab" aria-selected="true" aria-controls="${rowId}-reading" id="${rowId}-reading-tab" data-row-view="reading" tabindex="0">Reading</button>
          <button type="button" role="tab" aria-selected="false" aria-controls="${rowId}-numerology" id="${rowId}-numerology-tab" data-row-view="numerology" tabindex="-1">Numerology</button>
          <button type="button" role="tab" aria-selected="false" aria-controls="${rowId}-tree" id="${rowId}-tree-tab" data-row-view="tree" tabindex="-1">Tree of Life</button>
        </div>
        <div class="snapshot-reading__panel" id="${rowId}-reading" role="tabpanel" aria-labelledby="${rowId}-reading-tab" data-row-panel="reading">
          <p><strong>Tarot Line:</strong> ${escapeHtml(tarotLineFor(line))}</p>
          <p><strong>Meaning:</strong> ${escapeHtml(readingFor(line))}</p>
          <p class="snapshot-reading__ground"><strong>Ground It</strong><span class="snapshot-reading__ground-question">What is this line asking you to notice, hold, question, or attempt?</span><span>${escapeHtml(line.entityGround)} ${escapeHtml(line.decan.ground)}</span></p>
        </div>
        <div class="snapshot-reading__panel snapshot-numerology-panel" id="${rowId}-numerology" role="tabpanel" aria-labelledby="${rowId}-numerology-tab" data-row-panel="numerology" hidden>
          <p><strong>Card Equation:</strong> ${escapeHtml(numerology.equation)}</p>
          ${numerology.cards.length ? `<div class="snapshot-numerology-sequence">
            <strong>Numerology Reduction</strong>
            <p class="snapshot-numerology-sequence__intro">Each number is read first through numerology. The Tarot key encountered at that step follows beneath it.</p>
            <ol>${numerology.cards.map((card) => `<li>
              <div class="snapshot-numerology-number"><strong><span>${escapeHtml(card.key)}</span>${escapeHtml(card.numberTitle)}</strong><p>${escapeHtml(card.numberMeaning)}</p></div>
              <div class="snapshot-numerology-tarot"><span class="snapshot-numerology-arrow" aria-hidden="true">↳</span><small>Tarot Key ${escapeHtml(card.key)}</small><strong><span class="snapshot-numerology-card" tabindex="0">${escapeHtml(card.name)}<img src="${cardPreviewFile(card.value)}" alt="${escapeHtml(card.name)} tarot card preview" width="72" height="120" loading="lazy" decoding="async"></span></strong><p>${escapeHtml(card.meaning)}</p></div>
            </li>`).join("")}</ol>
          </div>` : `<p><strong>${escapeHtml(numerology.heading)}:</strong> ${escapeHtml(numerology.meaning)}</p>`}
        </div>
        <div class="snapshot-reading__panel" id="${rowId}-tree" role="tabpanel" aria-labelledby="${rowId}-tree-tab" data-row-panel="tree" hidden>
          ${treePreviewHtml(line)}
        </div>
      </div>
    </article>`;
}

function reduceNumber(value) {
  const path = [value];
  let current = value;
  while (current > 9 && current !== 11 && current !== 22) {
    current = String(current).split("").reduce((sum, digit) => sum + Number(digit), 0);
    path.push(current);
  }
  return { root: current, path };
}

function numerologyFor(line) {
  const terms = [];
  if (line.entityCardIndex !== null) {
    terms.push({ name: line.entityCardName, value: line.entityCardIndex, isMajor: true });
  }
  terms.push({ name: MAJORS[line.sign.majorIndex], value: line.sign.majorIndex, isMajor: true });
  terms.push({ name: line.decan.cardName, value: line.decan.number, isMajor: false });

  const total = terms.reduce((sum, term) => sum + term.value, 0);
  const reduction = reduceNumber(total);
  const [title, meaning] = NUMBER_MEANINGS[reduction.root] || ["Compound Current", "The combined number is held without further interpretation."];
  const equationTerms = terms.map((term) => `${term.isMajor ? majorKeyLabel(term.value) : term.value} ${term.name}`).join(" + ");
  const reductionText = reduction.path.length > 1
    ? ` → ${reduction.path.slice(1).map((value) => majorKeyLabel(value)).join(" → ")}`
    : "";
  const cards = reduction.path
    .filter((value) => value >= 0 && value < MAJORS.length)
    .map((value) => {
      const [numberTitle, numberMeaning] = NUMBER_MEANINGS[value] || ["Compound Current", "This number is encountered as a distinct step before the line reduces again."];
      return { key: majorKeyLabel(value), value, numberTitle, numberMeaning, name: MAJORS[value], meaning: MAJOR_KEY_MEANINGS[value] };
    });

  return {
    equation: `${equationTerms} = ${majorKeyLabel(total)}${reductionText}`,
    heading: `${majorKeyLabel(reduction.root)} · ${title}`,
    meaning,
    cards,
  };
}

function printHeaderHtml(meta, pageNumber, totalPages) {
  return `
    <header class="snapshot-print-header">
      <img src="../assets/logo/lost-opal-logo-cabochons-transparent-v1.webp" alt="" width="54" height="54" decoding="async">
      <div><h2>Nuncastra · The Stars as They Are Now</h2><p>${escapeHtml(meta)}</p></div>
      <span>Page ${pageNumber} of ${totalPages}</span>
    </header>`;
}

function sectionHeadingHtml(group, pageIndex) {
  const definitionId = `snapshot-group-definition-${pageIndex}`;
  return `<header class="snapshot-section-heading"><h3><button class="snapshot-section-term" type="button" data-identity-explainer data-info-title="${escapeHtml(group.title)}" aria-haspopup="dialog" aria-describedby="${definitionId}"><span>${escapeHtml(group.title)}</span><span class="snapshot-section-help" aria-hidden="true">?</span><span class="snapshot-section-tooltip" id="${definitionId}" role="tooltip">${escapeHtml(group.definition)}</span></button></h3></header>`;
}

function normalizeSearchText(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function searchRolesFor(line, group, normalizedQuery) {
  const sephirah = SEPHIROTH.find((item) => item.number === line.decan.number);
  const fields = [
    ["Celestial entity", [line.name, line.glyph, line.entityEssence]],
    ["Myth", CELESTIAL_MYTHS[line.name] || []],
    ["Stones", CELESTIAL_STONES[line.name] || []],
    ["Celestial key", line.entityCards.flatMap((card) => [card.name, HERMETIC_CARD_TITLES[card.index] || ""])],
    ["Zodiac sign", [line.sign.name, line.sign.glyph, line.sign.field]],
    ["Sign key", [MAJORS[line.sign.majorIndex], HERMETIC_CARD_TITLES[line.sign.majorIndex] || ""]],
    ["Decan", [decanLabel(line.decanIndex), line.decan.cardName, line.decan.meaning, line.decan.suit]],
    ["Natural House", [line.naturalHouse.label, `${line.naturalHouse.label} House`, line.naturalHouse.title, line.naturalHouse.short, line.naturalHouse.meaning]],
    ["Calculated House", [line.calculatedHouse.label, `${line.calculatedHouse.label} House`, line.calculatedHouse.title, line.calculatedHouse.short, line.calculatedHouse.meaning]],
    ["Traditional ruler", [line.ruler.name, line.ruler.glyph, MAJORS[line.ruler.majorIndex], line.ruler.influence, line.ruler.description]],
    ["Tree of Life", [sephirah?.name, sephirah?.title, sephirah?.current, WORLD_DATA[line.decan.suit]?.name, WORLD_DATA[line.decan.suit]?.hebrew, WORLD_DATA[line.decan.suit]?.translation, WORLD_DATA[line.decan.suit]?.element]],
    ["Section", [group.title, group.tabLabel, group.description, group.definition]],
  ];
  const labels = fields
    .filter(([, values]) => normalizeSearchText(values.filter(Boolean).join(" ")).includes(normalizedQuery))
    .map(([label]) => label);
  if (!labels.length) {
    const readingText = normalizeSearchText([tarotLineFor(line), readingFor(line), line.entityGround, line.decan.ground, line.motion.label, line.motion.explanation].join(" "));
    if (readingText.includes(normalizedQuery)) labels.push("Reading text");
  }
  return labels;
}

function renderSnapshotTabs() {
  if (!snapshotSectionTabs) return;
  const groupTabs = RESULT_GROUPS.map((group, index) => `<button type="button" role="tab" id="snapshot-group-tab-${index}" aria-controls="snapshot-group-${index}" aria-selected="${state.activeGroup === index ? "true" : "false"}" data-snapshot-group="${index}">${escapeHtml(group.tabLabel)}</button>`).join("");
  snapshotSectionTabs.innerHTML = `${groupTabs}<button type="button" role="tab" aria-controls="snapshot-pages" aria-selected="${state.activeGroup === "all" ? "true" : "false"}" data-snapshot-group="all">Full Nuncast</button>`;
}

function updateSnapshotNavigation() {
  if (!pages || !snapshotNavigator) return;
  const normalizedQuery = normalizeSearchText(state.searchQuery);
  const searching = Boolean(normalizedQuery);
  let matchCount = 0;
  const lineMap = new Map(state.lines.map((line) => [line.name, line]));

  for (const section of pages.querySelectorAll("[data-snapshot-group-panel]")) {
    const groupIndex = Number(section.dataset.snapshotGroupPanel);
    const group = RESULT_GROUPS[groupIndex];
    let sectionMatches = 0;
    for (const row of section.querySelectorAll("[data-snapshot-row]")) {
      const line = lineMap.get(row.dataset.lineName);
      const labels = searching && line ? searchRolesFor(line, group, normalizedQuery) : [];
      const matches = !searching || labels.length > 0;
      row.hidden = !matches;
      const matchLabel = row.querySelector("[data-search-match]");
      if (matchLabel) {
        matchLabel.hidden = !searching || !matches;
        matchLabel.textContent = searching && matches ? `Matched: ${labels.join(" · ")}` : "";
      }
      if (searching && matches) {
        sectionMatches += 1;
        matchCount += 1;
      }
    }
    section.hidden = searching ? sectionMatches === 0 : state.activeGroup !== "all" && state.activeGroup !== groupIndex;
  }

  pages.classList.toggle("is-searching", searching);
  results?.classList.toggle("is-searching", searching);
  snapshotSectionTabs?.classList.toggle("is-searching", searching);
  snapshotSearchClear.disabled = !searching;
  if (snapshotSearchStatus) {
    snapshotSearchStatus.textContent = searching
      ? matchCount ? `${matchCount} complete ${matchCount === 1 ? "row" : "rows"} matching “${state.searchQuery.trim()}”.` : `No complete rows match “${state.searchQuery.trim()}”.`
      : state.activeGroup === "all" ? "Showing the complete Nuncast." : `Showing ${RESULT_GROUPS[state.activeGroup].title}.`;
  }
  snapshotSectionTabs?.querySelectorAll("[data-snapshot-group]").forEach((button) => {
    const value = button.dataset.snapshotGroup === "all" ? "all" : Number(button.dataset.snapshotGroup);
    button.setAttribute("aria-selected", String(!searching && state.activeGroup === value));
  });
  snapshotNavigator.querySelectorAll("[data-snapshot-quick]").forEach((button) => {
    button.setAttribute("aria-pressed", String(normalizedQuery === normalizeSearchText(button.dataset.snapshotQuick)));
  });
}

function selectSnapshotGroup(value, moveFocus = false) {
  state.activeGroup = value === "all" ? "all" : Number(value);
  state.searchQuery = "";
  if (snapshotSearch) snapshotSearch.value = "";
  updateSnapshotNavigation();
  if (moveFocus) snapshotSectionTabs?.querySelector(`[data-snapshot-group="${value}"]`)?.focus();
}

function searchSnapshot(value) {
  state.searchQuery = value;
  updateSnapshotNavigation();
}

function renderSnapshot(lines, meta) {
  const lineMap = new Map(lines.map((line) => [line.name, line]));
  const pageCount = RESULT_GROUPS.length;
  const output = RESULT_GROUPS.map((group, pageIndex) => {
    const groupLines = group.names.map((name) => lineMap.get(name)).filter(Boolean);
    const sectionHeading = sectionHeadingHtml(group, pageIndex);
    const sizeClass = groupLines.length >= 4 ? " snapshot-print-page--four" : "";
    return `<section class="snapshot-print-page${sizeClass}" id="snapshot-group-${pageIndex}" role="tabpanel" aria-labelledby="snapshot-group-tab-${pageIndex}" data-snapshot-group-panel="${pageIndex}">${printHeaderHtml(meta, pageIndex + 1, pageCount)}${sectionHeading}${groupLines.map(rowHtml).join("")}</section>`;
  });
  pages.innerHTML = output.join("");
  state.lines = lines;
  state.activeGroup = 0;
  state.searchQuery = "";
  if (snapshotSearch) snapshotSearch.value = "";
  snapshotNavigator.hidden = false;
  renderSnapshotTabs();
  updateSnapshotNavigation();
  resultsMeta.textContent = meta;
  results.hidden = false;
}

function setStatus(message, stateName = "") {
  status.textContent = message;
  status.dataset.state = stateName;
}

function setBusy(isBusy) {
  state.busy = isBusy;
  calculateButton.disabled = isBusy;
  locationButton.disabled = isBusy;
  calculateButton.textContent = isBusy ? "Casting…" : "Cast This Moment";
}

const MONTH_OPTIONS = [
  ["1", "Jan"], ["2", "Feb"], ["3", "Mar"], ["4", "Apr"], ["5", "May"], ["6", "Jun"],
  ["7", "Jul"], ["8", "Aug"], ["9", "Sep"], ["10", "Oct"], ["11", "Nov"], ["12", "Dec"],
];

function appendSelectOptions(select, options) {
  if (!select || select.options.length > 1) return;
  options.forEach(([value, label]) => select.add(new Option(label, value)));
}

function yearOptionsFor(control) {
  const minYear = Number(control.dataset.minYear || 1800);
  const maxYear = Number(control.dataset.maxYear || 2399);
  const currentYear = new Date().getFullYear();
  const years = [];

  if (control.dataset.yearOrder === "recent-first") {
    const anchorYear = Math.min(maxYear, Math.max(minYear, currentYear));
    for (let year = anchorYear; year >= minYear; year -= 1) years.push(year);
    for (let year = anchorYear + 1; year <= maxYear; year += 1) years.push(year);
  } else {
    for (let year = minYear; year <= maxYear; year += 1) years.push(year);
  }

  return years.map((year) => [String(year), String(year)]);
}

function dateParts(control) {
  return {
    month: control?.querySelector("[data-date-month]") || null,
    day: control?.querySelector("[data-date-day]") || null,
    year: control?.querySelector("[data-date-year]") || null,
    hidden: control?.querySelector('input[type="hidden"]') || null,
  };
}

function timeParts(control) {
  return {
    hour: control?.querySelector("[data-time-hour]") || null,
    minute: control?.querySelector("[data-time-minute]") || null,
    period: control?.querySelector("[data-time-period]") || null,
    hidden: control?.querySelector('input[type="hidden"]') || null,
  };
}

function updateAvailableDays(control) {
  const { month, day, year } = dateParts(control);
  if (!month || !day || !year) return;
  const numericMonth = Number(month.value);
  const numericYear = Number(year.value);
  const available = numericMonth
    ? new Date(Date.UTC(Number.isInteger(numericYear) && numericYear > 0 ? numericYear : 2000, numericMonth, 0)).getUTCDate()
    : 31;
  [...day.options].forEach((option) => {
    if (!option.value) return;
    option.disabled = Number(option.value) > available;
  });
  if (Number(day.value) > available) day.value = "";
}

function syncDateControl(control, report = false) {
  const { month, day, year, hidden } = dateParts(control);
  if (!month || !day || !year || !hidden) return "";
  day.setCustomValidity("");
  year.setCustomValidity("");

  if (!month.value || !day.value || !year.value) {
    hidden.value = "";
    return "";
  }

  const numericYear = Number(year.value);
  const numericMonth = Number(month.value);
  const numericDay = Number(day.value);
  const minYear = Number(control.dataset.minYear || 1800);
  const maxYear = Number(control.dataset.maxYear || 2399);
  if (!Number.isInteger(numericYear) || numericYear < minYear || numericYear > maxYear) {
    year.setCustomValidity(`Choose a year from ${minYear} through ${maxYear}.`);
    if (report) year.reportValidity();
    hidden.value = "";
    return "";
  }

  const candidate = new Date(Date.UTC(numericYear, numericMonth - 1, numericDay));
  if (candidate.getUTCFullYear() !== numericYear || candidate.getUTCMonth() !== numericMonth - 1 || candidate.getUTCDate() !== numericDay) {
    day.setCustomValidity("Choose a day that exists in that month and year.");
    if (report) day.reportValidity();
    hidden.value = "";
    return "";
  }

  hidden.value = `${String(numericYear).padStart(4, "0")}-${String(numericMonth).padStart(2, "0")}-${String(numericDay).padStart(2, "0")}`;
  return hidden.value;
}

function setDateControlValue(control, isoDate) {
  const { month, day, year } = dateParts(control);
  if (!month || !day || !year) return;
  const match = String(isoDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  year.value = match ? String(Number(match[1])) : "";
  month.value = match ? String(Number(match[2])) : "";
  updateAvailableDays(control);
  day.value = match ? String(Number(match[3])) : "";
  syncDateControl(control);
}

function syncTimeControl(control) {
  const { hour, minute, period, hidden } = timeParts(control);
  if (!hour || !minute || !period || !hidden || !hour.value || !minute.value || !period.value) {
    if (hidden) hidden.value = "";
    return "";
  }
  let numericHour = Number(hour.value) % 12;
  if (period.value === "PM") numericHour += 12;
  hidden.value = `${String(numericHour).padStart(2, "0")}:${String(Number(minute.value)).padStart(2, "0")}`;
  return hidden.value;
}

function setTimeControlValue(control, isoTime) {
  const { hour, minute, period } = timeParts(control);
  if (!hour || !minute || !period) return;
  const match = String(isoTime || "").match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    hour.value = "";
    minute.value = "";
    period.value = "";
    syncTimeControl(control);
    return;
  }
  const numericHour = Number(match[1]);
  hour.value = String(numericHour % 12 || 12);
  minute.value = String(Number(match[2]));
  period.value = numericHour >= 12 ? "PM" : "AM";
  syncTimeControl(control);
}

function initializeTemporalControls() {
  document.querySelectorAll("[data-date-control]").forEach((control) => {
    const { month, day, year } = dateParts(control);
    appendSelectOptions(month, MONTH_OPTIONS);
    appendSelectOptions(day, Array.from({ length: 31 }, (_, index) => [String(index + 1), String(index + 1)]));
    appendSelectOptions(year, yearOptionsFor(control));
    control.addEventListener("change", () => {
      updateAvailableDays(control);
      syncDateControl(control);
    });
    control.addEventListener("input", () => {
      updateAvailableDays(control);
      syncDateControl(control);
    });
  });

  document.querySelectorAll("[data-time-control]").forEach((control) => {
    const { hour, minute } = timeParts(control);
    appendSelectOptions(hour, Array.from({ length: 12 }, (_, index) => [String(index + 1), String(index + 1)]));
    appendSelectOptions(minute, Array.from({ length: 60 }, (_, index) => [String(index), String(index).padStart(2, "0")]));
    control.addEventListener("change", () => syncTimeControl(control));
  });
}

function localInputDefaults() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  setDateControlValue(momentDateControl, `${year}-${month}-${day}`);
  setTimeControlValue(momentTimeControl, `${hour}:${minute}`);
}

function parseCoordinates(query) {
  const match = query.trim().match(/^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error("Those coordinates fall outside valid latitude and longitude ranges.");
  }
  return { latitude, longitude, label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` };
}

const BIRTH_PLACE_PROMPT = "Choose a matching place, enter exact latitude and longitude, or reuse a recently confirmed place.";
const MOMENT_PLACE_PROMPT = "Choose a matching place or enter exact latitude and longitude. Recently confirmed places also work offline.";
const DEFAULT_PLACE = { latitude: 33.3062, longitude: -111.8413, label: "Chandler, Arizona 85225", kind: "City" };
let birthPlaceSearchTimer = null;
let birthPlaceSearchController = null;
let birthPlaceOptions = [];
let birthSelectedPlace = null;
let momentPlaceSearchTimer = null;
let momentPlaceSearchController = null;
let momentPlaceOptions = [];

function setBirthPlaceMessage(message, stateName = "") {
  if (!birthLocationMessage) return;
  birthLocationMessage.textContent = message;
  birthLocationMessage.dataset.state = stateName;
}

function closeBirthPlaceResults() {
  if (!birthLocationResults || !birthLocationInput) return;
  birthLocationResults.hidden = true;
  birthLocationResults.innerHTML = "";
  birthLocationInput.setAttribute("aria-expanded", "false");
  birthPlaceOptions = [];
}

function clearBirthPlaceSelection() {
  birthSelectedPlace = null;
  birthLocationField?.classList.remove("is-confirmed");
  if (birthForm) {
    birthForm.elements.birth_latitude.value = "";
    birthForm.elements.birth_longitude.value = "";
  }
  birthLocationInput?.setCustomValidity("");
}

function resetBirthPlacePicker() {
  window.clearTimeout(birthPlaceSearchTimer);
  birthPlaceSearchController?.abort();
  birthPlaceSearchController = null;
  clearBirthPlaceSelection();
  closeBirthPlaceResults();
  setBirthPlaceMessage(BIRTH_PLACE_PROMPT);
}

function photonPlace(feature) {
  const properties = feature?.properties || {};
  const coordinates = feature?.geometry?.coordinates || [];
  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const parts = [properties.name, properties.city, properties.state, properties.country]
    .map((part) => String(part || "").trim())
    .filter((part, index, values) => part && values.findIndex((value) => value.toLowerCase() === part.toLowerCase()) === index);
  if (!parts.length) return null;
  const rawKind = properties.osm_value || properties.type || "place";
  const kind = String(rawKind).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return { latitude, longitude, label: parts.join(", "), kind };
}

function recentPlaces() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_PLACES_STORAGE_KEY) || "[]");
    return Array.isArray(stored)
      ? stored.filter((place) => Number.isFinite(Number(place?.latitude)) && Number.isFinite(Number(place?.longitude)) && place?.label).slice(0, 8)
      : [];
  } catch {
    return [];
  }
}

function rememberPlace(place) {
  if (!place?.label || !Number.isFinite(Number(place.latitude)) || !Number.isFinite(Number(place.longitude))) return;
  try {
    const key = `${Number(place.latitude).toFixed(5)}|${Number(place.longitude).toFixed(5)}`;
    const saved = recentPlaces().filter((candidate) => `${Number(candidate.latitude).toFixed(5)}|${Number(candidate.longitude).toFixed(5)}` !== key);
    saved.unshift({
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
      label: String(place.label),
      kind: String(place.kind || "Recently confirmed place"),
    });
    localStorage.setItem(RECENT_PLACES_STORAGE_KEY, JSON.stringify(saved.slice(0, 8)));
  } catch {
    // Place reuse is optional; the reading still works when local storage is unavailable.
  }
}

function matchingRecentPlaces(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return recentPlaces().filter((place) => place.label.toLowerCase().includes(needle));
}

async function searchPlaces(query, signal) {
  const direct = parseCoordinates(query);
  if (direct) return [{ ...direct, kind: "Exact coordinates" }];

  const recentMatches = matchingRecentPlaces(query);
  if (typeof navigator !== "undefined" && navigator.onLine === false) return recentMatches;

  let payload;
  try {
    const endpoint = new URL("https://photon.komoot.io/api/");
    endpoint.searchParams.set("q", query);
    endpoint.searchParams.set("limit", "7");
    endpoint.searchParams.set("lang", "en");
    endpoint.searchParams.set("osm_tag", "place");
    const response = await fetch(endpoint, { signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("The place-search service is unavailable right now.");
    payload = await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw error;
    if (recentMatches.length) return recentMatches;
    throw error;
  }

  const seen = new Set();
  return [...recentMatches, ...(payload.features || []).map(photonPlace).filter(Boolean)]
    .filter((place) => {
      const key = `${place.label.toLowerCase()}|${place.latitude.toFixed(4)}|${place.longitude.toFixed(4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function renderBirthPlaceResults(places) {
  if (!birthLocationResults || !birthLocationInput) return;
  birthPlaceOptions = places;
  birthLocationResults.innerHTML = places.map((place, index) => `
    <li role="presentation">
      <button class="birth-dialog__place-option" type="button" role="option" data-birth-location-option="${index}">
        <span><strong>${escapeHtml(place.label)}</strong><small>${escapeHtml(place.kind)} · ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}</small></span>
        <span aria-hidden="true">Choose</span>
      </button>
    </li>`).join("");
  birthLocationResults.hidden = false;
  birthLocationInput.setAttribute("aria-expanded", "true");
}

function chooseBirthPlace(place) {
  if (!place || !birthLocationInput || !birthForm) return;
  birthSelectedPlace = { ...place };
  rememberPlace(place);
  birthLocationInput.value = place.label;
  birthLocationInput.setCustomValidity("");
  birthForm.elements.birth_latitude.value = String(place.latitude);
  birthForm.elements.birth_longitude.value = String(place.longitude);
  birthLocationField?.classList.add("is-confirmed");
  closeBirthPlaceResults();
  setBirthPlaceMessage(`✓ Locked to ${place.label} · ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}. Type again to change it.`, "confirmed");
  birthLocationInput.focus();
}

async function performBirthPlaceSearch(query) {
  birthPlaceSearchController?.abort();
  birthPlaceSearchController = new AbortController();
  setBirthPlaceMessage("Searching for matching places…", "searching");
  try {
    const places = await searchPlaces(query, birthPlaceSearchController.signal);
    if (birthLocationInput?.value.trim() !== query) return;
    if (!places.length) {
      closeBirthPlaceResults();
      setBirthPlaceMessage(navigator.onLine === false
        ? "You are offline. Enter exact latitude, longitude or begin typing a recently confirmed place."
        : "No matching place yet. Add a state, country, region, or ZIP code and try again.", "error");
      return;
    }
    renderBirthPlaceResults(places);
    setBirthPlaceMessage("Choose the correct place below to lock its coordinates.");
  } catch (error) {
    if (error.name === "AbortError") return;
    closeBirthPlaceResults();
    setBirthPlaceMessage("Place suggestions could not be reached. Enter exact latitude, longitude, use a recently confirmed place, or try again when connected.", "error");
  }
}

function scheduleBirthPlaceSearch() {
  if (!birthLocationInput) return;
  window.clearTimeout(birthPlaceSearchTimer);
  birthPlaceSearchController?.abort();
  clearBirthPlaceSelection();
  closeBirthPlaceResults();
  const query = birthLocationInput.value.trim();
  if (query.length < 2) {
    setBirthPlaceMessage(query ? "Keep typing to search for a real place." : BIRTH_PLACE_PROMPT);
    return;
  }
  setBirthPlaceMessage("Waiting for a little more of the place name…", "searching");
  birthPlaceSearchTimer = window.setTimeout(() => performBirthPlaceSearch(query), 350);
}

function setMomentPlaceMessage(message, stateName = "") {
  if (!momentLocationMessage) return;
  momentLocationMessage.textContent = message;
  momentLocationMessage.dataset.state = stateName;
}

function closeMomentPlaceResults() {
  if (!momentLocationResults || !momentLocationInput) return;
  momentLocationResults.hidden = true;
  momentLocationResults.innerHTML = "";
  momentLocationInput.setAttribute("aria-expanded", "false");
  momentPlaceOptions = [];
}

function clearMomentPlaceSelection() {
  state.confirmedPlace = null;
  momentLocationField?.classList.remove("is-confirmed");
  momentLocationInput?.setCustomValidity("");
}

function applyMomentPlaceSelection(place, focus = false) {
  if (!place || !momentLocationInput) return;
  window.clearTimeout(momentPlaceSearchTimer);
  momentPlaceSearchController?.abort();
  momentPlaceSearchController = null;
  state.confirmedPlace = {
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    label: place.label,
    kind: place.kind || "Place",
  };
  rememberPlace(state.confirmedPlace);
  momentLocationInput.value = state.confirmedPlace.label;
  momentLocationInput.setCustomValidity("");
  momentLocationField?.classList.add("is-confirmed");
  closeMomentPlaceResults();
  setMomentPlaceMessage(`✓ Confirmed: ${state.confirmedPlace.label} · ${state.confirmedPlace.latitude.toFixed(4)}, ${state.confirmedPlace.longitude.toFixed(4)}.`, "confirmed");
  if (focus) momentLocationInput.focus();
}

function resetMomentPlacePicker(place = DEFAULT_PLACE) {
  window.clearTimeout(momentPlaceSearchTimer);
  momentPlaceSearchController?.abort();
  momentPlaceSearchController = null;
  clearMomentPlaceSelection();
  closeMomentPlaceResults();
  if (place) applyMomentPlaceSelection(place);
  else setMomentPlaceMessage(MOMENT_PLACE_PROMPT);
}

function renderMomentPlaceResults(places) {
  if (!momentLocationResults || !momentLocationInput) return;
  momentPlaceOptions = places;
  momentLocationResults.innerHTML = places.map((place, index) => `
    <li role="presentation">
      <button class="birth-dialog__place-option" type="button" role="option" data-moment-location-option="${index}">
        <span><strong>${escapeHtml(place.label)}</strong><small>${escapeHtml(place.kind)} · ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}</small></span>
        <span aria-hidden="true">Choose</span>
      </button>
    </li>`).join("");
  momentLocationResults.hidden = false;
  momentLocationInput.setAttribute("aria-expanded", "true");
}

async function performMomentPlaceSearch(query) {
  momentPlaceSearchController?.abort();
  momentPlaceSearchController = new AbortController();
  setMomentPlaceMessage("Searching for matching places…", "searching");
  try {
    const places = await searchPlaces(query, momentPlaceSearchController.signal);
    if (momentLocationInput?.value.trim() !== query) return;
    if (!places.length) {
      closeMomentPlaceResults();
      setMomentPlaceMessage(navigator.onLine === false
        ? "You are offline. Enter exact latitude, longitude, use My Location, or begin typing a recently confirmed place."
        : "No matching place yet. Add a state, country, region, or ZIP code and try again.", "error");
      return;
    }
    renderMomentPlaceResults(places);
    setMomentPlaceMessage("Choose the correct place below before casting this moment.");
  } catch (error) {
    if (error.name === "AbortError") return;
    closeMomentPlaceResults();
    setMomentPlaceMessage("Place suggestions could not be reached. Enter exact latitude, longitude, use My Location, or try again when connected.", "error");
  }
}

function scheduleMomentPlaceSearch() {
  if (!momentLocationInput) return;
  window.clearTimeout(momentPlaceSearchTimer);
  momentPlaceSearchController?.abort();
  clearMomentPlaceSelection();
  closeMomentPlaceResults();
  const query = momentLocationInput.value.trim();
  if (query.length < 2) {
    setMomentPlaceMessage(query ? "Keep typing to search for a real place." : MOMENT_PLACE_PROMPT);
    return;
  }
  setMomentPlaceMessage("Waiting for a little more of the place name…", "searching");
  momentPlaceSearchTimer = window.setTimeout(() => performMomentPlaceSearch(query), 350);
}

function zonedFormatter(timeZone) {
  if (!formatterCache.has(timeZone)) {
    formatterCache.set(timeZone, new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }));
  }
  return formatterCache.get(timeZone);
}

function partsInZone(date, timeZone) {
  const parts = {};
  for (const part of zonedFormatter(timeZone).formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  return parts;
}

function zonedDateToUtc(dateValue, timeValue, timeZone) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const desired = { year, month, day, hour, minute, second: 0 };
  const desiredEpoch = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = desiredEpoch;

  for (let pass = 0; pass < 4; pass += 1) {
    const observed = partsInZone(new Date(guess), timeZone);
    const observedEpoch = Date.UTC(observed.year, observed.month - 1, observed.day, observed.hour, observed.minute, observed.second);
    const correction = desiredEpoch - observedEpoch;
    guess += correction;
    if (correction === 0) break;
  }

  const verified = partsInZone(new Date(guess), timeZone);
  const matches = ["year", "month", "day", "hour", "minute"].every((key) => verified[key] === desired[key]);
  if (!matches) {
    throw new Error("That local clock time does not exist in this location because of a daylight-saving transition. Choose another time.");
  }
  return new Date(guess);
}

function formatMoment(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

async function initializeEngine() {
  const engine = new SwissEphemeris();
  await engine.init();
  await engine.loadEphemerisFiles(EPHEMERIS_FILES.map((name) => ({
    name,
    url: new URL(`./ephemeris/${name}`, import.meta.url).href,
  })));
  state.engine = engine;
  state.engineReady = true;
  setStatus("Astronomy engine ready. Your calculations stay in this browser.");
  return engine;
}

const enginePromise = hasDocument
  ? initializeEngine().catch((error) => {
      console.error(error);
      setStatus("The astronomy engine could not load. Refresh the page and try again.", "error");
      throw error;
    })
  : Promise.resolve(null);

function greenwichSiderealDegrees(julianDay) {
  const centuries = (julianDay - 2451545.0) / 36525;
  return normalizeLongitude(
    280.46061837
    + 360.98564736629 * (julianDay - 2451545.0)
    + 0.000387933 * centuries * centuries
    - (centuries * centuries * centuries) / 38710000
  );
}

function sunIsAboveHorizon(engine, julianDay, latitude, longitude) {
  const equatorial = engine.calculatePosition(
    julianDay,
    Planet.Sun,
    CalculationFlag.SwissEphemeris | CalculationFlag.Equatorial
  );
  const rightAscension = equatorial.longitude * Math.PI / 180;
  const declination = equatorial.latitude * Math.PI / 180;
  const localSidereal = normalizeLongitude(greenwichSiderealDegrees(julianDay) + longitude) * Math.PI / 180;
  const hourAngle = localSidereal - rightAscension;
  const latitudeRadians = latitude * Math.PI / 180;
  const sineAltitude = Math.sin(latitudeRadians) * Math.sin(declination)
    + Math.cos(latitudeRadians) * Math.cos(declination) * Math.cos(hourAngle);
  return sineAltitude > 0;
}

function calculateLines(engine, utcDate, latitude, longitude, zodiacSystem = "tropical") {
  const julianDay = engine.dateToJulianDay(utcDate);
  const system = ZODIAC_SYSTEMS[zodiacSystem] || ZODIAC_SYSTEMS.tropical;
  const isSidereal = system.siderealMode !== null;
  if (isSidereal) engine.setSiderealMode(system.siderealMode);
  const flags = CalculationFlag.SwissEphemeris | CalculationFlag.Speed | (isSidereal ? CalculationFlag.Sidereal : 0);
  const lines = [];

  for (const definition of BODY_DATA) {
    try {
      const position = engine.calculatePosition(julianDay, definition.body, flags);
      lines.push(buildLine(definition, position.longitude, position.longitudeSpeed, {
        nodeGlyph: definition.name === "North Node" ? "☊" : null,
      }));
    } catch (error) {
      console.warn(`Nuncastra could not calculate ${definition.name}.`, error);
    }
  }

  const northNode = lines.find((line) => line.name === "North Node");
  if (!northNode) throw new Error("The lunar node could not be calculated for this moment.");
  lines.push(buildLine({
    name: "South Node",
    glyph: "☋",
    majorIndices: [18],
    essence: "The evolutionary release point reveals an inherited competence, old emotional gravity, and the pattern most likely to run automatically",
    ground: "Keep the wisdom of the past without letting familiarity choose the future for you.",
  }, northNode.longitude + 180, northNode.speed, { nodeGlyph: "☋", reversed: true }));

  let houses;
  let calculatedHouseSystem = "Placidus";
  try {
    houses = engine.calculateHouses(julianDay, latitude, longitude, HouseSystem.Placidus);
    if (!houseCuspsAreUsable(houses.cusps)) throw new Error("Invalid Placidus cusps");
  } catch {
    houses = engine.calculateHouses(julianDay, latitude, longitude, HouseSystem.Equal);
    calculatedHouseSystem = "Equal";
  }

  const ayanamsa = isSidereal ? engine.getAyanamsa(julianDay) : 0;
  const adjustedAngle = (value) => normalizeLongitude(value - ayanamsa);
  const adjustedCusps = houses.cusps.map((value, index) => index === 0 ? value : adjustedAngle(value));
  const ascendant = adjustedAngle(houses.ascendant);
  const mc = adjustedAngle(houses.mc);
  const vertex = adjustedAngle(houses.vertex);

  const sun = lines.find((line) => line.name === "Sun");
  const moon = lines.find((line) => line.name === "Moon");
  if (!sun || !moon) throw new Error("The Sun or Moon could not be calculated for the Lot of Fortune.");
  const isDayChart = sunIsAboveHorizon(engine, julianDay, latitude, longitude);
  const fortuneLongitude = isDayChart
    ? ascendant + moon.longitude - sun.longitude
    : ascendant + sun.longitude - moon.longitude;

  lines.push(buildLine({ ...ANGLE_DATA.fortune, majorIndices: [] }, fortuneLongitude, 0));
  lines.push(buildLine({ ...ANGLE_DATA.ascendant, majorIndices: [] }, ascendant, 0));
  lines.push(buildLine({ ...ANGLE_DATA.mc, majorIndices: [] }, mc, 0));
  lines.push(buildLine({ ...ANGLE_DATA.vertex, majorIndices: [] }, vertex, 0));
  return lines.map((line) => {
    const naturalHouse = naturalHouseForSign(line.signIndex);
    const calculatedHouse = houseFor(line.longitude, adjustedCusps, calculatedHouseSystem);
    return {
      ...line,
      naturalHouse,
      calculatedHouse,
      house: calculatedHouse,
    };
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  if (state.busy) return;
  const selectedDate = syncDateControl(momentDateControl, true);
  const selectedTime = syncTimeControl(momentTimeControl);
  if (!selectedDate || !selectedTime) {
    setStatus("Choose a complete date and local time before casting the Nuncast.", "error");
    return;
  }
  if (!state.confirmedPlace) {
    momentLocationInput?.setCustomValidity("Choose one of the matching places so its coordinates can be confirmed.");
    momentLocationInput?.reportValidity();
    setMomentPlaceMessage("Choose one of the matching places before casting this moment.", "error");
    setStatus("Confirm a city, ZIP code, or exact coordinates before casting the Nuncast.", "error");
    momentLocationInput?.focus();
    return;
  }
  const generation = state.generation;
  setBusy(true);
  results.hidden = true;
  setStatus("Translating the confirmed place and sky…");

  try {
    const engine = await enginePromise;
    const place = state.confirmedPlace;
    const timeZone = lookupTimezone(place.latitude, place.longitude);
    const utcDate = zonedDateToUtc(form.elements.date.value, form.elements.time.value, timeZone);
    const zodiacSystem = form.elements.zodiac.value;
    const system = ZODIAC_SYSTEMS[zodiacSystem] || ZODIAC_SYSTEMS.tropical;
    const lines = calculateLines(engine, utcDate, place.latitude, place.longitude, zodiacSystem);
    if (generation !== state.generation) return;
    const placeSummary = `${place.label} · ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`;
    const personalSummary = state.personalContext
      ? ` · Birth-moment Nuncast · ${state.personalContext.timeMeta} · ${state.personalContext.placeMeta}`
      : "";
    const meta = `${formatMoment(utcDate, timeZone)} · ${placeSummary} · ${system.label} · True Lunar Node${personalSummary}`;
    renderSnapshot(lines, meta);
    setStatus(`${state.personalContext ? "Birth-moment Nuncast" : "Nuncast"} complete: ${lines.length} Tarot lines calculated locally for ${place.label}.`);
    results.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  } catch (error) {
    if (generation !== state.generation) return;
    console.error(error);
    setStatus(error.message || "The snapshot could not be calculated. Check the entries and try again.", "error");
  } finally {
    if (generation === state.generation) setBusy(false);
  }
}

function useDeviceLocation() {
  if (!("geolocation" in navigator)) {
    setStatus("This browser does not provide location access. Enter a city, ZIP code, or latitude, longitude.", "error");
    return;
  }

  const generation = state.generation;
  setStatus("Waiting for location permission…");
  locationButton.disabled = true;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      if (generation !== state.generation) return;
      state.deviceLocation = { latitude: coords.latitude, longitude: coords.longitude };
      applyMomentPlaceSelection({
        latitude: coords.latitude,
        longitude: coords.longitude,
        label: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
        kind: "Device coordinates",
      });
      setStatus("Location captured on this device. It has not been sent to Lost Opal or stored.");
      locationButton.disabled = false;
    },
    () => {
      if (generation !== state.generation) return;
      setStatus("Location was not shared. Enter a city, ZIP code, or latitude, longitude instead.", "error");
      locationButton.disabled = false;
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}

function activateRowTab(row, tab, moveFocus = false) {
  const view = tab.dataset.rowView;
  for (const button of row.querySelectorAll("[data-row-view]")) {
    const selected = button === tab;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  }
  for (const panel of row.querySelectorAll("[data-row-panel]")) {
    panel.hidden = panel.dataset.rowPanel !== view;
  }
  if (moveFocus) tab.focus();
}

function treeNodeByName(name) {
  return name === "Daath" ? DAATH : SEPHIROTH.find((node) => node.name === name);
}

function pathForMajor(majorIndex) {
  return PATH_DATA.find((path) => path.majorIndex === majorIndex);
}

function createTreeNodes() {
  if (!treeNodes || treeNodes.childElementCount) return;
  const nodes = [...SEPHIROTH, DAATH];
  treeNodes.innerHTML = nodes.map((node) => `
    <button type="button" class="tree-node${node.name === "Daath" ? " tree-node--daath" : ""}" data-tree-node="${escapeHtml(node.name)}" style="--x:${node.x}%;--y:${node.y}%" title="${escapeHtml(node.current)}">
      ${node.number ? `<img src="${sephirahSealFile(node.number)}" alt="" width="72" height="72" loading="lazy" decoding="async"><span class="tree-node__accessible"><strong>${escapeHtml(node.name)}</strong><small>${node.number} · ${escapeHtml(node.title)}</small></span>` : `<span><strong>${escapeHtml(node.name)}</strong><small>${escapeHtml(node.title)}</small></span>`}
    </button>`).join("");
}

function treeCoordinates(name, width, height) {
  const node = treeNodeByName(name);
  return { x: width * node.x / 100, y: height * node.y / 100 };
}

function drawTree(line = state.activeTreeLine) {
  if (!treeCanvas || !treeNodes) return;
  createTreeNodes();
  const stage = treeCanvas.parentElement;
  const width = Math.max(1, stage.clientWidth);
  const height = Math.max(1, stage.clientHeight);
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  treeCanvas.width = Math.round(width * scale);
  treeCanvas.height = Math.round(height * scale);
  const context = treeCanvas.getContext("2d");
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.clearRect(0, 0, width, height);

  const entityMajors = new Set(line?.entityCards.map((card) => card.index) || []);
  const signMajor = line?.sign.majorIndex;

  for (const path of PATH_DATA) {
    const from = treeCoordinates(path.from, width, height);
    const to = treeCoordinates(path.to, width, height);
    const isEntity = entityMajors.has(path.majorIndex);
    const isSign = signMajor === path.majorIndex;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.lineWidth = isEntity || isSign ? 4 : 1.15;
    context.strokeStyle = isEntity && isSign ? "rgba(255,226,146,.96)"
      : isEntity ? "rgba(72,199,212,.92)"
      : isSign ? "rgba(209,78,115,.9)"
      : "rgba(237,195,111,.19)";
    context.shadowBlur = isEntity || isSign ? 16 : 0;
    context.shadowColor = context.strokeStyle;
    context.stroke();
    context.shadowBlur = 0;

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    context.fillStyle = isEntity || isSign ? "rgba(255,244,216,.95)" : "rgba(237,195,111,.35)";
    context.font = `${isEntity || isSign ? 12 : 9}px Georgia`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(isEntity || isSign ? `${path.number} ${path.hebrew}` : String(path.number), midX, midY);
  }

  const activeSephirah = line ? SEPHIROTH.find((node) => node.number === line.decan.number)?.name : null;
  for (const node of treeNodes.querySelectorAll("[data-tree-node]")) {
    node.classList.toggle("is-active", node.dataset.treeNode === activeSephirah);
    node.classList.toggle("is-seat", Boolean(line?.treeSeat) && node.dataset.treeNode === line.treeSeat);
  }
}

function renderTreeReading(line) {
  const sephirah = SEPHIROTH.find((node) => node.number === line.decan.number);
  const world = WORLD_DATA[line.decan.suit];
  const entityPaths = line.entityCards.map((card) => ({ card, path: pathForMajor(card.index) })).filter((item) => item.path);
  const signPath = pathForMajor(line.sign.majorIndex);
  const seat = line.treeSeat ? treeNodeByName(line.treeSeat) : null;
  const entityPathText = entityPaths.length
    ? entityPaths.map(({ card, path }) => `${card.name} · Path ${path.number} · ${path.letter} ${path.hebrew} · ${path.from}–${path.to}`).join("; ")
    : "This custom seal does not yet claim a canonical Tarot path.";
  const entityPathCards = entityPaths.length
    ? `<span class="tree-reading__card-stack" aria-hidden="true">${entityPaths.map(({ card }) => `<img src="${cardPreviewFile(card.index)}" alt="" width="72" height="120" loading="lazy" decoding="async">`).join("")}</span>`
    : "";
  const seatHtml = seat
    ? `<div><dt>Lost Opal seat</dt><dd>${escapeHtml(`${seat.name} · ${seat.title} — ${seat.current}. This is a Lost Opal overlay.`)}</dd></div>`
    : "";
  const worldMeaning = `${world.name} means ${world.translation}. In this Hermetic Tarot framework, it is ${world.phrase} and corresponds to ${world.element}.`;
  const specialTeaching = line.name === "Uranus"
    ? "For Lost Opal, Uranus occupies Da’ath and bears The Fool, Death, and The Hanged Man. In this chamber the Hanged Man opens as Mem: primordial Water, approached with more reverence than a generated paragraph can exhaust."
    : line.name === "Pluto"
      ? "Pluto is deliberately shown through two registers. Death is its embodied astrological face; Judgement is its Tree of Life face at Kether. Lost Opal reads Pluto as the passage between dissolution and awakening."
      : "";

  treeReading.innerHTML = `
    <h3>${escapeHtml(entityNameForProse(line.name, true))} in ${escapeHtml(line.sign.name)}</h3>
    <p class="tree-reading__position">${escapeHtml(formatZodiacPosition(line.longitude))}</p>
    <dl>
      <div><dt>Celestial key path${entityPaths.length === 1 ? "" : "s"}</dt><dd${entityPathCards ? ` class="tree-reading__card-detail"` : ""}>${entityPathCards}${entityPathCards ? `<span>${escapeHtml(entityPathText)}</span>` : escapeHtml(entityPathText)}</dd></div>
      <div><dt>Zodiacal path</dt><dd class="tree-reading__card-detail"><span class="tree-reading__card-stack" aria-hidden="true"><img src="${cardPreviewFile(line.sign.majorIndex)}" alt="" width="72" height="120" loading="lazy" decoding="async"></span><span>${escapeHtml(MAJORS[line.sign.majorIndex])} · Path ${signPath.number} · ${escapeHtml(signPath.letter)} ${escapeHtml(signPath.hebrew)} · ${escapeHtml(signPath.from)}–${escapeHtml(signPath.to)}</span></dd></div>
      <div><dt>Active Sephirah</dt><dd class="tree-reading__card-detail"><span class="tree-reading__card-stack" aria-hidden="true"><img src="${cardPreviewFile(line.decan.cardIndex)}" alt="" width="72" height="120" loading="lazy" decoding="async"></span><span><strong>${escapeHtml(line.decan.cardName)}</strong> in ${escapeHtml(sephirah.name)} · ${escapeHtml(sephirah.title)} — ${escapeHtml(sephirah.current)}.</span></dd></div>
      <div><dt>World and element</dt><dd><button class="tree-world-term" type="button" data-tree-world-explainer data-info-title="${escapeHtml(`${world.name} · ${world.translation}`)}" aria-haspopup="dialog" aria-describedby="tree-world-explanation"><span>${escapeHtml(world.name)}</span><span class="tree-world-hebrew" lang="he" dir="rtl">${escapeHtml(world.hebrew)}</span><span class="tree-world-tooltip" id="tree-world-explanation" role="tooltip">${escapeHtml(worldMeaning)}</span></button> · <span class="tree-world-element"><span aria-hidden="true">${escapeHtml(world.elementGlyph)}</span> ${escapeHtml(world.element)}</span> · ${escapeHtml(world.phrase)}.</dd></div>
      ${seatHtml}
    </dl>
    ${specialTeaching ? `<p class="tree-reading__boundary">${escapeHtml(specialTeaching)}</p>` : ""}`;
}

function openTreeFor(lineName) {
  const line = state.lines.find((candidate) => candidate.name === lineName);
  if (!line || !treeDialog) return;
  state.activeTreeLine = line;
  renderTreeReading(line);
  if (typeof treeDialog.showModal === "function" && !treeDialog.open) treeDialog.showModal();
  else treeDialog.setAttribute("open", "");
  requestAnimationFrame(() => drawTree(line));
}

let entryTimer = null;

function introWasSeen() {
  try { return sessionStorage.getItem(INTRO_STORAGE_KEY) === "yes"; } catch { return false; }
}

function rememberIntro() {
  try { sessionStorage.setItem(INTRO_STORAGE_KEY, "yes"); } catch { /* Session storage may be unavailable. */ }
}

function showEntry(force = false) {
  if (!entry || (!force && introWasSeen())) return;
  window.clearTimeout(entryTimer);
  document.body.classList.add("has-seeker-entry");
  document.documentElement.classList.add("has-seeker-entry");
  entry.hidden = false;
  entry.classList.remove("is-opening", "is-question");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    entry.classList.add("is-question");
    return;
  }
  requestAnimationFrame(() => entry.classList.add("is-opening"));
  entryTimer = window.setTimeout(() => entry.classList.add("is-question"), 3300);
}

function syncBirthTimeField() {
  if (!birthTimeConfidence || !birthTimeControl || !birthTimeNote) return;
  const confidence = birthTimeConfidence.value;
  const unknown = confidence === "unknown";
  const timeFields = [...birthTimeControl.querySelectorAll("select")];
  const wasUnknown = timeFields.some((field) => field.disabled);
  timeFields.forEach((field) => {
    field.disabled = unknown;
    field.required = !unknown;
  });
  if (unknown) setTimeControlValue(birthTimeControl, "12:00");
  else if (wasUnknown) setTimeControlValue(birthTimeControl, "");
  birthTimeNote.textContent = unknown
    ? "That is okay. We will use noon as a transparent midpoint and treat the possible time as plus or minus twelve hours."
    : confidence === "approximate"
      ? "Use the closest time you honestly remember. The completed Nuncast will label it as approximate."
      : "Use the documented local time shown on the birth record or to the best of your knowledge.";
}

function openBirthWalkthrough() {
  if (!birthDialog || !birthForm) return;
  birthForm.reset();
  setDateControlValue(birthDateControl, "");
  setTimeControlValue(birthTimeControl, "");
  resetBirthPlacePicker();
  birthForm.elements.birth_zodiac.value = form.elements.zodiac.value;
  syncBirthTimeField();
  if (typeof birthDialog.showModal === "function" && !birthDialog.open) birthDialog.showModal();
  else birthDialog.setAttribute("open", "");
  requestAnimationFrame(() => birthDateControl?.querySelector("[data-date-month]")?.focus());
}

function handleBirthSubmit(event) {
  event.preventDefault();
  if (!birthForm || !form) return;
  if (!birthSelectedPlace) {
    birthLocationInput?.setCustomValidity("Choose one of the matching places so its coordinates can be confirmed.");
    birthLocationInput?.reportValidity();
    setBirthPlaceMessage("Choose one of the matching places before casting the Nuncast.", "error");
    birthLocationInput?.focus();
    return;
  }
  const timeConfidence = birthForm.elements.birth_time_confidence.value;
  const placeConfidence = birthForm.elements.birth_place_confidence.value;
  const birthDate = syncDateControl(birthDateControl, true);
  const birthTime = timeConfidence === "unknown" ? "12:00" : syncTimeControl(birthTimeControl);
  if (!birthDate || !birthTime) return;
  const timeMeta = timeConfidence === "unknown"
    ? "Birth time unknown; noon midpoint (±12 hours)"
    : timeConfidence === "approximate"
      ? "Birth time approximate"
      : "Birth time exact/documented";
  const placeMeta = placeConfidence === "known"
    ? "Birthplace known/documented"
    : placeConfidence === "uncertain"
      ? "Birthplace very uncertain"
      : "Birthplace is a best honest guess";

  setDateControlValue(momentDateControl, birthDate);
  setTimeControlValue(momentTimeControl, birthTime);
  applyMomentPlaceSelection({
    latitude: birthSelectedPlace.latitude,
    longitude: birthSelectedPlace.longitude,
    label: birthSelectedPlace.label,
    kind: birthSelectedPlace.kind,
  });
  form.elements.zodiac.value = birthForm.elements.birth_zodiac.value;
  state.deviceLocation = null;
  state.personalContext = { timeMeta, placeMeta };
  if (personalContext) {
    personalContext.textContent = `Birth-moment intake · ${timeMeta} · ${placeMeta}.`;
    personalContext.hidden = false;
  }
  closeDialog(birthDialog);
  document.querySelector(".moment-chamber")?.scrollIntoView({ behavior: "auto", block: "start" });
  if (typeof form.requestSubmit === "function") form.requestSubmit();
  else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

function closeEntry(path = "moment") {
  if (!entry) return;
  window.clearTimeout(entryTimer);
  rememberIntro();
  document.body.classList.remove("has-seeker-entry");
  document.documentElement.classList.remove("has-seeker-entry");
  entry.hidden = true;
  entry.classList.remove("is-opening", "is-question");
  if (path === "personal" && birthDialog) {
    openBirthWalkthrough();
  } else {
    momentDateControl?.querySelector("[data-date-month]")?.focus({ preventScroll: true });
    document.querySelector(".moment-chamber")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function openCard(button) {
  if (!cardDialog || !cardDialogImage) return;
  cardDialogImage.src = button.dataset.cardSrc;
  cardDialogImage.alt = `${button.dataset.cardName} Tarot card${button.dataset.cardReversed === "true" ? ", reversed" : ""}`;
  cardDialogImage.dataset.reversed = button.dataset.cardReversed;
  cardDialogName.textContent = `${button.dataset.cardName}${button.dataset.cardReversed === "true" ? " · Reversed" : ""}`;
  if (cardDialogHermeticTitle) {
    cardDialogHermeticTitle.textContent = button.dataset.cardHermeticTitle || "";
    cardDialogHermeticTitle.hidden = !button.dataset.cardHermeticTitle;
  }
  const category = button.dataset.cardCategory;
  const zodiacCategory = category.match(/^([♈♉♊♋♌♍♎♏♐♑♒♓])\s+(.+)$/u);
  const rulerCategory = category.match(/^Traditional Ruler · ([☉☽☿♀♂♃♄])\s+(.+)$/u);
  const symbolCategory = zodiacCategory || rulerCategory;
  if (cardDialogCategorySymbol && cardDialogCategoryLabel) {
    cardDialogCategorySymbol.hidden = !symbolCategory;
    cardDialogCategorySymbol.textContent = symbolCategory ? `${symbolCategory[1]}\uFE0E` : "";
    cardDialogCategoryLabel.textContent = zodiacCategory ? zodiacCategory[2] : rulerCategory ? `Traditional Ruler · ${rulerCategory[2]}` : category;
  } else if (cardDialogCategory) {
    cardDialogCategory.textContent = category;
  }
  cardDialogDescription.textContent = button.dataset.cardDescription;
  if (typeof cardDialog.showModal === "function" && !cardDialog.open) cardDialog.showModal();
  else cardDialog.setAttribute("open", "");
}

function closeDialog(dialog) {
  if (!dialog?.open) return;
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

let infoDialogReturnFocus = null;

function infoSourceFor(trigger) {
  const containedSource = trigger.closest(".birth-dialog__help, .correspondence-warning")
    ?.querySelector(".birth-dialog__help-popover, p");
  if (containedSource) return containedSource;

  const describedBy = (trigger.getAttribute("aria-describedby") || "").trim().split(/\s+/).filter(Boolean);
  return describedBy.map((id) => document.getElementById(id)).find(Boolean) || null;
}

function infoTitleFor(trigger) {
  return trigger.dataset.infoTitle
    || trigger.closest("[data-info-title]")?.dataset.infoTitle
    || "More information";
}

function openInfoDialogFor(trigger) {
  if (!infoDialog || !infoDialogTitle || !infoDialogBody) return false;
  const source = infoSourceFor(trigger);
  if (!source) return false;

  infoDialogTitle.textContent = infoTitleFor(trigger);
  const fragment = document.createDocumentFragment();
  if (source.matches(".birth-dialog__help-popover")) {
    [...source.childNodes].forEach((node) => fragment.append(node.cloneNode(true)));
  } else {
    const paragraph = document.createElement("p");
    [...source.childNodes].forEach((node) => paragraph.append(node.cloneNode(true)));
    fragment.append(paragraph);
  }
  infoDialogBody.replaceChildren(fragment);
  infoDialogReturnFocus = trigger;
  if (typeof infoDialog.showModal === "function" && !infoDialog.open) infoDialog.showModal();
  else if (!infoDialog.open) infoDialog.setAttribute("open", "");
  return true;
}

function startOver() {
  state.generation += 1;
  state.deviceLocation = null;
  state.confirmedPlace = null;
  state.lines = [];
  state.activeTreeLine = null;
  state.personalContext = null;
  setBusy(false);
  closeDialog(birthDialog);
  closeDialog(treeDialog);
  closeDialog(cardDialog);
  closeDialog(infoDialog);
  resetBirthPlacePicker();
  const mobileDrawer = document.querySelector(".mobile-drawer");
  const drawerBackdrop = document.querySelector("[data-drawer-backdrop]");
  const menuToggle = document.querySelector(".menu-toggle");
  if (mobileDrawer) mobileDrawer.hidden = true;
  if (drawerBackdrop) drawerBackdrop.hidden = true;
  document.body.classList.remove("drawer-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open menu");
  form.reset();
  localInputDefaults();
  resetMomentPlacePicker();
  form.elements.zodiac.value = "tropical";
  if (printModeSelect) printModeSelect.value = "ink";
  if (artModeSelect) artModeSelect.value = "color";
  applyPrintPreferences();
  pages.innerHTML = "";
  state.activeGroup = 0;
  state.searchQuery = "";
  if (snapshotSearch) snapshotSearch.value = "";
  if (snapshotNavigator) snapshotNavigator.hidden = true;
  if (snapshotQuickMoreList) snapshotQuickMoreList.hidden = true;
  snapshotQuickMore?.setAttribute("aria-expanded", "false");
  resultsMeta.textContent = "";
  results.hidden = true;
  if (personalContext) {
    personalContext.textContent = "";
    personalContext.hidden = true;
  }
  setStatus(state.engineReady ? "Astronomy engine ready. Choose a moment and place." : "Loading the local astronomy engine…");
  window.scrollTo({ top: 0, behavior: "auto" });
  showEntry(true);
}

function applyPrintPreferences() {
  document.body.dataset.printMode = printModeSelect?.value || "ink";
  document.body.dataset.artMode = artModeSelect?.value || "color";
}

async function prepareImagesForPrint() {
  const images = [...pages.querySelectorAll("img[data-print-image]")];
  images.forEach((image) => {
    image.loading = "eager";
    image.fetchPriority = "high";
  });
  await Promise.all(images.map(async (image) => {
    if (!image.complete) {
      await Promise.race([
        new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        }),
        new Promise((resolve) => window.setTimeout(resolve, 3500))
      ]);
    }
    if (image.decode && image.complete && image.naturalWidth) {
      await Promise.race([
        image.decode().catch(() => {}),
        new Promise((resolve) => window.setTimeout(resolve, 1500))
      ]);
    }
  }));
}

if (hasDocument) {
  try {
    if (donateFloat) donateFloat.hidden = sessionStorage.getItem(DONATE_DISMISSED_STORAGE_KEY) === "true";
  } catch {
    // The donation control remains available when session storage is blocked.
  }
  donateFloatClose?.addEventListener("click", () => {
    if (donateFloat) donateFloat.hidden = true;
    try {
      sessionStorage.setItem(DONATE_DISMISSED_STORAGE_KEY, "true");
    } catch {
      // Hiding it for the current page still works without storage.
    }
  });
  initializeTemporalControls();
  localInputDefaults();
  resetMomentPlacePicker();
  form.addEventListener("submit", handleSubmit);
  form.addEventListener("input", (event) => {
    if (event.target === form.elements.location) {
      state.deviceLocation = null;
      state.confirmedPlace = null;
    }
    if (!state.personalContext) return;
    state.personalContext = null;
    if (personalContext) {
      personalContext.textContent = "";
      personalContext.hidden = true;
    }
  });
  locationButton.addEventListener("click", useDeviceLocation);
  printButton.addEventListener("click", async () => {
    applyPrintPreferences();
    const originalLabel = printButton.textContent;
    printButton.disabled = true;
    printButton.textContent = "Preparing Cards…";
    await prepareImagesForPrint();
    printButton.disabled = false;
    printButton.textContent = originalLabel;
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    window.print();
  });
  printModeSelect.addEventListener("change", applyPrintPreferences);
  artModeSelect.addEventListener("change", applyPrintPreferences);
  snapshotSearch?.addEventListener("input", (event) => searchSnapshot(event.currentTarget.value));
  snapshotSearchClear?.addEventListener("click", () => {
    if (snapshotSearch) {
      snapshotSearch.value = "";
      snapshotSearch.focus();
    }
    searchSnapshot("");
  });
  snapshotNavigator?.addEventListener("click", (event) => {
    const quickSearch = event.target.closest("[data-snapshot-quick]");
    if (quickSearch) {
      if (snapshotSearch) {
        snapshotSearch.value = quickSearch.dataset.snapshotQuick;
      }
      searchSnapshot(quickSearch.dataset.snapshotQuick);
      return;
    }
    const moreButton = event.target.closest("[data-snapshot-quick-more]");
    if (moreButton) {
      const willOpen = moreButton.getAttribute("aria-expanded") !== "true";
      moreButton.setAttribute("aria-expanded", String(willOpen));
      if (snapshotQuickMoreList) snapshotQuickMoreList.hidden = !willOpen;
      return;
    }
    const groupButton = event.target.closest("[data-snapshot-group]");
    if (groupButton) selectSnapshotGroup(groupButton.dataset.snapshotGroup);
  });
  snapshotSectionTabs?.addEventListener("keydown", (event) => {
    const current = event.target.closest("[data-snapshot-group]");
    if (!current || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = [...snapshotSectionTabs.querySelectorAll("[data-snapshot-group]")];
    const currentIndex = tabs.indexOf(current);
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : event.key === "ArrowRight" ? (currentIndex + 1) % tabs.length
      : (currentIndex - 1 + tabs.length) % tabs.length;
    event.preventDefault();
    selectSnapshotGroup(tabs[nextIndex].dataset.snapshotGroup, true);
  });
  pages.addEventListener("click", (event) => {
    const carouselPrevious = event.target.closest("[data-carousel-prev]");
    if (carouselPrevious) {
      moveCarousel(carouselPrevious, -1);
      return;
    }
    const carouselNext = event.target.closest("[data-carousel-next]");
    if (carouselNext) {
      moveCarousel(carouselNext, 1);
      return;
    }
    const correspondenceSummary = event.target.closest(".correspondence-warning > summary");
    if (correspondenceSummary) {
      event.preventDefault();
      openInfoDialogFor(correspondenceSummary);
      return;
    }
    const motionButton = event.target.closest("[data-motion-explainer]");
    if (motionButton) {
      openInfoDialogFor(motionButton);
      return;
    }
    const identityButton = event.target.closest("[data-identity-explainer]");
    if (identityButton) {
      openInfoDialogFor(identityButton);
      return;
    }
    const cardButton = event.target.closest("[data-card-open]");
    if (cardButton) {
      openCard(cardButton);
      return;
    }
    const enterTree = event.target.closest("[data-enter-tree]");
    if (enterTree) {
      openTreeFor(enterTree.dataset.enterTree);
      return;
    }
    const tab = event.target.closest("[data-row-view]");
    if (!tab) return;
    const row = tab.closest("[data-snapshot-row]");
    activateRowTab(row, tab);
  });
  pages.addEventListener("keydown", (event) => {
    const current = event.target.closest("[data-row-view]");
    if (!current || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const row = current.closest("[data-snapshot-row]");
    const tabs = [...row.querySelectorAll("[data-row-view]")];
    const currentIndex = tabs.indexOf(current);
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : event.key === "ArrowRight" ? (currentIndex + 1) % tabs.length
      : (currentIndex - 1 + tabs.length) % tabs.length;
    event.preventDefault();
    activateRowTab(row, tabs[nextIndex], true);
  });

  entrySkip?.addEventListener("click", () => closeEntry("moment"));
  entry?.addEventListener("click", (event) => {
    const pathButton = event.target.closest("[data-entry-path]");
    if (pathButton) closeEntry(pathButton.dataset.entryPath);
  });
  document.querySelectorAll("[data-start-over]").forEach((button) => button.addEventListener("click", startOver));
  momentLocationInput?.addEventListener("input", scheduleMomentPlaceSearch);
  momentLocationInput?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMomentPlaceResults();
      return;
    }
    if (event.key !== "ArrowDown" || momentLocationResults?.hidden) return;
    const firstOption = momentLocationResults.querySelector("[data-moment-location-option]");
    if (firstOption) {
      event.preventDefault();
      firstOption.focus();
    }
  });
  momentLocationResults?.addEventListener("click", (event) => {
    const option = event.target.closest("[data-moment-location-option]");
    if (!option) return;
    applyMomentPlaceSelection(momentPlaceOptions[Number(option.dataset.momentLocationOption)], true);
  });
  momentLocationResults?.addEventListener("keydown", (event) => {
    const option = event.target.closest("[data-moment-location-option]");
    if (!option) return;
    const options = [...momentLocationResults.querySelectorAll("[data-moment-location-option]")];
    const index = options.indexOf(option);
    if (event.key === "Escape") {
      event.preventDefault();
      closeMomentPlaceResults();
      momentLocationInput?.focus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? options.length - 1
      : event.key === "ArrowDown" ? (index + 1) % options.length
      : (index - 1 + options.length) % options.length;
    options[nextIndex]?.focus();
  });
  birthTimeConfidence?.addEventListener("change", syncBirthTimeField);
  birthLocationInput?.addEventListener("input", scheduleBirthPlaceSearch);
  birthLocationInput?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeBirthPlaceResults();
      return;
    }
    if (event.key !== "ArrowDown" || birthLocationResults?.hidden) return;
    const firstOption = birthLocationResults.querySelector("[data-birth-location-option]");
    if (firstOption) {
      event.preventDefault();
      firstOption.focus();
    }
  });
  birthLocationResults?.addEventListener("click", (event) => {
    const option = event.target.closest("[data-birth-location-option]");
    if (!option) return;
    chooseBirthPlace(birthPlaceOptions[Number(option.dataset.birthLocationOption)]);
  });
  birthLocationResults?.addEventListener("keydown", (event) => {
    const option = event.target.closest("[data-birth-location-option]");
    if (!option) return;
    const options = [...birthLocationResults.querySelectorAll("[data-birth-location-option]")];
    const index = options.indexOf(option);
    if (event.key === "Escape") {
      event.preventDefault();
      closeBirthPlaceResults();
      birthLocationInput?.focus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? options.length - 1
      : event.key === "ArrowDown" ? (index + 1) % options.length
      : (index - 1 + options.length) % options.length;
    options[nextIndex]?.focus();
  });
  birthForm?.addEventListener("submit", handleBirthSubmit);
  document.querySelectorAll("[data-birth-close]").forEach((button) => button.addEventListener("click", () => closeDialog(birthDialog)));
  birthDialog?.addEventListener("click", (event) => {
    const helpSummary = event.target.closest(".birth-dialog__help > summary");
    if (helpSummary) {
      event.preventDefault();
      openInfoDialogFor(helpSummary);
      return;
    }
  });
  birthDialog?.addEventListener("cancel", (event) => event.preventDefault());
  birthDialog?.addEventListener("close", () => {
    birthPlaceSearchController?.abort();
    closeBirthPlaceResults();
    birthDialog.querySelectorAll(".birth-dialog__help[open]").forEach((help) => help.removeAttribute("open"));
  });

  document.querySelector("[data-tree-close]")?.addEventListener("click", () => closeDialog(treeDialog));
  treeDialog?.addEventListener("click", (event) => {
    if (event.target === treeDialog) closeDialog(treeDialog);
  });
  treeReading?.addEventListener("click", (event) => {
    const worldButton = event.target.closest("[data-tree-world-explainer]");
    if (!worldButton) return;
    openInfoDialogFor(worldButton);
  });
  document.querySelector("[data-card-close]")?.addEventListener("click", () => closeDialog(cardDialog));
  cardDialog?.addEventListener("click", (event) => {
    if (event.target === cardDialog) closeDialog(cardDialog);
  });
  document.querySelector("[data-info-dialog-close]")?.addEventListener("click", () => closeDialog(infoDialog));
  document.addEventListener("click", (event) => {
    const infoButton = event.target.closest?.("[data-info-explainer]");
    if (infoButton) openInfoDialogFor(infoButton);
  }, { capture: true });
  infoDialog?.addEventListener("click", (event) => {
    if (event.target === infoDialog) closeDialog(infoDialog);
  });
  infoDialog?.addEventListener("close", () => {
    const returnTarget = infoDialogReturnFocus;
    infoDialogReturnFocus = null;
    if (returnTarget?.isConnected) requestAnimationFrame(() => returnTarget.focus({ preventScroll: true }));
  });
  document.addEventListener("click", (event) => {
    if (momentLocationField && !momentLocationField.contains(event.target)) closeMomentPlaceResults();
    if (birthLocationField && !birthLocationField.contains(event.target)) closeBirthPlaceResults();
    document.querySelectorAll(".birth-dialog__help[open]").forEach((help) => {
      if (!help.contains(event.target)) help.removeAttribute("open");
    });
    document.querySelectorAll(".correspondence-warning[open]").forEach((warning) => {
      if (!warning.contains(event.target)) warning.removeAttribute("open");
    });
    document.querySelectorAll("[data-motion-explainer][aria-expanded='true']").forEach((button) => {
      if (!button.contains(event.target)) button.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll("[data-identity-explainer][aria-expanded='true']").forEach((button) => {
      if (!button.contains(event.target)) button.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll("[data-tree-world-explainer][aria-expanded='true']").forEach((button) => {
      if (!button.contains(event.target)) button.setAttribute("aria-expanded", "false");
    });
  });
  treeNodes?.addEventListener("click", (event) => {
    const nodeButton = event.target.closest("[data-tree-node]");
    if (!nodeButton || !state.activeTreeLine) return;
    const node = treeNodeByName(nodeButton.dataset.treeNode);
    nodeButton.setAttribute("aria-label", `${node.name}, ${node.title}: ${node.current}`);
  });

  createTreeNodes();
  if (typeof ResizeObserver === "function") {
    const treeObserver = new ResizeObserver(() => {
      if (treeDialog?.open) drawTree();
    });
    treeObserver.observe(document.querySelector("[data-tree-stage]"));
  }
  showEntry(false);
}

export {
  RESULT_GROUPS,
  HERMETIC_CARD_TITLES,
  RULER_DATA,
  SIGN_DATA,
  PATH_DATA,
  SEPHIROTH,
  ZODIAC_SYSTEMS,
  HOUSE_DATA,
  buildLine,
  calculateLines,
  formatZodiacPosition,
  houseNumberFor,
  naturalHouseForSign,
  minorCardIndex,
  numerologyFor,
  reduceNumber,
  signAndDecan,
  zonedDateToUtc,
};
