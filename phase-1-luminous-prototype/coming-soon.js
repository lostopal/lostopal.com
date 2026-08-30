(() => {
"use strict";

/* One shared notice keeps every unfinished destination honest and consistent. */
const comingSoonDialog = document.createElement("dialog");

/* Unavailable learning routes all use the same public-facing notice. */
const plannedDestinations = new Map([
  ["/astrology/", "Astrology"],
  ["/crystals/", "Stones & Crystal Work"],
  ["/learn/reading-styles/", "Reading Styles"]
]);

comingSoonDialog.className = "coming-soon-dialog";
comingSoonDialog.setAttribute("aria-labelledby", "coming-soon-title");
comingSoonDialog.setAttribute("aria-describedby", "coming-soon-description");
comingSoonDialog.innerHTML = `
  <article class="coming-soon-card">
    <button class="coming-soon-close" type="button" aria-label="Close Coming Soon message">&times;</button>
    <div class="coming-soon-opal" aria-hidden="true"><span>&#10022;</span></div>
    <p class="coming-soon-eyebrow" data-coming-soon-destination>A new chamber</p>
    <h2 id="coming-soon-title">Coming Soon!</h2>
    <p id="coming-soon-description">
      This room is still taking shape and is not open yet. Its material is
      being researched, written, and prepared with care.
    </p>
    <button class="coming-soon-return" type="button">Continue exploring</button>
  </article>
`;

document.body.append(comingSoonDialog);

const comingSoonClose = comingSoonDialog.querySelector(".coming-soon-close");
const comingSoonReturn = comingSoonDialog.querySelector(".coming-soon-return");
const comingSoonDestination = comingSoonDialog.querySelector("[data-coming-soon-destination]");
let comingSoonTrigger = null;

function closeComingSoon() {
  if (comingSoonDialog.open) {
    comingSoonDialog.close();
  }
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!link) {
    return;
  }

  const linkedPath = new URL(link.href, window.location.href).pathname;
  const plannedTitle = link.dataset.comingSoonTitle || plannedDestinations.get(linkedPath);

  if (!link.classList.contains("prototype-route") && !plannedTitle) {
    return;
  }

  event.preventDefault();
  comingSoonTrigger = link;
  comingSoonDestination.textContent = plannedTitle || link.textContent.trim();

  if (typeof window.closeDesktopMenus === "function") {
    window.closeDesktopMenus();
  }

  comingSoonDialog.showModal();
  comingSoonClose.focus();
});

comingSoonClose.addEventListener("click", closeComingSoon);
comingSoonReturn.addEventListener("click", closeComingSoon);

comingSoonDialog.addEventListener("click", (event) => {
  if (event.target === comingSoonDialog) {
    closeComingSoon();
  }
});

comingSoonDialog.addEventListener("close", () => {
  if (comingSoonTrigger instanceof HTMLElement) {
    comingSoonTrigger.focus();
  }
});

})();
