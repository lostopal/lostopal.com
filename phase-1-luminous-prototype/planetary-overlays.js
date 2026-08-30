(() => {
  const planetaryMeanings = {
    sun: {
      kicker: "The central fire",
      title: "The Sun",
      role: "Core self & purpose",
      copy: "Illumination, vitality, identity, will, and purpose—the part of the question that asks how you may become more fully yourself.",
      position: "lower"
    },
    moon: {
      kicker: "The inner tide",
      title: "The Moon",
      role: "Instinct & inner life",
      copy: "Emotion, memory, habit, intuition, protection, and the quiet needs beneath the question—the inner ground from which you respond.",
      position: "upper"
    },
    mercury: {
      kicker: "The living messenger",
      title: "Mercury",
      role: "Mind & communication",
      copy: "Thought, speech, learning, interpretation, movement, and the messages that connect one part of your life to another.",
      position: "east"
    },
    venus: {
      kicker: "The power of attraction",
      title: "Venus",
      role: "Relationship & value",
      copy: "Affection, beauty, pleasure, harmony, personal values, and the ways we give, receive, and recognize what matters to us.",
      position: "west"
    },
    mars: {
      kicker: "The force that moves",
      title: "Mars",
      role: "Desire & action",
      copy: "Courage, conflict, boundaries, sexuality, ambition, and the decisive energy that helps us act on what the moment demands.",
      position: "east"
    },
    jupiter: {
      kicker: "The widening horizon",
      title: "Jupiter",
      role: "Growth & meaning",
      copy: "Expansion, opportunity, faith, generosity, wisdom, and the larger horizon that invites us to grow beyond what we already know.",
      position: "west"
    },
    saturn: {
      kicker: "The keeper of time",
      title: "Saturn",
      role: "Structure & mastery",
      copy: "Limits, responsibility, discipline, consequence, endurance, and the lessons that slowly turn experience into maturity and mastery.",
      position: "lower"
    }
  };

  document.querySelectorAll("[data-planetary-map]").forEach((map) => {
    const hotspots = Array.from(map.querySelectorAll("[data-planet]"));
    const panel = map.querySelector(".planetary-insight");

    if (!hotspots.length || !panel) return;

    const closeButton = panel.querySelector(".planetary-insight__close");
    const kicker = panel.querySelector("[data-planet-kicker]");
    const title = panel.querySelector("[data-planet-title]");
    const role = panel.querySelector("[data-planet-role]");
    const copy = panel.querySelector("[data-planet-copy]");
    let pinnedHotspot = null;
    let suppressNextFocusPreview = false;

    const resetExpanded = () => {
      hotspots.forEach((hotspot) => hotspot.setAttribute("aria-expanded", "false"));
    };

    const show = (hotspot) => {
      const planet = planetaryMeanings[hotspot.dataset.planet];
      if (!planet) return;

      kicker.textContent = planet.kicker;
      title.textContent = planet.title;
      role.textContent = planet.role;
      copy.textContent = planet.copy;
      panel.dataset.position = planet.position;
      map.dataset.activePlanet = hotspot.dataset.planet;
      panel.hidden = false;
    };

    const hidePreview = () => {
      if (pinnedHotspot) return;
      panel.hidden = true;
      delete map.dataset.activePlanet;
      delete panel.dataset.position;
    };

    const close = ({ restoreFocus = false } = {}) => {
      const hotspotToRestore = pinnedHotspot;
      pinnedHotspot = null;
      resetExpanded();
      panel.hidden = true;
      delete panel.dataset.pinned;
      delete panel.dataset.position;
      delete map.dataset.activePlanet;

      if (restoreFocus && hotspotToRestore && document.activeElement !== hotspotToRestore) {
        suppressNextFocusPreview = true;
        hotspotToRestore.focus({ preventScroll: true });
      }
    };

    const pin = (hotspot) => {
      if (pinnedHotspot === hotspot) {
        close();
        return;
      }

      pinnedHotspot = hotspot;
      resetExpanded();
      hotspot.setAttribute("aria-expanded", "true");
      panel.dataset.pinned = "true";
      show(hotspot);
    };

    hotspots.forEach((hotspot) => {
      hotspot.addEventListener("pointerenter", () => {
        if (!pinnedHotspot) show(hotspot);
      });

      hotspot.addEventListener("pointerleave", hidePreview);

      hotspot.addEventListener("focus", () => {
        if (suppressNextFocusPreview) {
          suppressNextFocusPreview = false;
          return;
        }
        if (!pinnedHotspot) show(hotspot);
      });

      hotspot.addEventListener("blur", () => {
        window.requestAnimationFrame(hidePreview);
      });

      hotspot.addEventListener("click", () => pin(hotspot));
    });

    closeButton?.addEventListener("click", () => close({ restoreFocus: true }));

    map.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || panel.hidden) return;
      event.preventDefault();
      close({ restoreFocus: true });
    });

    document.addEventListener("pointerdown", (event) => {
      if (pinnedHotspot && !map.contains(event.target)) close();
    });
  });
})();
