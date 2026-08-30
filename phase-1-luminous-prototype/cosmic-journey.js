(() => {
  const journey = document.querySelector("[data-cosmic-journey]");
  if (!journey) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;

  function updateJourney() {
    frame = 0;

    if (reduceMotion.matches) {
      journey.dataset.motion = "static";
      journey.style.removeProperty("--cosmic-position-y");
      journey.style.removeProperty("--cosmic-opacity");
      return;
    }

    const page = document.documentElement;
    const scrollableDistance = Math.max(page.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollableDistance));

    journey.dataset.motion = "scroll-directed";
    journey.dataset.phase = progress < 0.34 ? "dispersed" : progress < 0.76 ? "weaving" : "converging";
    journey.style.setProperty("--cosmic-position-y", `${(progress * 100).toFixed(2)}%`);
    journey.style.setProperty("--cosmic-opacity", (0.38 + progress * 0.2).toFixed(3));
  }

  function requestJourneyUpdate() {
    if (!frame) {
      frame = window.requestAnimationFrame(updateJourney);
    }
  }

  window.addEventListener("scroll", requestJourneyUpdate, { passive: true });
  window.addEventListener("resize", requestJourneyUpdate, { passive: true });
  reduceMotion.addEventListener?.("change", requestJourneyUpdate);

  updateJourney();
  journey.dataset.journeyReady = "true";
})();
