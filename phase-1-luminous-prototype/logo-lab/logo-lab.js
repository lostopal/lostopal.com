const seal = document.querySelector("[data-seal]");
const modeButtons = document.querySelectorAll("[data-seal-mode]");
const modeDescription = document.querySelector("[data-mode-description]");

const modes = {
  balanced: {
    description:
      "Public balance is active. The entire medallion forms the hidden Sun, with six solid-gold planetary glyphs held quietly over opal settings inside it.",
    label:
      "Working Lost Opal Tarot and Astrology crest crowned by infinity, with the original wordmark in front, the entire gold-ringed lightning-fractured black opal medallion forming a hidden Sun, six solid-gold planetary glyphs over opal settings inside it, and gold zodiac signs in black inlays beginning with Aries at nine o'clock",
  },
  personal: {
    description:
      "Personal triad is active. The Sun, Mercury for Gemini, and the Moon for Cancer are gently emphasized without changing the traditional planetary order.",
    label:
      "Working Lost Opal Tarot and Astrology crest crowned by infinity, with the whole medallion forming a hidden Sun and its solid-gold Mercury and Moon glyphs gently emphasized over opal settings while the original wordmark remains in front",
  },
};

function setSealMode(modeName) {
  const mode = modes[modeName] ?? modes.balanced;
  const isPersonal = modeName === "personal";

  seal.classList.toggle("is-personal", isPersonal);
  seal.setAttribute("aria-label", mode.label);
  modeDescription.textContent = mode.description;

  modeButtons.forEach((button) => {
    const isActive = button.dataset.sealMode === modeName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setSealMode(button.dataset.sealMode));
});
