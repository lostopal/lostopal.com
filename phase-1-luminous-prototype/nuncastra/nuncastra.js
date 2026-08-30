/*
 * Nuncastra — the stars as they are now
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
const EPHEMERIS_FILES = ["sepl_18.se1", "semo_18.se1", "seas_18.se1"];
const SIGN_DEGREES = 30;
const DECAN_DEGREES = 10;
const INTRO_STORAGE_KEY = "nuncastra-intro-seen-v1";
const DONATE_DISMISSED_STORAGE_KEY = "nuncastra-donate-dismissed-v1";

const ZODIAC_SYSTEMS = {
  tropical: { label: "Tropical Zodiac · Lost Opal Default", siderealMode: null },
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

function romanNumeral(value) {
  if (value === 0) return "0";
  if (!Number.isInteger(value) || value < 0) return String(value);
  const numerals = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let remaining = value;
  let result = "";
  numerals.forEach(([amount, numeral]) => {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  });
  return result;
}

function majorKeyLabel(value) {
  return value >= 0 && value < MAJORS.length ? romanNumeral(value) : String(value);
}

const RULER_DATA = {
  Sun: { glyph: "☉", majorIndex: 19, influence: "vitality, centered identity, illumination, and creative radiance" },
  Moon: { glyph: "☽", majorIndex: 18, influence: "instinct, memory, feeling, belonging, and responsive cycles" },
  Mercury: { glyph: "☿", majorIndex: 1, influence: "thought, language, exchange, perception, and adaptable movement" },
  Venus: { glyph: "♀", majorIndex: 3, influence: "attraction, value, relationship, beauty, pleasure, and receptive creation" },
  Mars: { glyph: "♂", majorIndex: 16, influence: "desire, courage, conflict, severance, and decisive action" },
  Jupiter: { glyph: "♃", majorIndex: 10, influence: "expansion, meaning, faith, opportunity, wisdom, and the larger pattern" },
  Saturn: { glyph: "♄", majorIndex: 21, influence: "boundary, time, consequence, responsibility, endurance, and mastery" },
  Uranus: { glyph: "♅", influence: "disruption, liberation, unprecedented possibility, and radical reorientation" },
  Neptune: { glyph: "♆", influence: "vision, compassion, imagination, surrender, and the dissolving of boundaries" },
  Pluto: { glyph: "♇", influence: "power, underworld truth, irreversible transformation, grief, and renewal" },
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
  { title: "Self & Approach", meaning: "identity, embodiment, immediate presence, and the way this current enters experience" },
  { title: "Resources & Worth", meaning: "money, possessions, skills, values, self-worth, and what can be sustained" },
  { title: "Learning & Exchange", meaning: "communication, everyday learning, siblings, neighbors, and the local paths information travels" },
  { title: "Home & Roots", meaning: "home, family, ancestry, belonging, and the private foundation beneath public life" },
  { title: "Creation & Joy", meaning: "creativity, pleasure, romance, children, play, and wholehearted personal expression" },
  { title: "Work & Care", meaning: "daily work, service, health routines, maintenance, practice, and the craft of tending life" },
  { title: "Partnership & Mirrors", meaning: "one-to-one relationships, agreements, open conflict, and the self encountered through another" },
  { title: "Intimacy & Transformation", meaning: "shared resources, vulnerability, inheritance, loss, merging, and irreversible change" },
  { title: "Meaning & Horizon", meaning: "higher study, worldview, spiritual or philosophical seeking, long journeys, and the search for meaning" },
  { title: "Calling & Public Life", meaning: "vocation, reputation, responsibility, authority, and the contribution made visible to the world" },
  { title: "Community & Future", meaning: "friendship, groups, causes, patrons, collective hopes, and the future imagined with others" },
  { title: "Retreat & the Unseen", meaning: "solitude, dreams, hidden patterns, endings, surrender, and compassionate work beyond recognition" },
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
  { name: "Lilith", technicalName: "Mean Black Moon Lilith", glyph: "⚸", body: LunarPoint.MeanApogee, majorIndices: [], seal: "⚸", sealVisualLabel: "Lilith", sealKind: "Celestial Point", correspondencePending: true, essence: "Lilith marks the lunar apogee as a point of refusal, estrangement, sovereignty, and material that resists polite containment", ground: "Name what has been exiled without letting the exile become your only identity." },
  { name: "Ceres", glyph: "⚳", body: Asteroid.Ceres, majorIndices: [], seal: "⚳", sealVisualLabel: "Ceres", sealKind: "Celestial Point", correspondencePending: true, essence: "Ceres brings nourishment, separation, grief, return, and the terms through which care becomes sustainable", ground: "Ask what truly feeds the life in front of you." },
  { name: "Pallas", glyph: "⚴", body: Asteroid.Pallas, majorIndices: [], seal: "⚴", sealVisualLabel: "Pallas", sealKind: "Celestial Point", correspondencePending: true, essence: "Pallas brings pattern-recognition, strategy, craft, and the intelligence that sees how the pieces may be arranged", ground: "Solve the pattern without sacrificing the people inside it." },
  { name: "Juno", glyph: "⚵", body: Asteroid.Juno, majorIndices: [], seal: "⚵", sealVisualLabel: "Juno", sealKind: "Celestial Point", correspondencePending: true, essence: "Juno brings covenant, equality, loyalty, power-sharing, and the promises through which relationship becomes consequential", ground: "Examine whether the agreement honors every person bound by it." },
  { name: "Vesta", glyph: "⚶", body: Asteroid.Vesta, majorIndices: [], seal: "⚶", sealVisualLabel: "Vesta", sealKind: "Celestial Point", correspondencePending: true, essence: "Vesta tends devotion, sacred concentration, the hearth, and the living flame protected through disciplined attention", ground: "Return one fragment of scattered attention to what you call sacred." },
];

const ANGLE_DATA = {
  ascendant: {
    name: "Ascendant",
    glyph: "ASC",
    seal: "ASC",
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
    names: ["Sun", "Moon", "Mercury"],
    description: "Begin with the moment's inner light: identity and purpose, emotional instinct, then the mind that names and connects what is happening.",
  },
  {
    title: "Desire, Action & Growth",
    names: ["Venus", "Mars", "Jupiter"],
    description: "Move into the relational and active layer: what the moment values and attracts, how it applies force, and where it seeks meaning or expansion.",
  },
  {
    title: "Structure & Outer Weather",
    names: ["Saturn", "Uranus", "Neptune"],
    description: "Step outward into slower currents: the structures defining reality, the force disrupting them, and the dream or dissolution moving through the collective field.",
  },
  {
    title: "Underworld, Wound & Shadow",
    names: ["Pluto", "Chiron", "Lilith"],
    description: "Descend beneath the obvious story: irreversible transformation, the wound becoming medicine, and the lunar apogee where refusal or exile asks to be understood.",
  },
  {
    title: "Direction & Inheritance",
    names: ["North Node", "South Node", "Lot of Fortune"],
    description: "Follow the axis of becoming and release, then ground it in the material circumstances through which this moment can actually be lived.",
  },
  {
    title: "Nourishment, Strategy & Covenant",
    names: ["Ceres", "Pallas", "Juno"],
    description: "Listen to the embodied archetypes of care, pattern-wise intelligence, and the agreements that make relationship and responsibility real.",
  },
  {
    title: "Devotion & Local Angles",
    names: ["Vesta", "Ascendant", "Midheaven", "Vertex"],
    description: "Return to the local sky: the flame receiving devotion, the eastern threshold, the visible summit, and the western point of consequential encounter.",
  },
];

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
  11: ["Illumination", "A master-number tension heightens intuition and asks inspiration to pass through a balanced, conscious channel."],
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
  Wands: { name: "Atziluth", element: "Fire", phrase: "the archetypal world of emanation and will" },
  Cups: { name: "Briah", element: "Water", phrase: "the creative world of feeling and reception" },
  Swords: { name: "Yetzirah", element: "Air", phrase: "the formative world of image, language, and mind" },
  Pentacles: { name: "Assiah", element: "Earth", phrase: "the active material world of embodiment and consequence" },
};

const SUIT_START = { Wands: 22, Cups: 36, Swords: 50, Pentacles: 64 };
const formatterCache = new Map();
const state = { deviceLocation: null, confirmedPlace: null, engine: null, engineReady: false, busy: false, lines: [], activeTreeLine: null, personalContext: null, generation: 0 };
const hasDocument = typeof document !== "undefined";

const form = hasDocument ? document.querySelector("[data-snapshot-form]") : null;
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
const printButton = hasDocument ? document.querySelector("[data-print]") : null;
const printModeSelect = hasDocument ? document.querySelector("[data-print-mode]") : null;
const artModeSelect = hasDocument ? document.querySelector("[data-art-mode]") : null;
const entry = hasDocument ? document.querySelector("[data-seeker-entry]") : null;
const entrySkip = hasDocument ? document.querySelector("[data-entry-skip]") : null;
const birthDialog = hasDocument ? document.querySelector("[data-birth-dialog]") : null;
const birthForm = hasDocument ? document.querySelector("[data-birth-form]") : null;
const birthTimeConfidence = hasDocument ? document.querySelector("[data-birth-time-confidence]") : null;
const birthTimeInput = hasDocument ? document.querySelector("[data-birth-time]") : null;
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
const donateFloat = hasDocument ? document.querySelector("[data-donate-float]") : null;
const donateFloatClose = hasDocument ? document.querySelector("[data-donate-float-close]") : null;

function cardFile(index) {
  return `${CARD_BASE}/${String(index).padStart(2, "0")}.webp`;
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

function cardFigureHtml({ category, name, cardIndex, description = "", reversed = false, nodeGlyph = null, seal = null, sealKind = "Celestial Point", sealVisualLabel = name, correspondencePending = false }) {
  const safeName = escapeHtml(name);
  const hermeticTitle = Number.isInteger(cardIndex) ? HERMETIC_CARD_TITLES[cardIndex] || "" : "";
  let visual;
  if (seal) {
    visual = `<div class="snapshot-seal-card" role="img" aria-label="${safeName}; ${escapeHtml(sealKind)}"><span><b>${escapeHtml(seal)}</b><small>${escapeHtml(sealVisualLabel)}</small></span></div>`;
  } else {
    const reverseClass = reversed ? " snapshot-card-visual--reversed" : "";
    const reverseAlt = reversed ? ", reversed" : "";
    const badge = nodeGlyph ? `<span class="snapshot-node-seal" aria-hidden="true">${escapeHtml(nodeGlyph)}</span>` : "";
    visual = `<button class="snapshot-card-button" type="button" data-card-open data-card-name="${safeName}" data-card-hermetic-title="${escapeHtml(hermeticTitle)}" data-card-category="${escapeHtml(category)}" data-card-description="${escapeHtml(description)}" data-card-src="${cardFile(cardIndex)}" data-card-reversed="${reversed ? "true" : "false"}" aria-label="Enlarge ${safeName}${reverseAlt}"><span class="snapshot-card-visual${reverseClass}"><img src="${cardFile(cardIndex)}" alt="${safeName} tarot card${reverseAlt}" width="320" height="533" loading="lazy" decoding="async" fetchpriority="low" data-print-image>${badge}</span></button>`;
  }
  const warning = correspondencePending
    ? `<details class="correspondence-warning"><summary aria-label="Explain this developing correspondence">!</summary><p>Additional correspondence and definition in development.</p></details>`
    : "";
  return `<figure>${visual}<figcaption><small>${escapeHtml(category)}</small>${safeName}${reversed ? " · Reversed" : ""}${warning}</figcaption></figure>`;
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
  return `${card.name} is the celestial voice of ${line.name} in this row. ${line.entityEssence}.`;
}

function entityCardsHtml(line) {
  if (!line.entityCards.length) {
    return `<div class="snapshot-card-group snapshot-card-group--single" style="--card-count:1">${cardFigureHtml({
      category: line.sealKind,
      name: line.name,
      seal: line.seal,
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
    description: `${line.sign.name} is traditionally ruled by ${line.ruler.name}. ${rulerCardName} carries ${line.ruler.influence} into the way this zodiacal field conducts the line.`,
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

function identityTileHtml({ id, glyph, name, kind, description, modifier = "" }) {
  return `
    <button class="snapshot-identity-tile${modifier ? ` ${modifier}` : ""}" type="button" data-identity-explainer aria-expanded="false" aria-describedby="${escapeHtml(id)}" aria-label="${escapeHtml(`${kind}: ${name}. Show a short explanation.`)}">
      <b aria-hidden="true">${escapeHtml(glyph)}</b>
      <strong>${escapeHtml(name)}</strong>
      <span class="snapshot-identity-tooltip" id="${escapeHtml(id)}" role="tooltip"><em>${escapeHtml(kind)}:</em> ${escapeHtml(description)}</span>
    </button>`;
}

function treePreviewHtml(line) {
  const sephirah = SEPHIROTH.find((item) => item.number === line.decan.number);
  const world = WORLD_DATA[line.decan.suit];
  return `
    <div class="snapshot-tree-preview">
      <span class="snapshot-tree-preview__seal" aria-hidden="true">${escapeHtml(String(sephirah.number))}</span>
      <div>
        <p><strong>${escapeHtml(sephirah.name)} · ${escapeHtml(sephirah.title)}</strong> The ${escapeHtml(line.decan.cardName)} places this row in ${escapeHtml(sephirah.name)}, expressed through ${escapeHtml(world.name)} (${escapeHtml(world.element)}).</p>
        <p>This is only the threshold. The complete diagram appears in a separate study chamber so the ordinary reading remains clear.</p>
        <button class="snapshot-enter-tree" type="button" data-enter-tree="${escapeHtml(line.name)}">Enter the Tree</button>
      </div>
    </div>`;
}

function rowHtml(line) {
  const rowId = line.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  const numerology = numerologyFor(line);
  const plainLine = `${line.name} in ${line.sign.name}, ${decanLabel(line.decanIndex)}, ${line.house.label} House; ${line.sign.name} is traditionally ruled by ${line.ruler.name}.`;
  const decanNumber = decanLabel(line.decanIndex).replace(" Decan", "");
  const modernRulerNote = line.ruler.modern
    ? ` Modern astrology also associates ${line.sign.name} with ${line.ruler.modern.name}, adding a later lens of ${line.ruler.modern.influence}.`
    : "";
  return `
    <article class="snapshot-row" data-snapshot-row>
      <div class="snapshot-cards" aria-label="${escapeHtml(tarotLineFor(line))}">
        ${entityCardsHtml(line)}
        ${signCardsHtml(line)}
        ${cardFigureHtml({ category: decanLabel(line.decanIndex), name: line.decan.cardName, cardIndex: line.decan.cardIndex, description: `${line.decan.cardName} ${line.decan.meaning}. Ground it: ${line.decan.ground}` })}
      </div>
      <div class="snapshot-reading">
        <div class="snapshot-reading__title">
          <div>
            <p>${escapeHtml(formatZodiacPosition(line.longitude))}</p>
            <div class="snapshot-reading__identity" aria-label="${escapeHtml(plainLine)}">
              ${identityTileHtml({ id: `${rowId}-entity-tip`, glyph: line.glyph, name: line.name, kind: "Celestial Voice", description: `${line.entityEssence}.` })}
              ${identityTileHtml({ id: `${rowId}-sign-tip`, glyph: line.sign.glyph, name: line.sign.name, kind: "Zodiacal Field", description: `${line.sign.name} shapes expression through ${line.sign.field}.` })}
              ${identityTileHtml({ id: `${rowId}-decan-tip`, glyph: decanNumber, name: "Decan", kind: "Decan Action", description: `${line.decan.cardName} ${line.decan.meaning}.`, modifier: "snapshot-identity-tile--decan" })}
              ${identityTileHtml({ id: `${rowId}-house-tip`, glyph: line.house.label, name: "House", kind: "House", description: `The ${line.house.label} House shows where the line operates through ${line.house.meaning}.`, modifier: "snapshot-identity-tile--house" })}
              ${identityTileHtml({ id: `${rowId}-ruler-tip`, glyph: line.ruler.glyph, name: line.ruler.name, kind: "Traditional Ruler", description: `${line.sign.name} is ruled by ${line.ruler.name}, bringing ${line.ruler.influence} to its field.`, modifier: "snapshot-identity-tile--ruler" })}
            </div>
            <p class="snapshot-reading__plain-line">${escapeHtml(plainLine)}</p>
          </div>
          <button class="snapshot-motion ${line.motion.className}" type="button" data-motion-explainer aria-expanded="false" aria-describedby="${rowId}-motion-explanation">
            ${escapeHtml(line.motion.label)}
            <span class="snapshot-motion__tooltip" id="${rowId}-motion-explanation" role="tooltip">${escapeHtml(line.motion.explanation)}</span>
          </button>
        </div>
        <div class="snapshot-reading__context">
          <p><strong>${escapeHtml(line.house.label)} House &middot; ${escapeHtml(line.house.title)}:</strong> This house concerns ${escapeHtml(line.house.meaning)}. <span class="snapshot-reading__context-system">${escapeHtml(line.house.system)} houses.</span></p>
          <p><strong>${escapeHtml(line.ruler.glyph)} ${escapeHtml(line.ruler.name)} &middot; Traditional Ruler of ${escapeHtml(line.sign.name)}:</strong> ${escapeHtml(MAJORS[line.ruler.majorIndex])} carries ${escapeHtml(line.ruler.influence)} into this zodiacal field.${modernRulerNote ? `<span class="snapshot-reading__modern-ruler">${escapeHtml(modernRulerNote)}</span>` : ""}</p>
        </div>
        <div class="snapshot-reading__tabs" role="tablist" aria-label="Perspectives for ${escapeHtml(line.name)}">
          <button type="button" role="tab" aria-selected="true" aria-controls="${rowId}-reading" id="${rowId}-reading-tab" data-row-view="reading" tabindex="0">Reading</button>
          <button type="button" role="tab" aria-selected="false" aria-controls="${rowId}-numerology" id="${rowId}-numerology-tab" data-row-view="numerology" tabindex="-1">Numerology</button>
          <button type="button" role="tab" aria-selected="false" aria-controls="${rowId}-tree" id="${rowId}-tree-tab" data-row-view="tree" tabindex="-1">Tree of Life</button>
        </div>
        <div class="snapshot-reading__panel" id="${rowId}-reading" role="tabpanel" aria-labelledby="${rowId}-reading-tab" data-row-panel="reading">
          <p><strong>Tarot Line:</strong> ${escapeHtml(tarotLineFor(line))}</p>
          <p><strong>Meaning:</strong> ${escapeHtml(readingFor(line))}</p>
          <p class="snapshot-reading__ground"><strong>Ground It:</strong> ${escapeHtml(line.entityGround)} ${escapeHtml(line.decan.ground)}</p>
        </div>
        <div class="snapshot-reading__panel snapshot-numerology-panel" id="${rowId}-numerology" role="tabpanel" aria-labelledby="${rowId}-numerology-tab" data-row-panel="numerology" hidden>
          <p><strong>Card Equation:</strong> ${escapeHtml(numerology.equation)}</p>
          <p><strong>${escapeHtml(numerology.heading)}:</strong> ${escapeHtml(numerology.meaning)}</p>
          ${numerology.cards.length ? `<div class="snapshot-numerology-sequence">
            <strong>Cards in Sequence</strong>
            <ol>${numerology.cards.map((card) => `<li><strong><span>${escapeHtml(card.key)}</span> &middot; ${escapeHtml(card.name)}</strong><p>${escapeHtml(card.meaning)}</p></li>`).join("")}</ol>
          </div>` : ""}
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
    .map((value) => ({ key: majorKeyLabel(value), name: MAJORS[value], meaning: MAJOR_KEY_MEANINGS[value] }));

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

function renderSnapshot(lines, meta) {
  const lineMap = new Map(lines.map((line) => [line.name, line]));
  const pageCount = RESULT_GROUPS.length;
  const output = RESULT_GROUPS.map((group, pageIndex) => {
    const groupLines = group.names.map((name) => lineMap.get(name)).filter(Boolean);
    const sectionHeading = `<header class="snapshot-section-heading"><h3>${escapeHtml(group.title)}</h3><div>${escapeHtml(group.description)}</div></header>`;
    const sizeClass = groupLines.length >= 4 ? " snapshot-print-page--four" : "";
    return `<section class="snapshot-print-page${sizeClass}">${printHeaderHtml(meta, pageIndex + 1, pageCount)}${sectionHeading}${groupLines.map(rowHtml).join("")}</section>`;
  });
  pages.innerHTML = output.join("");
  state.lines = lines;
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

function localInputDefaults() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  form.elements.date.value = `${year}-${month}-${day}`;
  form.elements.time.value = `${hour}:${minute}`;
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

const BIRTH_PLACE_PROMPT = "Start typing, then choose the matching place to lock its coordinates.";
const MOMENT_PLACE_PROMPT = "Start typing, then choose the matching place to confirm its coordinates.";
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

async function searchPlaces(query, signal) {
  const direct = parseCoordinates(query);
  if (direct) return [{ ...direct, kind: "Exact coordinates" }];

  const endpoint = new URL("https://photon.komoot.io/api/");
  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("limit", "7");
  endpoint.searchParams.set("lang", "en");
  endpoint.searchParams.set("osm_tag", "place");
  const response = await fetch(endpoint, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("The place-search service is unavailable right now.");
  const payload = await response.json();
  const seen = new Set();
  return (payload.features || [])
    .map(photonPlace)
    .filter(Boolean)
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
      setBirthPlaceMessage("No matching place yet. Add a state, country, region, or ZIP code and try again.", "error");
      return;
    }
    renderBirthPlaceResults(places);
    setBirthPlaceMessage("Choose the correct place below to lock its coordinates.");
  } catch (error) {
    if (error.name === "AbortError") return;
    closeBirthPlaceResults();
    setBirthPlaceMessage("Place suggestions could not be reached. Check the connection and try again.", "error");
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
      setMomentPlaceMessage("No matching place yet. Add a state, country, region, or ZIP code and try again.", "error");
      return;
    }
    renderMomentPlaceResults(places);
    setMomentPlaceMessage("Choose the correct place below before casting this moment.");
  } catch (error) {
    if (error.name === "AbortError") return;
    closeMomentPlaceResults();
    setMomentPlaceMessage("Place suggestions could not be reached. Check the connection and try again.", "error");
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
  let houseSystemLabel = "Placidus";
  try {
    houses = engine.calculateHouses(julianDay, latitude, longitude, HouseSystem.Placidus);
    if (!houseCuspsAreUsable(houses.cusps)) throw new Error("Invalid Placidus cusps");
  } catch {
    houses = engine.calculateHouses(julianDay, latitude, longitude, HouseSystem.Equal);
    houseSystemLabel = "Equal (fallback)";
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
  return lines.map((line) => ({
    ...line,
    house: houseFor(line.longitude, adjustedCusps, houseSystemLabel),
  }));
}

async function handleSubmit(event) {
  event.preventDefault();
  if (state.busy) return;
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
      <span><strong>${escapeHtml(node.name)}</strong><small>${node.number ? `${node.number} · ` : ""}${escapeHtml(node.title)}</small></span>
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
    ? entityPaths.map(({ card, path }) => `${card.name}: Path ${path.number}, ${path.letter} ${path.hebrew}, ${path.from}–${path.to}`).join("; ")
    : "This custom seal does not yet claim a canonical Tarot path.";
  const seatText = seat
    ? `${seat.name} · ${seat.title} — ${seat.current}. This is a Lost Opal overlay.`
    : "No additional Lost Opal planetary seat has been assigned to this entity.";
  const specialTeaching = line.name === "Uranus"
    ? "For Lost Opal, Uranus occupies Da’ath and bears The Fool, Death, and The Hanged Man. In this chamber the Hanged Man opens as Mem: primordial Water, approached with more reverence than a generated paragraph can exhaust."
    : line.name === "Pluto"
      ? "Pluto is deliberately shown through two registers. Death is its embodied astrological face; Judgement is its Tree of Life face at Kether. Lost Opal reads Pluto as the passage between dissolution and awakening."
      : "The everyday Nuncast remains the primary reading. This chamber names the structure beneath it without requiring the seeker to enter deeper study.";

  treeReading.innerHTML = `
    <h3>${escapeHtml(line.name)} in ${escapeHtml(line.sign.name)}</h3>
    <p class="tree-reading__position">${escapeHtml(formatZodiacPosition(line.longitude))}</p>
    <dl>
      <div><dt>Celestial key path${entityPaths.length === 1 ? "" : "s"}</dt><dd>${escapeHtml(entityPathText)}</dd></div>
      <div><dt>Zodiacal path</dt><dd>${escapeHtml(MAJORS[line.sign.majorIndex])}: Path ${signPath.number}, ${escapeHtml(signPath.letter)} ${escapeHtml(signPath.hebrew)}, ${escapeHtml(signPath.from)}–${escapeHtml(signPath.to)}</dd></div>
      <div><dt>Active Sephirah</dt><dd>${escapeHtml(sephirah.name)} · ${escapeHtml(sephirah.title)} — ${escapeHtml(sephirah.current)}.</dd></div>
      <div><dt>World and element</dt><dd>${escapeHtml(world.name)} · ${escapeHtml(world.element)} — ${escapeHtml(world.phrase)}.</dd></div>
      <div><dt>Lost Opal seat</dt><dd>${escapeHtml(seatText)}</dd></div>
    </dl>
    <p class="tree-reading__boundary">${escapeHtml(specialTeaching)}</p>`;
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
  if (!birthTimeConfidence || !birthTimeInput || !birthTimeNote) return;
  const confidence = birthTimeConfidence.value;
  const unknown = confidence === "unknown";
  birthTimeInput.disabled = unknown;
  birthTimeInput.required = !unknown;
  birthTimeNote.textContent = unknown
    ? "That is okay. We will use noon as a transparent midpoint and treat the possible time as plus or minus twelve hours."
    : confidence === "approximate"
      ? "Use the closest time you honestly remember. The completed Nuncast will label it as approximate."
      : "Use the documented local time shown on the birth record or to the best of your knowledge.";
}

function openBirthWalkthrough() {
  if (!birthDialog || !birthForm) return;
  birthForm.reset();
  resetBirthPlacePicker();
  birthForm.elements.birth_zodiac.value = form.elements.zodiac.value;
  syncBirthTimeField();
  if (typeof birthDialog.showModal === "function" && !birthDialog.open) birthDialog.showModal();
  else birthDialog.setAttribute("open", "");
  requestAnimationFrame(() => birthForm.elements.birth_date.focus());
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
  const birthTime = timeConfidence === "unknown" ? "12:00" : birthForm.elements.birth_time.value;
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

  form.elements.date.value = birthForm.elements.birth_date.value;
  form.elements.time.value = birthTime;
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
  form.requestSubmit();
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
    form?.elements.date?.focus({ preventScroll: true });
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
      await new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }
    if (image.decode) await image.decode().catch(() => {});
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
    window.print();
  });
  printModeSelect.addEventListener("change", applyPrintPreferences);
  artModeSelect.addEventListener("change", applyPrintPreferences);
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
    const motionButton = event.target.closest("[data-motion-explainer]");
    if (motionButton) {
      const willOpen = motionButton.getAttribute("aria-expanded") !== "true";
      pages.querySelectorAll("[data-motion-explainer][aria-expanded='true']").forEach((button) => button.setAttribute("aria-expanded", "false"));
      motionButton.setAttribute("aria-expanded", String(willOpen));
      return;
    }
    const identityButton = event.target.closest("[data-identity-explainer]");
    if (identityButton) {
      const willOpen = identityButton.getAttribute("aria-expanded") !== "true";
      pages.querySelectorAll("[data-identity-explainer][aria-expanded='true']").forEach((button) => button.setAttribute("aria-expanded", "false"));
      identityButton.setAttribute("aria-expanded", String(willOpen));
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
    const identityButton = event.target.closest("[data-identity-explainer]");
    if (identityButton && event.key === "Escape") {
      identityButton.setAttribute("aria-expanded", "false");
      identityButton.blur();
      return;
    }
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
    if (event.target === birthDialog) closeDialog(birthDialog);
  });
  birthDialog?.addEventListener("close", () => {
    birthPlaceSearchController?.abort();
    closeBirthPlaceResults();
  });

  document.querySelector("[data-tree-close]")?.addEventListener("click", () => closeDialog(treeDialog));
  treeDialog?.addEventListener("click", (event) => {
    if (event.target === treeDialog) closeDialog(treeDialog);
  });
  document.querySelector("[data-card-close]")?.addEventListener("click", () => closeDialog(cardDialog));
  cardDialog?.addEventListener("click", (event) => {
    if (event.target === cardDialog) closeDialog(cardDialog);
  });
  document.addEventListener("click", (event) => {
    if (momentLocationField && !momentLocationField.contains(event.target)) closeMomentPlaceResults();
    if (birthLocationField && !birthLocationField.contains(event.target)) closeBirthPlaceResults();
    document.querySelectorAll(".correspondence-warning[open]").forEach((warning) => {
      if (!warning.contains(event.target)) warning.removeAttribute("open");
    });
    document.querySelectorAll("[data-motion-explainer][aria-expanded='true']").forEach((button) => {
      if (!button.contains(event.target)) button.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll("[data-identity-explainer][aria-expanded='true']").forEach((button) => {
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
  minorCardIndex,
  numerologyFor,
  reduceNumber,
  signAndDecan,
  zonedDateToUtc,
};
