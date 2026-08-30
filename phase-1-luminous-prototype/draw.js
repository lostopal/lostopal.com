(() => {
  "use strict";

  const CARD_BASE = "./assets/tarot/1909-rws";
  const REVERSAL_NOTE = "Reversed, this current may be blocked, internalized, delayed, exaggerated, or asking for repair. Read it as a change in access—not an automatic opposite.";

  const MAJORS = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant",
    "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune", "Justice",
    "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower", "The Star",
    "The Moon", "The Sun", "Judgement", "The World",
  ];

  const SUITS = ["Wands", "Cups", "Swords", "Pentacles"];
  const RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
  const CARD_NAMES = [...MAJORS, ...SUITS.flatMap((suit) => RANKS.map((rank) => `${rank} of ${suit}`))];

  const HERMETIC_MAJOR_TITLES = [
    "The Spirit of Ether", "The Magus of Power", "The Priestess of the Silver Star", "The Daughter of the Mighty Ones",
    "Son of the Morning, Chief among the Mighty", "The Magus of the Eternal Gods",
    "Children of the Voice Divine, The Oracle of the Mighty Gods", "Child of the Powers of the Waters, Lord of the Triumph of Light",
    "Daughter of the Flaming Sword, Leader of the Lion", "Prophet of the Eternal, Magus of the Voice of Power",
    "The Lord of the Forces of Life", "Daughter of the Lords of Truth, Ruler of the Balance", "The Spirit of the Mighty Waters",
    "Child of the Great Transformers, Lord of the Gates of Death", "Daughter of the Reconcilers, Bringer-Forth of Life",
    "Lord of the Gates of Matter, Child of the Forces of Time", "The Lord of the Hosts of the Mighty",
    "Daughter of the Firmament, Dweller Between the Waters", "Ruler of Flux and Reflux, Child of the Sons of the Mighty",
    "The Lord of the Fire of the World", "The Spirit of the Primal Fire", "The Great One of the Night of Time",
  ];

  const HERMETIC_MINOR_TITLES = {
    Wands: [
      "Root of the Powers of Fire", "Lord of Dominion", "Lord of Established Strength", "Lord of Perfected Work", "Lord of Strife",
      "Lord of Victory", "Lord of Valour", "Lord of Swiftness", "Lord of Great Strength", "Lord of Oppression",
      "Princess of the Shining Flame, Rose of the Palace of Fire", "Lord of the Flame and Lightning, King of the Spirits of Fire",
      "Queen of the Thrones of Flame", "Prince of the Chariot of Fire",
    ],
    Cups: [
      "Root of the Powers of Water", "Lord of Love", "Lord of Abundance", "Lord of Blended Pleasure", "Lord of Loss in Pleasure",
      "Lord of Pleasure", "Lord of Illusionary Success", "Lord of Abandoned Success", "Lord of Material Happiness", "Lord of Perfected Success",
      "Princess of the Waters, Lotus of the Palace of the Floods", "Lord of the Waves and the Waters, King of the Hosts of the Sea",
      "Queen of the Thrones of the Waters", "Prince of the Chariot of the Waters",
    ],
    Swords: [
      "Root of the Powers of Air", "Lord of Peace Restored", "Lord of Sorrow", "Lord of Rest from Strife", "Lord of Defeat",
      "Lord of Earned Success", "Lord of Unstable Effort", "Lord of Shortened Force", "Lord of Despair and Cruelty", "Lord of Ruin",
      "Princess of the Rushing Winds, Lotus of the Palace of Air", "Lord of the Winds and the Breezes, King of the Spirits of Air",
      "Queen of the Thrones of Air", "Prince of the Chariot of the Winds",
    ],
    Pentacles: [
      "Root of the Powers of Earth", "Lord of Harmonious Change", "Lord of Material Works", "Lord of Earthly Power", "Lord of Material Trouble",
      "Lord of Material Success", "Lord of Success Unfulfilled", "Lord of Prudence", "Lord of Material Gain", "Lord of Wealth",
      "Princess of the Echoing Hills, Rose of the Palace of Earth", "Lord of the Wide and Fertile Land, King of the Spirits of Earth",
      "Queen of the Thrones of Earth", "Prince of the Chariot of Earth",
    ],
  };

  const MAJOR_MEANINGS = [
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

  const MAJOR_GROUND = [
    "Take one honest step without demanding the whole road in advance.", "Name what you can actually do, then use it deliberately.",
    "Make quiet long enough for the subtler answer to arrive.", "Nourish the condition that helps life grow.",
    "Build the boundary that makes the work dependable.", "Put one teaching into lived practice.",
    "Let the meaningful choice answer to your deepest value.", "Choose the direction and gather your forces behind it.",
    "Meet instinct firmly enough to guide it and gently enough to hear it.", "Carry one small light into the question you can only answer alone.",
    "Move with the turn instead of pretending nothing has changed.", "Restore proportion through one accountable action.",
    "Release forced movement and look again from the changed angle.", "Mourn what cannot be returned to, then pour your being into the sacred next moment.",
    "Blend slowly enough that neither truth is erased.", "Name the chain and locate the choice that still belongs to you.",
    "Let the revelation clear what cannot honestly remain.", "Follow the quiet signal that survives the storm.",
    "Check the facts that protect you while mystery is still moving.", "Participate openly in the life that is here.",
    "Answer the call with a life that can support it.", "Complete the circle before crossing its threshold.",
  ];

  const ELEMENTS = {
    Wands: { name: "Fire", glyph: "🜂", meaning: "will, spirit, appetite, courage, and creative action" },
    Cups: { name: "Water", glyph: "🜄", meaning: "feeling, intuition, relationship, memory, and receptivity" },
    Swords: { name: "Air", glyph: "🜁", meaning: "thought, language, truth, conflict, and discernment" },
    Pentacles: { name: "Earth", glyph: "🜃", meaning: "body, material life, resources, craft, and embodiment" },
  };

  const GLYPHS = {
    Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
    Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
  };

  const PLANET_MEANINGS = {
    Sun: "vitality, centered identity, illumination, and creative radiance", Moon: "instinct, memory, feeling, belonging, and responsive cycles",
    Mercury: "thought, language, exchange, perception, and adaptable movement", Venus: "attraction, value, relationship, beauty, and receptive creation",
    Mars: "desire, courage, conflict, severance, and decisive action", Jupiter: "expansion, meaning, faith, opportunity, wisdom, and the larger pattern",
    Saturn: "boundary, time, consequence, responsibility, endurance, and mastery", Uranus: "disruption, liberation, unprecedented possibility, and radical reorientation",
    Neptune: "vision, compassion, imagination, surrender, and the dissolving of boundaries", Pluto: "underworld truth, irreversible transformation, grief, power, and renewal",
  };

  const SIGN_MEANINGS = {
    Aries: "direct courage, ignition, sovereignty, and the right to begin", Taurus: "embodiment, value, continuity, and patient cultivation",
    Gemini: "choice, language, exchange, and the joining of perspectives", Cancer: "protection, belonging, memory, and emotionally guided movement",
    Leo: "radiance, creative heart, noble courage, and visible self-expression", Virgo: "discernment, service, repair, and devotion to useful craft",
    Libra: "relationship, proportion, reciprocity, and ethical balance", Scorpio: "truth beneath appearances, surrender, intimacy, and transformation",
    Sagittarius: "meaning, synthesis, pilgrimage, and the expansion of perspective", Capricorn: "structure, consequence, mastery, and material responsibility",
    Aquarius: "liberation, collective vision, originality, and future-minded truth", Pisces: "mystery, permeability, imagination, and spiritual feeling",
  };

  const NATURAL_HOUSES = {
    Aries: { number: 1, meaning: "identity, embodiment, initiative, and the manner of beginning" },
    Taurus: { number: 2, meaning: "values, resources, stability, the body, and what is sustained" },
    Gemini: { number: 3, meaning: "language, learning, exchange, siblings, and the immediate environment" },
    Cancer: { number: 4, meaning: "home, ancestry, belonging, memory, and the private foundation" },
    Leo: { number: 5, meaning: "creative expression, pleasure, play, romance, and what the heart brings forth" },
    Virgo: { number: 6, meaning: "daily practice, service, craft, maintenance, and useful refinement" },
    Libra: { number: 7, meaning: "partnership, encounter, reciprocity, agreements, and the significant other" },
    Scorpio: { number: 8, meaning: "shared power, intimacy, inheritance, loss, death, and transformation" },
    Sagittarius: { number: 9, meaning: "worldview, pilgrimage, higher learning, faith, and expanded understanding" },
    Capricorn: { number: 10, meaning: "vocation, public responsibility, authority, consequence, and visible achievement" },
    Aquarius: { number: 11, meaning: "community, friendship, networks, collective purpose, and future possibility" },
    Pisces: { number: 12, meaning: "solitude, surrender, dream, hidden material, compassion, and dissolution" },
  };

  const PLANET_RULERSHIPS = {
    Sun: ["Leo"],
    Moon: ["Cancer"],
    Mercury: ["Gemini", "Virgo"],
    Venus: ["Taurus", "Libra"],
    Mars: ["Aries", "Scorpio"],
    Jupiter: ["Sagittarius", "Pisces"],
    Saturn: ["Capricorn", "Aquarius"],
    Uranus: ["Aquarius"],
    Neptune: ["Pisces"],
    Pluto: ["Scorpio"],
  };

  const MAJOR_CORRESPONDENCES = [
    { element: "Air", planet: "Uranus" }, { element: "Air", planet: "Mercury" }, { element: "Water", planet: "Moon" },
    { element: "Earth", planet: "Venus" }, { element: "Fire", planet: "Mars", sign: "Aries" },
    { element: "Earth", planet: "Venus", sign: "Taurus" }, { element: "Air", planet: "Mercury", sign: "Gemini" },
    { element: "Water", planet: "Moon", sign: "Cancer" }, { element: "Fire", planet: "Sun", sign: "Leo" },
    { element: "Earth", planet: "Mercury", sign: "Virgo" }, { planet: "Jupiter" },
    { element: "Air", planet: "Venus", sign: "Libra" }, { element: "Water", planet: "Neptune" },
    { element: "Water", planet: "Mars · Pluto", sign: "Scorpio" }, { element: "Fire", planet: "Jupiter", sign: "Sagittarius" },
    { element: "Earth", planet: "Saturn", sign: "Capricorn" }, { element: "Fire", planet: "Mars" },
    { element: "Air", planet: "Saturn · Uranus", sign: "Aquarius" }, { element: "Water", planet: "Moon", sign: "Pisces" },
    { element: "Fire", planet: "Sun" }, { element: "Fire", planet: "Pluto" }, { element: "Earth", planet: "Saturn" },
  ];

  const DECANS = {
    "Two of Wands": ["Aries", "Mars", "1st Decan", "focuses raw fire into a chosen direction and asks will to become intentional", "Name the direction before spending the fire."],
    "Three of Wands": ["Aries", "Sun", "2nd Decan", "extends the first decision into foresight, cooperation, and purposeful expansion", "Act for the horizon, not only the immediate spark."],
    "Four of Wands": ["Aries", "Venus", "3rd Decan", "stabilizes fire through celebration, shared ground, and a completed first structure", "Acknowledge what is working before beginning again."],
    "Five of Pentacles": ["Taurus", "Mercury", "1st Decan", "reveals scarcity, instability, or the fear of losing what the body depends upon", "Separate an actual need from a fear of not having enough."],
    "Six of Pentacles": ["Taurus", "Moon", "2nd Decan", "restores circulation through fair exchange, support, and material reciprocity", "Give or receive in a way that preserves dignity."],
    "Seven of Pentacles": ["Taurus", "Saturn", "3rd Decan", "slows the harvest so effort, timing, and true value can be reassessed", "Inspect the roots before demanding fruit."],
    "Eight of Swords": ["Gemini", "Jupiter", "1st Decan", "shows energy narrowed by a mental frame, an assumption, or an incomplete view", "Test the rule that seems to leave you no choice."],
    "Nine of Swords": ["Gemini", "Mars", "2nd Decan", "amplifies thought until fear or self-judgment becomes louder than the evidence", "Bring the fear into daylight and verify what is actually true."],
    "Ten of Swords": ["Gemini", "Sun", "3rd Decan", "brings a mental story all the way into embodied finality: what has ended must be named before its blade can be reclaimed as truth, justice, and illumination", "Name what ended. Reach back for the blade without passing the wound onward."],
    "Two of Cups": ["Cancer", "Venus", "1st Decan", "opens mutual recognition, emotional honesty, and the possibility of true meeting", "Make one sincere exchange without performing around it."],
    "Three of Cups": ["Cancer", "Mercury", "2nd Decan", "lets feeling multiply through friendship, witness, and shared celebration", "Let supportive people participate in the good."],
    "Four of Cups": ["Cancer", "Moon", "3rd Decan", "pauses emotional movement so desire can be distinguished from habit or numbness", "Notice the invitation that boredom has hidden."],
    "Five of Wands": ["Leo", "Saturn", "1st Decan", "creates friction among competing impulses so strength and motive can be clarified", "Turn conflict into practice instead of spectacle."],
    "Six of Wands": ["Leo", "Jupiter", "2nd Decan", "makes earned confidence visible and allows effort to be recognized by the field", "Receive recognition without making it your identity."],
    "Seven of Wands": ["Leo", "Mars", "3rd Decan", "tests the courage to hold a meaningful position while pressure rises around it", "Protect the boundary that protects the work."],
    "Eight of Pentacles": ["Virgo", "Sun", "1st Decan", "grounds insight in repetition, apprenticeship, refinement, and skillful attention", "Choose one craft, system, or habit and improve it carefully."],
    "Nine of Pentacles": ["Virgo", "Venus", "2nd Decan", "ripens disciplined effort into competence, autonomy, and embodied sufficiency", "Enjoy what your steady labor has made possible."],
    "Ten of Pentacles": ["Virgo", "Mercury", "3rd Decan", "places material life inside lineage, inheritance, systems, and long-term stewardship", "Make one choice your future people can stand on."],
    "Two of Swords": ["Libra", "Moon", "1st Decan", "holds two truths in deliberate stillness until reaction gives way to clear proportion", "Pause long enough to hear both sides of the mind."],
    "Three of Swords": ["Libra", "Saturn", "2nd Decan", "names the clean pain of a truth that cannot be made painless by avoidance", "Let accuracy be kinder than denial."],
    "Four of Swords": ["Libra", "Jupiter", "3rd Decan", "withdraws the mind from conflict so perspective and nervous-system quiet can return", "Schedule the silence instead of waiting to collapse into it."],
    "Five of Cups": ["Scorpio", "Mars", "1st Decan", "lets grief tell the truth about attachment while reminding the heart that not everything is gone", "Honor the loss, then turn toward what remains alive."],
    "Six of Cups": ["Scorpio", "Sun", "2nd Decan", "returns feeling to memory, innocence, generosity, and the gifts carried forward from the past", "Receive the past as nourishment, not a place to live."],
    "Seven of Cups": ["Scorpio", "Venus", "3rd Decan", "multiplies images and desires until discernment is needed to separate vision from projection", "Choose the cup whose consequences you are willing to live."],
    "Eight of Wands": ["Sagittarius", "Mercury", "1st Decan", "releases concentrated fire into movement, messages, alignment, and rapid development", "Move promptly while the path is genuinely open."],
    "Nine of Wands": ["Sagittarius", "Moon", "2nd Decan", "gathers endurance at the threshold and protects what long effort has made possible", "Stand ready without treating every arrival as an attack."],
    "Ten of Wands": ["Sagittarius", "Saturn", "3rd Decan", "shows fire burdened by excess responsibility, overextension, or a mission carried alone", "Put down the load that was never truly yours."],
    "Two of Pentacles": ["Capricorn", "Jupiter", "1st Decan", "keeps material life responsive through rhythm, prioritization, and graceful adjustment", "Change the rhythm before adding another obligation."],
    "Three of Pentacles": ["Capricorn", "Mars", "2nd Decan", "builds competence through planning, collaboration, and respect for each contributor's craft", "Ask what quality requires from every person involved."],
    "Four of Pentacles": ["Capricorn", "Sun", "3rd Decan", "consolidates resources and boundaries while testing whether security has become control", "Protect what matters without closing the circulation."],
    "Five of Swords": ["Aquarius", "Venus", "1st Decan", "exposes the cost of winning through separation, humiliation, or a strategy that poisons the field", "Decide which argument is too expensive to win."],
    "Six of Swords": ["Aquarius", "Mercury", "2nd Decan", "uses sober understanding to cross away from turbulence toward a more workable mental shore", "Carry the lesson, not the entire wreckage."],
    "Seven of Swords": ["Aquarius", "Moon", "3rd Decan", "tests strategy, independence, and the hidden weakness created when a plan lacks integrity", "Make the clever plan answer to the whole truth."],
    "Eight of Cups": ["Pisces", "Saturn", "1st Decan", "walks beyond an emotionally complete form because the soul can no longer pretend completion is fulfillment", "Leave respectfully when the deeper call is unmistakable."],
    "Nine of Cups": ["Pisces", "Jupiter", "2nd Decan", "fills the emotional vessel with satisfaction, pleasure, gratitude, and the test of enoughness", "Let contentment be felt before asking for more."],
    "Ten of Cups": ["Pisces", "Mars", "3rd Decan", "widens private feeling into belonging, shared joy, and an image of emotional wholeness", "Contribute to the belonging you want to experience."],
  };

  const RANK_MEANINGS = {
    Ace: ["holds the undivided root of its element: a beginning that has power before it has a finished form", "Make room for the pure current before deciding what it must become."],
    Page: ["brings the element into first embodiment through curiosity, study, message, and apprenticeship", "Approach this as a student willing to touch the work directly."],
    Knight: ["sets the element in pursuit: movement, appetite, risk, and the test of how force is directed", "Give the movement a destination before it becomes momentum alone."],
    Queen: ["matures the element inwardly through receptivity, discernment, relationship, and embodied command", "Hold the field steadily enough for its deeper intelligence to speak."],
    King: ["matures the element outwardly through direction, stewardship, consequence, and visible responsibility", "Lead this current without confusing command with control."],
  };

  const COURT_DECAN_SPANS = {
    "Knight of Wands": ["Scorpio", "Sagittarius", "20° Scorpio–20° Sagittarius"],
    "Queen of Wands": ["Pisces", "Aries", "20° Pisces–20° Aries"],
    "King of Wands": ["Cancer", "Leo", "20° Cancer–20° Leo"],
    "Knight of Cups": ["Aquarius", "Pisces", "20° Aquarius–20° Pisces"],
    "Queen of Cups": ["Gemini", "Cancer", "20° Gemini–20° Cancer"],
    "King of Cups": ["Libra", "Scorpio", "20° Libra–20° Scorpio"],
    "Knight of Swords": ["Taurus", "Gemini", "20° Taurus–20° Gemini"],
    "Queen of Swords": ["Virgo", "Libra", "20° Virgo–20° Libra"],
    "King of Swords": ["Capricorn", "Aquarius", "20° Capricorn–20° Aquarius"],
    "Knight of Pentacles": ["Leo", "Virgo", "20° Leo–20° Virgo"],
    "Queen of Pentacles": ["Sagittarius", "Capricorn", "20° Sagittarius–20° Capricorn"],
    "King of Pentacles": ["Aries", "Taurus", "20° Aries–20° Taurus"],
  };

  const ELEMENTAL_QUARTERS = {
    Wands: "Cancer · Leo · Virgo",
    Cups: "Libra · Scorpio · Sagittarius",
    Swords: "Capricorn · Aquarius · Pisces",
    Pentacles: "Aries · Taurus · Gemini",
  };

  const ELEMENTAL_QUARTER_SIGNS = {
    Wands: ["Cancer", "Leo", "Virgo"],
    Cups: ["Libra", "Scorpio", "Sagittarius"],
    Swords: ["Capricorn", "Aquarius", "Pisces"],
    Pentacles: ["Aries", "Taurus", "Gemini"],
  };

  const SPREADS = {
    one: {
      title: "One-Card Reading",
      positions: [{ name: "Card 1" }],
    },
    three: {
      title: "Three-Card Reading",
      positions: [
        { name: "Card 1" },
        { name: "Card 2" },
        { name: "Card 3" },
      ],
    },
    elm: {
      title: "Seven-Card ELM Reading",
      positions: [
        { name: "Spirit" },
        { name: "Water" },
        { name: "Fire" },
        { name: "Air" },
        { name: "Earth" },
        { name: "Action in the Now" },
        { name: "Potential Outcome to Test" },
      ],
    },
    celtic: {
      title: "Celtic Cross Reading",
      positions: [
        { name: "The Situation", lens: "The central condition or living question at the heart of this reading." },
        { name: "The Challenge", lens: "The crossing force: support, friction, contradiction, or the demand that changes how the situation can be met." },
        { name: "The Focus", lens: "What the conscious mind is holding above the situation—its aim, ideal, story, or visible concern." },
        { name: "The Recent Past", lens: "The influence receding behind the question while still shaping its present form." },
        { name: "The Possibilities", lens: "The root beneath the situation and the potential seeking recognition below the obvious story." },
        { name: "The Near Future", lens: "The next condition likely to enter if the current pattern continues; an approach, not a sentence." },
        { name: "The Self", lens: "How the seeker is participating in, carrying, or understanding the situation." },
        { name: "The Environment", lens: "The field around the seeker: other people, available support, pressure, and conditions not held alone." },
        { name: "Hopes & Fears", lens: "The desire and anxiety braided around the outcome, often revealing one another." },
        { name: "The Outcome", lens: "The direction in which the full pattern presently gathers. It remains responsive to choice, action, and changing conditions." },
      ],
    },
  };

  const spreadArea = document.querySelector("[data-spread-area]");
  const readingCards = document.querySelector("[data-reading-cards]");
  const cardLegend = document.querySelector("[data-card-legend]");
  const spreadTitle = document.querySelector("[data-spread-title]");
  const status = document.querySelector("[data-draw-status]");
  const dialog = document.querySelector("[data-card-dialog]");
  const spreadNav = document.querySelector("[data-spread-nav]");
  const spreadStatus = document.querySelector("[data-spread-status]");
  if (!spreadArea || !readingCards || !cardLegend || !spreadTitle || !dialog) return;

  let currentSpread = "three";
  let reversalsEnabled = true;
  let currentCards = [];
  let dialogIndex = 0;
  let spreadScrollFrame = 0;

  function roman(value) {
    if (value === 0) return "0";
    const pairs = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let result = "";
    let remaining = value;
    pairs.forEach(([number, glyph]) => {
      while (remaining >= number) { result += glyph; remaining -= number; }
    });
    return result;
  }

  function imagePath(index) { return `${CARD_BASE}/${String(index).padStart(2, "0")}.webp`; }

  function cardMeta(index) {
    if (index < 22) {
      return {
        index,
        name: CARD_NAMES[index],
        kind: "Major Arcana",
        key: roman(index),
        hermetic: HERMETIC_MAJOR_TITLES[index],
        meaning: MAJOR_MEANINGS[index],
        ground: MAJOR_GROUND[index],
        major: true,
      };
    }
    const relative = index - 22;
    const suit = SUITS[Math.floor(relative / 14)];
    const rankIndex = relative % 14;
    const rank = RANKS[rankIndex];
    const name = CARD_NAMES[index];
    const decan = DECANS[name];
    const rankCopy = RANK_MEANINGS[rank];
    return {
      index,
      name,
      kind: `${suit} · Minor Arcana`,
      suit,
      rank,
      rankIndex,
      hermetic: HERMETIC_MINOR_TITLES[suit][rankIndex],
      meaning: decan ? `${name} ${decan[3]}.` : `${name} ${rankCopy[0]} within the field of ${ELEMENTS[suit].meaning}.`,
      ground: decan ? decan[4] : rankCopy[1],
      decan,
      major: false,
    };
  }

  function tile(label, value, glyph, tooltip) {
    const item = document.createElement("div");
    item.className = "draw-correspondence";
    item.tabIndex = 0;
    item.dataset.tooltip = tooltip;
    item.setAttribute("aria-label", `${label}: ${value}. ${tooltip}`);
    item.innerHTML = `<span class="draw-correspondence__glyph" aria-hidden="true">${glyph}</span><span class="draw-correspondence__copy"><small>${label}</small><strong>${value}</strong></span>`;
    return item;
  }

  function ordinalHouse(number) {
    if (number >= 11 && number <= 13) return `${number}th`;
    return `${number}${({ 1: "st", 2: "nd", 3: "rd" })[number % 10] || "th"}`;
  }

  function ruledSigns(planetText = "") {
    const signs = planetText
      .split(" · ")
      .flatMap((planet) => PLANET_RULERSHIPS[planet] || []);
    return [...new Set(signs)];
  }

  function naturalPlacement(meta) {
    if (meta.major) {
      const corr = MAJOR_CORRESPONDENCES[meta.index];
      const signs = corr.sign ? [corr.sign] : ruledSigns(corr.planet);
      const decanDescription = corr.sign
        ? `${meta.name} carries the first through third decans of ${corr.sign}.`
        : `${meta.name}, through ${corr.planet}, carries the first through third decans of ${signs.join(" and ")}.`;
      return { signs, decanDescription };
    }

    if (meta.decan) {
      const [sign, , decan] = meta.decan;
      return { signs: [sign], decanDescription: `${meta.name} belongs to the ${decan.toLowerCase()} of ${sign}.` };
    }

    const span = COURT_DECAN_SPANS[meta.name];
    if (span) {
      const [fromSign, toSign, degrees] = span;
      return {
        signs: [fromSign, toSign],
        decanDescription: `${meta.name} spans ${degrees}: the third decan of ${fromSign} and the first two decans of ${toSign}.`,
      };
    }

    const signs = ELEMENTAL_QUARTER_SIGNS[meta.suit];
    return {
      signs,
      decanDescription: `${meta.name} carries the elemental quarter spanning ${signs.join(", ")}.`,
    };
  }

  function naturalHouseTile(meta) {
    const placement = naturalPlacement(meta);
    const houses = placement.signs.map((sign) => ({ sign, ...NATURAL_HOUSES[sign] }));
    const numbers = houses.map((house) => house.number);
    const consecutive = numbers.every((number, index) => index === 0 || number === numbers[index - 1] + 1);
    const value = houses.length === 1
      ? `${ordinalHouse(numbers[0])} House`
      : consecutive
        ? `${ordinalHouse(numbers[0])}–${ordinalHouse(numbers.at(-1))} Houses`
        : `${numbers.map(ordinalHouse).join(" & ")} Houses`;
    const meanings = houses
      .map((house) => `${ordinalHouse(house.number)} House (${house.sign}): ${house.meaning}`)
      .join("; ");
    const tooltip = `${placement.decanDescription} On the simple Aries-first natural wheel used for this un-timed Draw, that places it in the ${value}: ${meanings}.`;
    return tile("House", value, "⌂", tooltip);
  }

  function correspondenceNodes(meta) {
    const nodes = [];
    if (meta.major) {
      const corr = MAJOR_CORRESPONDENCES[meta.index];
      nodes.push(tile("Tarot Key", meta.key, meta.key, `Key ${meta.key} of the Major Arcana.`));
      if (corr.element) nodes.push(tile("Element", corr.element, ELEMENTS[Object.keys(ELEMENTS).find((suit) => ELEMENTS[suit].name === corr.element)]?.glyph || "✦", `${corr.element} carries ${corr.element.toLowerCase()} through this key.`));
      if (corr.planet) {
        const firstPlanet = corr.planet.split(" · ")[0];
        nodes.push(tile("Planet", corr.planet, GLYPHS[firstPlanet] || "✦", corr.planet.split(" · ").map((planet) => PLANET_MEANINGS[planet] || planet).join("; ")));
      }
      if (corr.sign) {
        nodes.push(tile("Zodiac", corr.sign, GLYPHS[corr.sign], SIGN_MEANINGS[corr.sign]));
        nodes.push(tile("Decanic Field", `All 3 · ${corr.sign}`, GLYPHS[corr.sign], `${meta.name} carries the full zodiacal field of ${corr.sign}, including all three of its decans.`));
      } else {
        const planetName = corr.planet?.split(" · ")[0];
        const signs = ruledSigns(corr.planet);
        nodes.push(tile("Decanic Reach", `1st–3rd · ${signs.join(" + ")}`, GLYPHS[planetName] || "✦", `${meta.name} carries all three decans of ${signs.join(" and ")} through ${corr.planet}.`));
      }
    } else {
      const element = ELEMENTS[meta.suit];
      nodes.push(tile("Element", element.name, element.glyph, element.meaning));
      if (meta.decan) {
        const [sign, planet, decan] = meta.decan;
        nodes.push(tile("Planet", planet, GLYPHS[planet], PLANET_MEANINGS[planet]));
        nodes.push(tile("Zodiac", sign, GLYPHS[sign], SIGN_MEANINGS[sign]));
        nodes.push(tile("Default Decan", `${decan} · ${sign}`, decan.replace(" Decan", ""), `${meta.name} is the fixed Golden Dawn card of the ${decan.toLowerCase()} of ${sign}; this ten-degree face is ruled by ${planet}.`));
      } else {
        nodes.push(tile("Court / Root", meta.rank, meta.rank === "Ace" ? "I" : "♙", `${meta.rank} expresses the ${meta.suit} current through its own stage of embodiment.`));
        if (COURT_DECAN_SPANS[meta.name]) {
          const [fromSign, toSign, span] = COURT_DECAN_SPANS[meta.name];
          nodes.push(tile("Decanic Span", "Three Decans", "↔", `${meta.name} spans ${span}: the final decan of ${fromSign} and the first two decans of ${toSign}.`));
        } else {
          nodes.push(tile("Decanic Field", "Elemental Quarter", element.glyph, `${meta.name} belongs to the ${meta.suit} elemental quarter touching ${ELEMENTAL_QUARTERS[meta.suit]}, rather than to one numbered-minor decan.`));
        }
      }
    }
    nodes.push(naturalHouseTile(meta));
    return nodes;
  }

  function drawUnique(count) {
    const pool = Array.from({ length: CARD_NAMES.length }, (_, index) => index);
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count).map((index) => ({ index, reversed: reversalsEnabled && Math.random() < 0.5 }));
  }

  function cardButton(card, position, order) {
    const meta = cardMeta(card.index);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "draw-card";
    button.setAttribute("aria-label", `Open ${meta.name}${card.reversed ? ", reversed" : ""}, ${position.name}`);
    const pointLabel = currentSpread === "elm" || currentSpread === "celtic" ? `<small class="draw-card__point">${position.name}</small>` : "";
    button.innerHTML = `<span class="draw-card__frame"><img src="${imagePath(card.index)}" alt="${meta.name}${card.reversed ? ", reversed" : ""}" width="240" height="400" loading="eager" decoding="async" class="${card.reversed ? "is-reversed" : ""}"><span class="draw-card__number">${order + 1}</span></span><span class="draw-card__label">${pointLabel}<b>${meta.name}</b><small>${card.reversed ? "Reversed" : "Upright"}</small></span>`;
    button.addEventListener("click", () => openDialog(card, position, order));
    return button;
  }

  function readingArticle(card, position, order) {
    const meta = cardMeta(card.index);
    const article = document.createElement("article");
    article.className = "draw-reading-card";
    article.id = `draw-card-${order + 1}`;

    const art = document.createElement("div");
    art.className = "draw-reading-card__art";
    const artButton = document.createElement("button");
    artButton.type = "button";
    artButton.setAttribute("aria-label", `Enlarge ${meta.name}${card.reversed ? ", reversed" : ""}`);
    artButton.innerHTML = `<img src="${imagePath(card.index)}" alt="${meta.name}${card.reversed ? ", reversed" : ""}" width="300" height="500" loading="lazy" decoding="async" class="${card.reversed ? "is-reversed" : ""}">`;
    artButton.addEventListener("click", () => openDialog(card, position, order));
    art.append(artButton);

    const copy = document.createElement("div");
    copy.className = "draw-reading-card__copy";
    const positionLens = position.lens ? `<p class="draw-reading-card__lens"><strong>In this position:</strong> ${position.lens}</p>` : "";
    copy.innerHTML = `
      <p class="draw-reading-card__position"><b>${order + 1}</b><span>${position.name} · ${card.reversed ? "Reversed" : "Upright"}</span></p>
      <h3>${meta.name}</h3>
      <p class="draw-reading-card__hermetic">${meta.hermetic}</p>
      ${positionLens}
      <p class="draw-reading-card__meaning">${meta.meaning}</p>
      ${card.reversed ? `<p class="draw-reading-card__reversal"><strong>Reversal:</strong> ${REVERSAL_NOTE}</p>` : ""}
    `;
    const correspondences = document.createElement("div");
    correspondences.className = "draw-correspondences";
    correspondenceNodes(meta).forEach((node) => correspondences.append(node));
    copy.append(correspondences);
    const ground = document.createElement("p");
    ground.className = "draw-reading-card__ground";
    ground.innerHTML = `<strong>Ground it:</strong> ${meta.ground}`;
    copy.append(ground);

    article.append(art, copy);
    return article;
  }

  function openDialog(card, position, order) {
    const meta = cardMeta(card.index);
    dialogIndex = order;
    const image = dialog.querySelector("[data-dialog-image]");
    image.src = imagePath(card.index);
    image.alt = `${meta.name}${card.reversed ? ", reversed" : ""}`;
    image.classList.toggle("is-reversed", card.reversed);
    dialog.querySelector("[data-dialog-position]").textContent = `${position.name} · ${card.reversed ? "Reversed" : "Upright"}`;
    dialog.querySelector("[data-dialog-name]").textContent = meta.name;
    dialog.querySelector("[data-dialog-hermetic]").textContent = meta.hermetic;
    dialog.querySelector("[data-dialog-meaning]").textContent = meta.meaning;
    dialog.querySelector("[data-dialog-orientation]").textContent = card.reversed ? REVERSAL_NOTE : "Upright, this current is available in its direct or recognizable expression.";
    dialog.querySelector("[data-dialog-ground]").textContent = `Ground it: ${meta.ground}`;
    const corr = dialog.querySelector("[data-dialog-correspondences]");
    corr.replaceChildren(...correspondenceNodes(meta));
    const dialogStatus = dialog.querySelector("[data-dialog-status]");
    if (dialogStatus) dialogStatus.textContent = `Card ${order + 1} of ${currentCards.length}`;
    const dialogPrev = dialog.querySelector("[data-dialog-prev]");
    const dialogNext = dialog.querySelector("[data-dialog-next]");
    if (dialogPrev) dialogPrev.disabled = currentCards.length < 2;
    if (dialogNext) dialogNext.disabled = currentCards.length < 2;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  function updateSpreadNavigation() {
    spreadScrollFrame = 0;
    if (!spreadNav || !spreadStatus) return;
    const cards = [...spreadArea.querySelectorAll(".draw-card")];
    const maxScroll = Math.max(0, spreadArea.scrollWidth - spreadArea.clientWidth);
    const canScroll = maxScroll > 4;
    spreadNav.hidden = !canScroll;
    if (!canScroll || !cards.length) return;

    const gap = parseFloat(getComputedStyle(spreadArea).columnGap) || 0;
    const step = cards[0].getBoundingClientRect().width + gap;
    const visibleCount = Math.max(1, Math.floor((spreadArea.clientWidth + gap) / step));
    const first = Math.min(cards.length - 1, Math.max(0, Math.round(spreadArea.scrollLeft / step)));
    const last = Math.min(cards.length - 1, first + visibleCount - 1);
    spreadStatus.textContent = first === last
      ? `Card ${first + 1} of ${cards.length}`
      : `Cards ${first + 1}–${last + 1} of ${cards.length}`;
    const previous = spreadNav.querySelector("[data-spread-prev]");
    const next = spreadNav.querySelector("[data-spread-next]");
    if (previous) previous.disabled = spreadArea.scrollLeft <= 2;
    if (next) next.disabled = spreadArea.scrollLeft >= maxScroll - 2;
  }

  function moveSpread(direction) {
    const card = spreadArea.querySelector(".draw-card");
    if (!card) return;
    const gap = parseFloat(getComputedStyle(spreadArea).columnGap) || 0;
    spreadArea.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  function render() {
    const spread = SPREADS[currentSpread];
    spreadTitle.textContent = spread.title;
    spreadArea.dataset.layout = currentSpread;
    spreadArea.style.setProperty("--draw-count", Math.min(spread.positions.length, 3));
    spreadArea.replaceChildren();
    cardLegend.replaceChildren();
    readingCards.replaceChildren();

    currentCards.forEach((card, index) => {
      const position = spread.positions[index];
      const meta = cardMeta(card.index);
      spreadArea.append(cardButton(card, position, index));
      const legendItem = document.createElement("li");
      const namedPoint = currentSpread === "elm" || currentSpread === "celtic" ? `${position.name}: ` : "";
      legendItem.innerHTML = `<b>${index + 1}</b> ${namedPoint}${meta.name}`;
      cardLegend.append(legendItem);
      readingCards.append(readingArticle(card, position, index));
      if (!meta) return;
    });
    spreadArea.scrollLeft = 0;
    requestAnimationFrame(updateSpreadNavigation);
  }

  function redraw(announce = true) {
    const spread = SPREADS[currentSpread];
    currentCards = drawUnique(spread.positions.length);
    render();
    if (announce) status.textContent = `${spread.title} drawn. ${spread.positions.length} card${spread.positions.length === 1 ? "" : "s"} are ready below.`;
  }

  document.querySelectorAll("[data-spread]").forEach((button) => {
    button.addEventListener("click", () => {
      currentSpread = button.dataset.spread;
      document.querySelectorAll("[data-spread]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
      redraw();
    });
  });

  document.querySelector("[data-reversals]")?.addEventListener("click", (event) => {
    reversalsEnabled = !reversalsEnabled;
    event.currentTarget.setAttribute("aria-pressed", String(reversalsEnabled));
    event.currentTarget.innerHTML = `<span>↕</span> Reversals ${reversalsEnabled ? "On" : "Off"}`;
    status.textContent = `Reversals are ${reversalsEnabled ? "on" : "off"}. Draw again when you are ready.`;
  });
  document.querySelector("[data-redraw]")?.addEventListener("click", () => redraw());
  document.querySelector("[data-print]")?.addEventListener("click", () => window.print());
  document.querySelector("[data-dialog-close]")?.addEventListener("click", () => dialog.close());
  document.querySelector("[data-spread-prev]")?.addEventListener("click", () => moveSpread(-1));
  document.querySelector("[data-spread-next]")?.addEventListener("click", () => moveSpread(1));
  dialog.querySelector("[data-dialog-prev]")?.addEventListener("click", () => {
    const nextIndex = (dialogIndex - 1 + currentCards.length) % currentCards.length;
    openDialog(currentCards[nextIndex], SPREADS[currentSpread].positions[nextIndex], nextIndex);
  });
  dialog.querySelector("[data-dialog-next]")?.addEventListener("click", () => {
    const nextIndex = (dialogIndex + 1) % currentCards.length;
    openDialog(currentCards[nextIndex], SPREADS[currentSpread].positions[nextIndex], nextIndex);
  });
  spreadArea.addEventListener("scroll", () => {
    if (!spreadScrollFrame) spreadScrollFrame = requestAnimationFrame(updateSpreadNavigation);
  }, { passive: true });
  window.addEventListener("resize", () => {
    if (!spreadScrollFrame) spreadScrollFrame = requestAnimationFrame(updateSpreadNavigation);
  }, { passive: true });
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });

  redraw(false);
  status.textContent = "A three-card reading is ready. Select a card or begin walking the story below.";
})();
