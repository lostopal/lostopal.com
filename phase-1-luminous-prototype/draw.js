(() => {
  "use strict";

  const CARD_BASE = "./assets/tarot/1909-rws-draw";
  const DRAW_STORAGE_KEY = "lost-opal-draw-spreads-v1";
  const TOOLTIP_VIEWPORT_GUTTER = 12;

  let tooltipSequence = 0;
  let activeTooltipTrigger = null;
  let tooltipPositionFrame = 0;

  function tooltipElement(trigger) {
    return trigger?.querySelector(":scope > .draw-floating-tooltip") || null;
  }

  function positionFloatingTooltip(trigger) {
    const tooltip = tooltipElement(trigger);
    if (!tooltip || trigger.getAttribute("aria-expanded") !== "true") return;

    const visualViewport = window.visualViewport;
    const viewportLeft = visualViewport?.offsetLeft || 0;
    const viewportTop = visualViewport?.offsetTop || 0;
    const viewportWidth = visualViewport?.width || window.innerWidth;
    const viewportHeight = visualViewport?.height || window.innerHeight;
    const triggerBounds = trigger.getBoundingClientRect();

    tooltip.style.left = `${viewportLeft + TOOLTIP_VIEWPORT_GUTTER}px`;
    tooltip.style.top = `${viewportTop + TOOLTIP_VIEWPORT_GUTTER}px`;

    const tooltipBounds = tooltip.getBoundingClientRect();
    const maximumLeft = viewportLeft + viewportWidth - tooltipBounds.width - TOOLTIP_VIEWPORT_GUTTER;
    const centeredLeft = triggerBounds.left + ((triggerBounds.width - tooltipBounds.width) / 2);
    const left = Math.max(
      viewportLeft + TOOLTIP_VIEWPORT_GUTTER,
      Math.min(centeredLeft, maximumLeft),
    );

    const gap = 10;
    const above = triggerBounds.top - tooltipBounds.height - gap;
    const below = triggerBounds.bottom + gap;
    const maximumTop = viewportTop + viewportHeight - tooltipBounds.height - TOOLTIP_VIEWPORT_GUTTER;
    const preferredTop = above >= viewportTop + TOOLTIP_VIEWPORT_GUTTER ? above : below;
    const top = Math.max(
      viewportTop + TOOLTIP_VIEWPORT_GUTTER,
      Math.min(preferredTop, maximumTop),
    );

    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
  }

  function scheduleTooltipPosition(trigger = activeTooltipTrigger) {
    if (!trigger) return;
    cancelAnimationFrame(tooltipPositionFrame);
    tooltipPositionFrame = requestAnimationFrame(() => {
      tooltipPositionFrame = 0;
      positionFloatingTooltip(trigger);
    });
  }

  function closeFloatingTooltip(trigger = activeTooltipTrigger) {
    if (!trigger) return;
    trigger.setAttribute("aria-expanded", "false");
    if (activeTooltipTrigger === trigger) activeTooltipTrigger = null;
  }

  function openFloatingTooltip(trigger) {
    if (!trigger) return;
    if (activeTooltipTrigger && activeTooltipTrigger !== trigger) closeFloatingTooltip(activeTooltipTrigger);
    activeTooltipTrigger = trigger;
    trigger.setAttribute("aria-expanded", "true");
    scheduleTooltipPosition(trigger);
  }

  function prepareFloatingTooltip(trigger, tooltip) {
    if (!trigger || !tooltip) return;
    trigger.dataset.tooltipTrigger = "";
    trigger.setAttribute("aria-expanded", "false");
    tooltip.classList.add("draw-floating-tooltip");

    trigger.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") openFloatingTooltip(trigger);
    });
    trigger.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse" && document.activeElement !== trigger) closeFloatingTooltip(trigger);
    });
    trigger.addEventListener("focus", () => openFloatingTooltip(trigger));
    trigger.addEventListener("blur", () => closeFloatingTooltip(trigger));
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      openFloatingTooltip(trigger);
    });
    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeFloatingTooltip(trigger);
      trigger.blur();
    });
  }

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

  /* Card-specific ill-dignified/reversed currents, written for Lost Opal from
     the Golden Dawn / Book T interpretive field used by the Hermetic Tarot. */
  const REVERSED_MEANINGS = [
    // Major Arcana
    "A leap is being taken without presence, preparation, or regard for consequence; freedom has become drift, folly, or refusal to begin consciously.",
    "Will is scattered, misdirected, or used to manipulate; real skill is present, but it is being withheld, performed, or turned against its own purpose.",
    "Inner knowing is obscured by secrecy, passivity, or untested projection; what is hidden needs patient discernment rather than a forced revelation.",
    "Nourishment has become smothering, depletion, stagnation, or dependence; creation cannot flourish while the body and its limits are being ignored.",
    "Structure has hardened into domination, rigidity, or brittle control; authority is being overused, avoided, or defended after it has stopped serving life.",
    "Teaching has become dogma, empty conformity, or counsel without lived integrity; the tradition must be questioned without discarding the wisdom it may still hold.",
    "Attraction and choice are out of alignment; avoidance, division, or an entanglement without shared values is keeping the heart from making an honest decision.",
    "Direction is stalled by divided will, aggression, or loss of control; forcing movement now would scatter the very powers that need to be brought into accord.",
    "Courage has turned into coercion, suppressed anger, or self-doubt; instinct must be met without either crushing it or surrendering authority to it.",
    "Solitude has become isolation, concealment, or refusal of wise counsel; the lamp is dimmed when withdrawal no longer leads to honest self-knowledge.",
    "A cycle is being resisted or repeated without learning; unstable timing, reversals of fortune, or a refusal to adapt keeps the wheel turning in place.",
    "Balance is distorted by bias, evaded accountability, or consequences deferred; integrity returns only when the unequal measure is named plainly.",
    "Suspension has become paralysis, martyrdom, or sacrifice without purpose; the changed perspective cannot arrive while release is being performed instead of lived.",
    "An ending is being resisted, prolonged, or repeatedly reopened; transformation cannot complete while the former shape is treated as recoverable.",
    "The mixture has lost proportion through excess, haste, or incompatible forces; healing asks for patient correction before further blending.",
    "Bondage is being denied, deepened, or used for control; appetite, fear, or material power has narrowed the visible field of choice.",
    "A necessary revelation is delayed, internalized, or fought until disruption becomes harsher; the unstable structure is still asking to be released.",
    "Hope is dimmed by discouragement, exposure, or disconnection from the guiding thread; renewal begins by protecting the smallest honest light that remains.",
    "Uncertainty has thickened into fear, deception, fantasy, or projection; hidden facts and inherited anxieties must be separated before intuition can be trusted.",
    "Vitality is obscured by burnout, overexposure, pride, or joy that cannot be received; the light is present but its warmth is not reaching the life beneath it.",
    "The call is being avoided through self-condemnation, denial, or fear of reckoning; awakening remains possible once the past is answered without becoming a prison.",
    "Completion is delayed by fragmentation, loose ends, or refusal to cross the threshold; the world cannot close cleanly until its final responsibility is met.",

    // Wands
    "The first fire is blocked, misdirected, or spent before it can take form; a false start, creative drought, or burnout asks the will to find a truer source.",
    "Dominion has become restlessness, obstinacy, or fear of expansion; the chosen direction lacks either a real decision or the courage to act upon it.",
    "Foresight is compromised by delay, poor coordination, or confidence without preparation; the horizon cannot answer a plan that has not been made workable.",
    "The structure of celebration is unstable; conflict at home, interrupted completion, or belonging made conditional weakens the ground that should support joy.",
    "Strife has lost its clarifying purpose and become bullying, chaos, or suppressed resentment; competition is consuming more fire than it develops.",
    "Victory is hollowed by pride, failed recognition, or reputation pursued instead of earned; applause cannot repair a center that no longer trusts its own work.",
    "Valour has become exhaustion, defensiveness, or surrender under pressure; the position must be tested for meaning before more energy is spent defending it.",
    "Swiftness is interrupted by delay, crossed messages, or scattered movement; haste without alignment sends the fire in too many directions at once.",
    "Great strength has tightened into fatigue, suspicion, or permanent readiness for attack; endurance now requires recovery and a more accurate reading of danger.",
    "Oppression has reached overload, collapse, or responsibility carried for the wrong reasons; the burden must be redistributed before purpose is crushed beneath it.",
    "The young fire is volatile, unreliable, or hungry for spectacle; enthusiasm needs discipline before it can carry a message or begin a trustworthy work.",
    "Flame has become reckless speed, aggression, or departure without accountability; boldness is outrunning judgment and leaving avoidable damage behind it.",
    "Passion has become jealousy, domination, or theatrical confidence masking depletion; warmth returns when power no longer needs to control the room.",
    "Command has hardened into intolerance, impulsive rule, or ambition without stewardship; the fire needs vision broad enough to include consequence.",

    // Cups
    "The well of feeling is blocked, emptied, or refused; love and intuition cannot circulate while grief, numbness, or self-protection seals the vessel.",
    "Mutual recognition is distorted by imbalance, rupture, false intimacy, or unequal exchange; relationship must return to consent and honest reciprocity.",
    "Abundance has tipped into excess, gossip, exclusion, or celebration without depth; the circle needs truth more than another performance of togetherness.",
    "Pleasure has gone stale through apathy, withdrawal, or restless dissatisfaction; the missed invitation cannot be seen while attention remains fixed on what fails to move it.",
    "Loss has become fixation, regret, or refusal to turn toward what remains; grief needs witness, but it cannot be allowed to erase every surviving cup.",
    "Memory has become idealization, childishness, or retreat into a past that cannot hold the present; the gift must be carried forward rather than used as a hiding place.",
    "Images and desires have thickened into escapism, projection, or choice paralysis; discernment begins by naming the consequence attached to each cup.",
    "Departure is delayed, reversed, or undertaken without a true destination; what has been outgrown keeps reclaiming attention because the deeper reason for leaving is unfinished.",
    "Satisfaction has become indulgence, vanity, or the discovery that a granted wish cannot feed the whole self; pleasure needs gratitude and proportion.",
    "Perfected happiness is fractured by family conflict, broken belonging, or an ideal that leaves real people unseen; harmony must be rebuilt through truthful participation.",
    "The young heart is caught in fantasy, emotional immaturity, or a message it cannot yet deliver honestly; sensitivity needs boundaries and grounded language.",
    "The offered cup conceals moodiness, seduction, or a promise untethered from action; beauty is not proof of sincerity.",
    "Receptivity has become porousness, martyrdom, emotional manipulation, or loss of self in another's weather; compassion needs a vessel strong enough to contain it.",
    "Emotional command has turned into suppression, volatility, or control through feeling; maturity requires honest affect rather than a perfectly managed surface.",

    // Swords
    "The blade of truth is clouded, weaponized, or severed from clear purpose; a new idea cannot serve while confusion or harmful speech controls its edge.",
    "Peace is maintained through denial, hardened indecision, or a choice postponed until it becomes coercive; the blindfold must come off before balance can return.",
    "Sorrow is being avoided, prolonged, or converted into resentment; pain needs accurate language so it can move instead of governing from concealment.",
    "Rest is refused or has failed to restore; agitation, burnout, or premature return to conflict keeps the mind from receiving the silence it needs.",
    "Defeat has become revenge, humiliation, or a hollow victory no one can inhabit; the cost of continuing the contest now exceeds anything it could win.",
    "The crossing is resisted by fear, unresolved baggage, or return to familiar turbulence; understanding the lesson is necessary before a calmer shore can be reached.",
    "Strategy has collapsed into deception, self-deception, exposure, or escape without responsibility; what was taken or concealed is asking to be named.",
    "Shortened force has tightened into panic, helplessness, or a mental rule mistaken for fact; the first freedom is testing the boundary that appears absolute.",
    "Despair is amplified by secrecy, shame, or thought circling without evidence; the fear must be spoken, checked, and brought back into the scale of the present.",
    "Ruin is being repeated, resisted, or treated as proof that recovery is impossible; the ending has already happened, but its meaning is still being allowed to wound.",
    "The young mind is scattered into gossip, suspicion, dishonesty, or constant vigilance; curiosity needs evidence and a responsibility for the words it releases.",
    "Thought has become aggression, cruelty, or speed without reflection; a sharp conclusion is charging ahead of the truth it claims to defend.",
    "Discernment has hardened into bitterness, isolation, or merciless judgment; clarity loses authority when it cannot distinguish boundary from punishment.",
    "Reason is being used to dominate, deceive, or impose a cold private law; intellectual power must answer to ethics before it can lead.",

    // Pentacles
    "Material potential is missed, withheld, or planted in unstable ground; the opportunity needs a real body, budget, and commitment before it can become substance.",
    "Harmonious change has become imbalance, dropped obligations, or frantic adjustment; the rhythm must simplify before another demand is added.",
    "Work is compromised by poor craft, refusal of collaboration, or standards no one is willing to uphold; the structure cannot exceed the care placed into its making.",
    "Earthly power has contracted into avarice, possession, or fear-driven control; holding tighter is preventing the security that circulation could create.",
    "Material trouble is prolonged by shame, isolation, or help that cannot be recognized or accepted; scarcity must be separated from the belief that one is unworthy of support.",
    "Exchange is distorted by debt, strings-attached generosity, exploitation, or unequal power; giving and receiving need dignity, consent, and a fair measure.",
    "Unfulfilled success has become impatience, wasted labor, or abandonment just before the roots can be honestly assessed; effort needs evaluation rather than contempt.",
    "Prudence has become drudgery, careless repetition, or perfectionism that prevents learning; skill grows through attentive practice, not punishment.",
    "Material gain is precarious, dependent, or displayed without inner sufficiency; comfort cannot become autonomy while its support remains denied or unseen.",
    "Wealth is destabilized by family conflict, inherited burden, broken systems, or security built on exclusion; stewardship must include the future it claims to protect.",
    "The young earth current lacks follow-through, practical study, or respect for limits; the plan needs a smaller promise that can actually be kept.",
    "Steadiness has become stagnation, negligence, or stubborn repetition; reliability is not the same as refusing every necessary change.",
    "Care has turned into depletion, smothering, overwork, or dependence on material proof of worth; the body and its resources need tending without self-erasure.",
    "Stewardship has corrupted into greed, possessiveness, or control through resources; material authority must return to responsibility and fair use.",
  ];

  const ELEMENTS = {
    Wands: { name: "Fire", glyph: "🜂", meaning: "will, spirit, appetite, courage, and creative action" },
    Cups: { name: "Water", glyph: "🜄", meaning: "feeling, intuition, relationship, memory, and receptivity" },
    Swords: { name: "Air", glyph: "🜁", meaning: "thought, language, truth, conflict, and discernment" },
    Pentacles: { name: "Earth", glyph: "🜃", meaning: "body, material life, resources, craft, and embodiment" },
  };

  const BOOK_ICON_HTML = `<svg class="tile-book-icon" viewBox="0 0 32 24" focusable="false" aria-hidden="true"><path d="M2.5 3.5c5.2-1.2 9.4-.3 13.5 2.6v15c-4.1-2.9-8.3-3.8-13.5-2.6zM29.5 3.5c-5.2-1.2-9.4-.3-13.5 2.6v15c4.1-2.9 8.3-3.8 13.5-2.6zM16 6.1v15"/></svg>`;
  const TREE_ICON_HTML = `<svg class="tile-tree-icon" viewBox="0 0 32 32" focusable="false" aria-hidden="true"><path d="M16 4v7M9 11h14M9 11v7M23 11v7M9 18h14M16 11v13M9 18l7 6 7-6"/><circle cx="16" cy="4" r="2.6"/><circle cx="9" cy="11" r="2.6"/><circle cx="23" cy="11" r="2.6"/><circle cx="9" cy="18" r="2.6"/><circle cx="23" cy="18" r="2.6"/><circle cx="16" cy="24" r="2.6"/><circle cx="16" cy="29" r="2.6"/></svg>`;

  const NUMBER_MEANINGS = {
    0: ["Potential", "The open field before a fixed beginning: possibility, trust, and a step into experience without a completed map."],
    1: ["Initiation", "A singular impulse asks to become conscious direction, self-definition, and a genuine beginning."],
    2: ["Polarity", "Two forces seek relationship, reflection, receptivity, and an honest way to coexist without erasing difference."],
    3: ["Expression", "The current wants to create, communicate, multiply, and give an inner pattern a visible or relational form."],
    4: ["Foundation", "Energy seeks order, boundary, reliability, and a structure strong enough to hold what is becoming real."],
    5: ["Change", "Friction breaks stagnation and asks for movement, experimentation, freedom, and a more adaptive center."],
    6: ["Integration", "The current returns to choice, responsibility, harmony, relationship, and the work of bringing parts into accord."],
    7: ["Discernment", "Experience turns inward for testing, contemplation, strategy, and knowledge that cannot be borrowed from the crowd."],
    8: ["Power", "The current concerns embodiment, consequence, reciprocity, endurance, and the ethical handling of material force."],
    9: ["Completion", "The current gathers wisdom, compassion, culmination, and the release required before another cycle can begin."],
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
  };

  const TREE_SPHERES = [
    null,
    { number: 1, name: "Kether", title: "Crown", current: "the first concentration of limitless possibility into being" },
    { number: 2, name: "Chokmah", title: "Wisdom", current: "unbounded force, impulse, and the first outpouring of creative energy" },
    { number: 3, name: "Binah", title: "Understanding", current: "form, boundary, comprehension, and the great receiving intelligence" },
    { number: 4, name: "Chesed", title: "Mercy", current: "expansion, generosity, order, and benevolent authority" },
    { number: 5, name: "Geburah", title: "Severity", current: "strength, correction, consequence, and the courage to cut" },
    { number: 6, name: "Tiphareth", title: "Beauty", current: "integration, sacrifice, identity, and the harmonizing solar heart" },
    { number: 7, name: "Netzach", title: "Victory", current: "desire, attraction, feeling, endurance, and living relationship" },
    { number: 8, name: "Hod", title: "Splendour", current: "language, pattern, analysis, symbol, and the shaping intelligence" },
    { number: 9, name: "Yesod", title: "Foundation", current: "image, dream, memory, transmission, and the subtle foundation of form" },
    { number: 10, name: "Malkuth", title: "Kingdom", current: "embodiment, material fact, consequence, and the world in which the current must be lived" },
  ];

  const TREE_PATHS = [
    [11, "א", "Aleph", "Kether", "Chokmah"], [12, "ב", "Beth", "Kether", "Binah"],
    [13, "ג", "Gimel", "Kether", "Tiphareth"], [14, "ד", "Daleth", "Chokmah", "Binah"],
    [15, "ה", "Heh", "Chokmah", "Tiphareth"], [16, "ו", "Vav", "Chokmah", "Chesed"],
    [17, "ז", "Zayin", "Binah", "Tiphareth"], [18, "ח", "Cheth", "Binah", "Geburah"],
    [19, "ט", "Teth", "Chesed", "Geburah"], [20, "י", "Yod", "Chesed", "Tiphareth"],
    [21, "כ", "Kaph", "Chesed", "Netzach"], [22, "ל", "Lamed", "Geburah", "Tiphareth"],
    [23, "מ", "Mem", "Geburah", "Hod"], [24, "נ", "Nun", "Tiphareth", "Netzach"],
    [25, "ס", "Samekh", "Tiphareth", "Yesod"], [26, "ע", "Ayin", "Tiphareth", "Hod"],
    [27, "פ", "Peh", "Netzach", "Hod"], [28, "צ", "Tzaddi", "Netzach", "Yesod"],
    [29, "ק", "Qoph", "Netzach", "Malkuth"], [30, "ר", "Resh", "Hod", "Yesod"],
    [31, "ש", "Shin", "Hod", "Malkuth"], [32, "ת", "Tav", "Yesod", "Malkuth"],
  ].map(([number, hebrew, letter, from, to]) => ({ number, hebrew, letter, from, to }));

  const TREE_WORLDS = {
    Wands: { name: "Atziluth", hebrew: "אֲצִילוּת", translation: "Emanation", element: "Fire" },
    Cups: { name: "Briah", hebrew: "בְּרִיאָה", translation: "Creation", element: "Water" },
    Swords: { name: "Yetzirah", hebrew: "יְצִירָה", translation: "Formation", element: "Air" },
    Pentacles: { name: "Assiah", hebrew: "עֲשִׂיָּה", translation: "Action", element: "Earth" },
  };

  const COURT_TREE = {
    Page: { number: 10, title: "Page", letter: "Final Heh", sephirah: "Malkuth", world: "Assiah" },
    Knight: { number: 9, title: "Knight", letter: "Vav", sephirah: "Yesod", world: "Yetzirah" },
    Queen: { number: 3, title: "Queen", letter: "Heh", sephirah: "Binah", world: "Briah" },
    King: { number: 2, title: "King", letter: "Yod", sephirah: "Chokmah", world: "Atziluth" },
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

  const PLANET_MYTHOLOGY = {
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
  };

  const MAJOR_MYTHOLOGY = {
    0: ["Ouranos", "Caelus"],
    1: ["Hermes", "Thoth", "Nabu"],
    2: ["Selene", "Artemis", "Khonsu"],
    3: ["Aphrodite", "Inanna", "Hathor"],
    4: ["Ares", "Nergal", "Anhur"],
    5: ["Chiron"],
    6: ["Hermes", "Thoth", "Nabu"],
    7: ["Selene", "Artemis", "Khonsu"],
    8: ["Helios", "Apollo", "Ra"],
    9: ["Hermes", "Thoth", "Nabu"],
    10: ["Zeus", "Marduk", "Amun"],
    11: ["Aphrodite", "Inanna", "Hathor"],
    12: ["Neptune", "Poseidon", "Enki"],
    13: ["Hades", "Pluto", "Ereshkigal", "Ares", "Nergal", "Anhur"],
    14: ["Zeus", "Marduk", "Amun"],
    15: ["Cronus", "Ninurta", "Geb"],
    16: ["Ares", "Nergal", "Anhur"],
    17: ["Ouranos", "Caelus", "Cronus", "Ninurta", "Geb"],
    18: ["Selene", "Artemis", "Khonsu"],
    19: ["Helios", "Apollo", "Ra"],
    20: ["Hades", "Pluto", "Ereshkigal"],
    21: ["Cronus", "Ninurta", "Geb"],
  };

  const SIGN_MYTHOLOGY = {
    Taurus: ["Europa", "Zeus as the Bull"],
  };

  const PLANET_STONES = {
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
        { name: "Action to Take Now" },
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
  const spreadCue = document.querySelector("[data-spread-cue]");
  if (!spreadArea || !readingCards || !cardLegend || !spreadTitle || !dialog) return;

  function loadDrawState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DRAW_STORAGE_KEY) || "null");
      return parsed && typeof parsed === "object" ? parsed : { spreads: {} };
    } catch {
      return { spreads: {} };
    }
  }

  function saveDrawState() {
    try {
      localStorage.setItem(DRAW_STORAGE_KEY, JSON.stringify({
        activeSpread: currentSpread,
        reversalsEnabled,
        spreads: rememberedSpreads,
      }));
    } catch {
      // The Draw remains fully usable when storage is unavailable.
    }
  }

  function validRememberedSpread(key, cards) {
    return Array.isArray(cards)
      && cards.length === SPREADS[key]?.positions.length
      && cards.every((card) => Number.isInteger(card?.index)
        && card.index >= 0
        && card.index < CARD_NAMES.length
        && typeof card.reversed === "boolean");
  }

  const storedState = loadDrawState();
  const rememberedSpreads = Object.fromEntries(Object.entries(storedState.spreads || {})
    .filter(([key, cards]) => validRememberedSpread(key, cards)));
  let currentSpread = SPREADS[storedState.activeSpread] ? storedState.activeSpread : "three";
  let reversalsEnabled = typeof storedState.reversalsEnabled === "boolean" ? storedState.reversalsEnabled : true;
  let currentCards = validRememberedSpread(currentSpread, rememberedSpreads[currentSpread])
    ? rememberedSpreads[currentSpread].map((card) => ({ ...card }))
    : [];
  let spreadScrollFrame = 0;

  function imagePath(index) { return `${CARD_BASE}/${String(index).padStart(2, "0")}.webp`; }

  function cardMeta(index) {
    if (index < 22) {
      return {
        index,
        name: CARD_NAMES[index],
        kind: "Major Arcana",
        key: String(index),
        hermetic: HERMETIC_MAJOR_TITLES[index],
        meaning: MAJOR_MEANINGS[index],
        reversedMeaning: REVERSED_MEANINGS[index],
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
      reversedMeaning: REVERSED_MEANINGS[index],
      ground: decan ? decan[4] : rankCopy[1],
      decan,
      major: false,
    };
  }

  function standaloneSentence(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    const capitalized = trimmed.replace(/[A-Za-z]/, (letter) => letter.toUpperCase());
    return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
  }

  function tile(label, value, glyph, tooltip, options = {}) {
    const description = options.verbatim ? String(tooltip || "").trim() : standaloneSentence(tooltip);
    const accessibleDescription = description.replace(/\s*\n+\s*/g, " · ");
    const item = document.createElement("div");
    item.className = "draw-correspondence";
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `${label}: ${value}. ${accessibleDescription}`);
    item.innerHTML = `<span class="draw-correspondence__glyph" aria-hidden="true">${glyph}</span><span class="draw-correspondence__copy"><small>${label}</small><strong>${value}</strong></span>`;
    const tooltipElement = document.createElement("span");
    tooltipElement.className = "draw-correspondence__tooltip";
    tooltipElement.id = `draw-correspondence-tooltip-${++tooltipSequence}`;
    tooltipElement.setAttribute("role", "tooltip");
    tooltipElement.textContent = description;
    item.setAttribute("aria-describedby", tooltipElement.id);
    item.append(tooltipElement);
    prepareFloatingTooltip(item, tooltipElement);
    return item;
  }

  function celestialVoices(meta) {
    if (meta.major) return (MAJOR_CORRESPONDENCES[meta.index].planet || "").split(" · ").filter(Boolean);
    return meta.decan ? [meta.decan[1]] : [];
  }

  function celestialVoiceTiles(meta) {
    const voices = celestialVoices(meta);
    if (!voices.length) return [];

    const mythology = meta.major
      ? MAJOR_MYTHOLOGY[meta.index] || [...new Set(voices.flatMap((voice) => PLANET_MYTHOLOGY[voice] || []))]
      : [...new Set(voices.flatMap((voice) => PLANET_MYTHOLOGY[voice] || []))];
    const stoneGroups = voices.map((voice) => PLANET_STONES[voice] || []).filter((stones) => stones.length);
    const primaryStone = stoneGroups[0]?.[0];
    const relatedStones = [...new Set([
      ...stoneGroups.slice(1).map((stones) => stones[0]),
      ...stoneGroups.flatMap((stones) => stones.slice(1)),
    ])].filter((stone) => stone !== primaryStone).slice(0, 2);
    const nodes = [];

    if (mythology.length) {
      nodes.push(tile("Myth", mythology[0], BOOK_ICON_HTML, mythology.join(" · "), { verbatim: true }));
    }
    if (primaryStone) {
      const stoneTooltip = relatedStones.length
        ? `Primary\n${primaryStone}\n\nAlso Related\n${relatedStones.join(" · ")}`
        : `Primary\n${primaryStone}`;
      nodes.push(tile("Crystals", primaryStone, "◆", stoneTooltip, { verbatim: true }));
    }
    return nodes;
  }

  function ordinalHouse(number) {
    if (number >= 11 && number <= 13) return `${number}th`;
    return `${number}${({ 1: "st", 2: "nd", 3: "rd" })[number % 10] || "th"}`;
  }

  function cardNumber(meta) {
    if (meta.major) return meta.index;
    return COURT_TREE[meta.rank]?.number || meta.rankIndex + 1;
  }

  function reductionPath(value, { reduceTen = false } = {}) {
    const path = [value];
    let current = value;
    // Ten is a complete Tarot current in its own right. Pages alone pass from
    // Ten into One because their court role is the beginning made tangible.
    while (current > 10 || (reduceTen && current === 10)) {
      current = String(current).split("").reduce((sum, digit) => sum + Number(digit), 0);
      path.push(current);
    }
    return path;
  }

  function numerologyDetails(meta) {
    const number = cardNumber(meta);
    const path = reductionPath(number, { reduceTen: meta.rank === "Page" });
    const root = path.at(-1);
    const [rootTitle, rootMeaning] = NUMBER_MEANINGS[root] || ["Root Current", "The reduced current beneath the card number."];
    const context = meta.major
      ? `${meta.name} begins with Tarot Key ${number}.`
      : COURT_TREE[meta.rank]
        ? `${meta.name} carries court number ${number} in the Lost Opal court sequence.`
        : `${meta.name} begins with the ${ordinalHouse(number)} rank of ${meta.suit}.`;
    const sequence = path.map((value) => {
      const [title, meaning] = NUMBER_MEANINGS[value] || ["Compound Current", "This number is encountered as a distinct step before the card reduces again."];
      return {
        value,
        title,
        meaning,
        cardName: value >= 0 && value < MAJORS.length ? MAJORS[value] : "",
        cardMeaning: value >= 0 && value < MAJOR_MEANINGS.length ? MAJOR_MEANINGS[value] : "",
      };
    });
    return { number, path, root, rootTitle, rootMeaning, context, sequence };
  }

  function treeDetails(meta) {
    if (meta.major) {
      const path = TREE_PATHS[meta.index];
      return {
        quick: `Path ${path.number}`,
        glyph: path.hebrew,
        html: `<div class="draw-tree-summary"><span class="draw-tree-summary__glyph" lang="he" dir="rtl">${path.hebrew}</span><div><strong>${meta.name} · Path ${path.number}</strong><p>${path.letter} (${path.hebrew}) joins ${path.from} and ${path.to}.</p></div></div>`,
      };
    }

    const number = cardNumber(meta);
    const world = TREE_WORLDS[meta.suit];
    const sphere = TREE_SPHERES[number];
    const court = COURT_TREE[meta.rank];
    const courtCopy = court
      ? `${meta.name} is placed at ${court.number} · ${court.sephirah} in the Lost Opal court sequence. ${court.title} carries ${court.letter} through ${court.world}.`
      : `${meta.name} belongs to ${sphere.number} · ${sphere.name} (${sphere.title}).`;
    return {
      quick: `${sphere.number} · ${sphere.name}`,
      glyph: TREE_ICON_HTML,
      html: `<div class="draw-tree-summary"><span class="draw-tree-summary__glyph">${TREE_ICON_HTML}</span><div><strong>${sphere.number} · ${sphere.name} · ${sphere.title}</strong><p>${courtCopy}</p><p>${world.name} (${world.hebrew} · ${world.translation}) carries the ${meta.suit} current through ${world.element}. ${sphere.name} holds ${sphere.current}.</p></div></div>`,
    };
  }

  function activatePerspective(section, tab, moveFocus = false) {
    const view = tab.dataset.drawPerspective;
    for (const button of section.querySelectorAll("[data-draw-perspective]")) {
      const selected = button === tab;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    for (const panel of section.querySelectorAll("[data-draw-panel]")) {
      panel.hidden = panel.dataset.drawPanel !== view;
    }
    if (moveFocus) tab.focus();
  }

  function perspectiveSection(meta, groundText, idBase) {
    const numerology = numerologyDetails(meta);
    const tree = treeDetails(meta);
    const section = document.createElement("section");
    section.className = "draw-perspectives";
    section.setAttribute("aria-label", `Reading, numerology, and Tree of Life perspectives for ${meta.name}`);
    const tenNote = meta.rank === "Page"
      ? `<p class="draw-numerology-note"><strong>About Pages:</strong> Pages begin at Ten but resolve to One in the Lost Opal court sequence: 1 + 0 = 1. Zero remains The Fool&rsquo;s distinct current.</p>`
      : numerology.root === 10
        ? `<p class="draw-numerology-note"><strong>About Ten:</strong> Ten is held as a complete Tarot current here rather than reduced past The Wheel into One.</p>`
        : "";
    const sequence = numerology.sequence.map((step) => `
      <li>
        <div class="draw-numerology-step"><strong><span>${step.value}</span>${step.title}</strong><p>${step.meaning}</p></div>
        ${step.cardName ? `<div class="draw-numerology-card"><span aria-hidden="true">↳</span><div><small>Related Tarot Key ${step.value}</small><strong>${step.cardName}</strong><p>${step.cardMeaning}</p></div></div>` : ""}
      </li>`).join("");
    section.innerHTML = `
      <div class="draw-perspectives__tabs" role="tablist" aria-label="Perspectives for ${meta.name}">
        <button type="button" role="tab" aria-selected="true" aria-controls="${idBase}-reading" id="${idBase}-reading-tab" data-draw-perspective="reading" tabindex="0">Reading</button>
        <button type="button" role="tab" aria-selected="false" aria-controls="${idBase}-numerology" id="${idBase}-numerology-tab" data-draw-perspective="numerology" tabindex="-1">Numerology <small>${numerology.root} · ${numerology.rootTitle}</small></button>
        <button type="button" role="tab" aria-selected="false" aria-controls="${idBase}-tree" id="${idBase}-tree-tab" data-draw-perspective="tree" tabindex="-1">Tree of Life <small>${tree.quick}</small></button>
      </div>
      <div class="draw-perspective-panel" id="${idBase}-reading" role="tabpanel" aria-labelledby="${idBase}-reading-tab" data-draw-panel="reading">
        <p class="draw-reading-card__ground"><strong>Ground it:</strong> ${groundText}</p>
      </div>
      <div class="draw-perspective-panel draw-numerology-panel" id="${idBase}-numerology" role="tabpanel" aria-labelledby="${idBase}-numerology-tab" data-draw-panel="numerology" hidden>
        <p class="draw-numerology-result"><strong>Reduced current</strong><span>${numerology.root} · ${numerology.rootTitle}</span>${numerology.rootMeaning}</p>
        <p><strong>Starting number:</strong> ${numerology.context}</p>
        <p><strong>Reduction:</strong> ${numerology.path.join(" → ")}</p>
        ${tenNote}
        <div class="draw-numerology-sequence"><strong>Number and related-card trail</strong><p>Each number is read first as a numerological current; the Tarot key carrying that number follows beneath it.</p><ol>${sequence}</ol></div>
      </div>
      <div class="draw-perspective-panel draw-tree-panel" id="${idBase}-tree" role="tabpanel" aria-labelledby="${idBase}-tree-tab" data-draw-panel="tree" hidden>${tree.html}</div>`;
    section.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-draw-perspective]");
      if (tab) activatePerspective(section, tab);
    });
    section.addEventListener("keydown", (event) => {
      const current = event.target.closest("[data-draw-perspective]");
      if (!current || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const tabs = [...section.querySelectorAll("[data-draw-perspective]")];
      const currentIndex = tabs.indexOf(current);
      const nextIndex = event.key === "Home" ? 0
        : event.key === "End" ? tabs.length - 1
        : event.key === "ArrowRight" ? (currentIndex + 1) % tabs.length
        : (currentIndex - 1 + tabs.length) % tabs.length;
      event.preventDefault();
      activatePerspective(section, tabs[nextIndex], true);
    });
    return section;
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
      ? ordinalHouse(numbers[0])
      : consecutive
        ? `${ordinalHouse(numbers[0])}–${ordinalHouse(numbers.at(-1))}`
        : numbers.map(ordinalHouse).join(" & ");
    const meanings = houses
      .map((house) => `${ordinalHouse(house.number)} House (${house.sign}): ${house.meaning}`)
      .join("; ");
    const tooltip = `${placement.decanDescription} On the simple Aries-first natural wheel used for this un-timed Draw, that places it in ${houses.length === 1 ? "the" : "these"} ${value} ${houses.length === 1 ? "House" : "Houses"}: ${meanings}.`;
    return tile("House", value, "⌂", tooltip);
  }

  function correspondenceNodes(meta) {
    const nodes = [];
    if (meta.major) {
      const corr = MAJOR_CORRESPONDENCES[meta.index];
      nodes.push(tile("Tarot Key", meta.key, meta.key, `Key ${meta.key} of the Major Arcana.`));
      if (corr.element) {
        const element = Object.values(ELEMENTS).find((candidate) => candidate.name === corr.element);
        nodes.push(tile("Element", corr.element, element?.glyph || "✦", element?.meaning || corr.element));
      }
      if (corr.planet) {
        const firstPlanet = corr.planet.split(" · ")[0];
        const planetLabel = corr.sign ? "Sign Ruler" : "Planet";
        const planetTooltip = corr.sign
          ? `${corr.planet} traditionally rules ${corr.sign}. ${corr.planet.split(" · ").map((planet) => standaloneSentence(PLANET_MEANINGS[planet] || planet)).join(" ")}`
          : corr.planet.split(" · ").map((planet) => standaloneSentence(PLANET_MEANINGS[planet] || planet)).join(" ");
        nodes.push(tile(planetLabel, corr.planet, GLYPHS[firstPlanet] || "✦", planetTooltip));
      }
      if (corr.sign) {
        const signMyths = SIGN_MYTHOLOGY[corr.sign] || [];
        const signTooltip = signMyths.length
          ? `${standaloneSentence(SIGN_MEANINGS[corr.sign])}\n\nMyth\n${signMyths.join(" · ")}`
          : SIGN_MEANINGS[corr.sign];
        nodes.push(tile("Zodiac", corr.sign, GLYPHS[corr.sign], signTooltip, { verbatim: signMyths.length > 0 }));
        nodes.push(tile("Decan", "1–3", GLYPHS[corr.sign], `${meta.name} carries all three decans of ${corr.sign}.`));
      } else {
        const planetName = corr.planet?.split(" · ")[0];
        const signs = ruledSigns(corr.planet);
        nodes.push(tile("Decan", "1–3", GLYPHS[planetName] || "✦", `${meta.name} carries all three decans of ${signs.join(" and ")} through ${corr.planet}.`));
      }
    } else {
      const element = ELEMENTS[meta.suit];
      nodes.push(tile("Element", element.name, element.glyph, element.meaning));
      if (meta.decan) {
        const [sign, planet, decan] = meta.decan;
        const signMyths = SIGN_MYTHOLOGY[sign] || [];
        const signTooltip = signMyths.length
          ? `${standaloneSentence(SIGN_MEANINGS[sign])}\n\nMyth\n${signMyths.join(" · ")}`
          : SIGN_MEANINGS[sign];
        nodes.push(tile("Planet", planet, GLYPHS[planet], PLANET_MEANINGS[planet]));
        nodes.push(tile("Zodiac", sign, GLYPHS[sign], signTooltip, { verbatim: signMyths.length > 0 }));
        nodes.push(tile("Decan", decan.replace(" Decan", ""), decan.replace(" Decan", ""), `${meta.name} is the fixed Golden Dawn card of the ${decan.toLowerCase()} of ${sign}; this ten-degree face is ruled by ${planet}.`));
      } else {
        nodes.push(tile("Court / Root", meta.rank, meta.rank === "Ace" ? "I" : "♙", `${meta.rank} expresses the ${meta.suit} current through its own stage of embodiment.`));
        if (COURT_DECAN_SPANS[meta.name]) {
          const [fromSign, toSign, span] = COURT_DECAN_SPANS[meta.name];
          nodes.push(tile("Decan", "1–3", "↔", `${meta.name} spans three consecutive decans across ${span}: the final decan of ${fromSign} and the first two decans of ${toSign}.`));
        } else {
          nodes.push(tile("Decan", "1–3", element.glyph, `${meta.name} belongs to the ${meta.suit} elemental quarter touching ${ELEMENTAL_QUARTERS[meta.suit]}, rather than to one numbered-minor decan.`));
        }
      }
    }
    nodes.push(naturalHouseTile(meta));
    nodes.push(...celestialVoiceTiles(meta));
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
    const reversedMarker = card.reversed ? `<span class="draw-card__reversed-marker" aria-hidden="true" title="Reversed">↻</span>` : "";
    button.innerHTML = `<span class="draw-card__frame"><img src="${imagePath(card.index)}" alt="${meta.name}${card.reversed ? ", reversed" : ""}" width="180" height="300" loading="eager" decoding="sync" class="${card.reversed ? "is-reversed" : ""}"><span class="draw-card__number">${order + 1}</span></span><span class="draw-card__label">${pointLabel}<b>${meta.name}${reversedMarker}</b><small>${card.reversed ? "Reversed" : "Upright"}</small></span>`;
    button.addEventListener("click", () => openDialog(card, position));
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
    artButton.innerHTML = `<img src="${imagePath(card.index)}" alt="${meta.name}${card.reversed ? ", reversed" : ""}" width="180" height="300" loading="eager" decoding="sync" class="${card.reversed ? "is-reversed" : ""}">`;
    artButton.addEventListener("click", () => openDialog(card, position));
    art.append(artButton);

    const copy = document.createElement("div");
    copy.className = "draw-reading-card__copy";
    const positionLens = position.lens ? `<p class="draw-reading-card__lens">${position.lens}</p>` : "";
    const activeMeaning = card.reversed ? meta.reversedMeaning : meta.meaning;
    copy.innerHTML = `
      <p class="draw-reading-card__position"><b>${order + 1}</b><span>${position.name} · ${card.reversed ? "Reversed" : "Upright"}</span></p>
      <h3>${meta.name}</h3>
      <p class="draw-reading-card__hermetic">${meta.hermetic}</p>
      ${positionLens}
      <p class="draw-reading-card__meaning"><strong>${card.reversed ? "Reversed meaning" : "Meaning"}:</strong> ${activeMeaning}</p>
    `;
    const correspondences = document.createElement("div");
    correspondences.className = "draw-correspondences";
    correspondenceNodes(meta).forEach((node) => correspondences.append(node));
    copy.append(correspondences);
    const correspondenceHint = document.createElement("p");
    correspondenceHint.className = "draw-correspondences__hint";
    correspondenceHint.textContent = "Tap a tile to learn more.";
    copy.append(correspondenceHint);
    copy.append(perspectiveSection(meta, meta.ground, `${article.id}-perspective`));

    article.append(art, copy);
    return article;
  }

  function openDialog(card, position) {
    const meta = cardMeta(card.index);
    const image = dialog.querySelector("[data-dialog-image]");
    image.src = imagePath(card.index);
    image.alt = `${meta.name}${card.reversed ? ", reversed" : ""}`;
    image.classList.toggle("is-reversed", card.reversed);
    dialog.querySelector("[data-dialog-position]").textContent = `${position.name} · ${card.reversed ? "Reversed" : "Upright"}`;
    dialog.querySelector("[data-dialog-name]").textContent = meta.name;
    dialog.querySelector("[data-dialog-hermetic]").textContent = meta.hermetic;
    dialog.querySelector("[data-dialog-meaning]").textContent = `${card.reversed ? "Reversed meaning" : "Meaning"}: ${card.reversed ? meta.reversedMeaning : meta.meaning}`;
    const corr = dialog.querySelector("[data-dialog-correspondences]");
    corr.replaceChildren(...correspondenceNodes(meta));
    dialog.querySelector("[data-dialog-perspectives]").replaceChildren(perspectiveSection(meta, meta.ground, "draw-dialog-perspective"));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  function updateSpreadCue() {
    spreadScrollFrame = 0;
    if (!spreadCue) return;
    spreadCue.hidden = spreadArea.scrollWidth <= spreadArea.clientWidth + 4;
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
      const legendReversedMarker = card.reversed ? ` <span class="draw-legend__reversed-marker" role="img" aria-label="Reversed" title="Reversed">↻</span>` : "";
      legendItem.innerHTML = `<b>${index + 1}</b> ${namedPoint}${meta.name}${legendReversedMarker}`;
      cardLegend.append(legendItem);
      readingCards.append(readingArticle(card, position, index));
      if (!meta) return;
    });
    spreadArea.scrollLeft = 0;
    requestAnimationFrame(updateSpreadCue);
  }

  function redraw(announce = true) {
    const spread = SPREADS[currentSpread];
    currentCards = drawUnique(spread.positions.length);
    rememberedSpreads[currentSpread] = currentCards.map((card) => ({ ...card }));
    saveDrawState();
    render();
    if (announce) status.textContent = `${spread.title} drawn. ${spread.positions.length} card${spread.positions.length === 1 ? "" : "s"} are ready below.`;
  }

  document.querySelectorAll("[data-spread]").forEach((button) => {
    button.addEventListener("click", () => {
      currentSpread = button.dataset.spread;
      document.querySelectorAll("[data-spread]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
      if (validRememberedSpread(currentSpread, rememberedSpreads[currentSpread])) {
        currentCards = rememberedSpreads[currentSpread].map((card) => ({ ...card }));
        saveDrawState();
        render();
        status.textContent = `${SPREADS[currentSpread].title} restored. Draw again only when you want a new spread.`;
      } else {
        redraw();
      }
    });
  });

  const cartomancyDefinition = document.querySelector("[data-cartomancy-definition]");
  prepareFloatingTooltip(cartomancyDefinition, cartomancyDefinition?.querySelector('[role="tooltip"]'));
  document.addEventListener("click", (event) => {
    if (activeTooltipTrigger && !activeTooltipTrigger.contains(event.target)) closeFloatingTooltip();
  });

  document.querySelector("[data-reversals]")?.addEventListener("click", (event) => {
    reversalsEnabled = !reversalsEnabled;
    event.currentTarget.setAttribute("aria-pressed", String(reversalsEnabled));
    event.currentTarget.innerHTML = `<span>↕</span> Reversals ${reversalsEnabled ? "On" : "Off"}`;
    saveDrawState();
    status.textContent = `Reversals are ${reversalsEnabled ? "on" : "off"}. Draw again when you are ready.`;
  });
  document.querySelector("[data-redraw]")?.addEventListener("click", () => redraw());
  document.querySelector("[data-print]")?.addEventListener("click", () => window.print());
  document.querySelector("[data-dialog-close]")?.addEventListener("click", () => dialog.close());
  window.addEventListener("resize", () => {
    if (!spreadScrollFrame) spreadScrollFrame = requestAnimationFrame(updateSpreadCue);
    scheduleTooltipPosition();
  }, { passive: true });
  window.visualViewport?.addEventListener("resize", () => scheduleTooltipPosition(), { passive: true });
  document.addEventListener("scroll", () => closeFloatingTooltip(), { passive: true, capture: true });
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });

  const reversalControl = document.querySelector("[data-reversals]");
  if (reversalControl) {
    reversalControl.setAttribute("aria-pressed", String(reversalsEnabled));
    reversalControl.innerHTML = `<span>↕</span> Reversals ${reversalsEnabled ? "On" : "Off"}`;
  }
  document.querySelectorAll("[data-spread]").forEach((choice) => {
    choice.setAttribute("aria-pressed", String(choice.dataset.spread === currentSpread));
  });
  if (currentCards.length) {
    render();
    status.textContent = `${SPREADS[currentSpread].title} restored. Draw again only when you want a new spread.`;
  } else {
    redraw(false);
    status.textContent = `${SPREADS[currentSpread].title} drawn for your first visit. It will remain here until you draw again.`;
  }
})();
