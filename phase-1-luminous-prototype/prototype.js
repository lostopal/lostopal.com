(() => {
"use strict";

/*
  Shared interaction layer.
  Navigation should be predictable; the mysteries are farther down the page.
*/

function learningLink(title, path, options = {}) {
  const { planned = false, current = false } = options;
  const classes = planned ? ' class="prototype-route"' : "";
  const plannedAttributes = planned
    ? ` data-coming-soon-title="${title}" data-planned-route="${path}"`
    : "";
  const currentAttribute = current ? ' aria-current="page"' : "";
  return `<a${classes} href="${planned ? "#coming-soon" : path}"${plannedAttributes}${currentAttribute}>${title}</a>`;
}

function learningGroupsMarkup(isMobile = false) {
  const currentPath = window.location.pathname.replace(/\/+$/, "/");
  const groupClass = isMobile ? "mobile-nav__learning-group" : "nav-menu__learning-group";
  const titleClass = isMobile ? "mobile-nav__learning-title" : "nav-menu__learning-title";
  const linksClass = isMobile ? "mobile-nav__learning-links" : "nav-menu__learning-links";

  const areas = [
    {
      title: "Tarot",
      slug: "tarot",
      links: [
        ["Major Arcana", "/learn/tarot/major-arcana/", true],
        ["Minor Arcana", "/learn/tarot/minor-arcana/", true],
        ["The Fool's Journey", "/learn/tarot/fools-journey/", true],
        ["The 4 Suits", "/learn/tarot/four-suits/", true],
        ["Court Cards", "/learn/tarot/court-cards/", true],
        ["Reading Styles", "/learn/reading-styles/", false],
        ["Incorporating Astrology", "/learn/tarot/astrology/", true]
      ]
    },
    {
      title: "Astrology",
      slug: "astrology",
      links: [
        ["Planets", "/learn/astrology/planets/", true],
        ["Signs", "/learn/astrology/signs/", true],
        ["Houses", "/learn/astrology/houses/", true],
        ["Aspects", "/learn/astrology/aspects/", true],
        ["Chart Foundations", "/learn/astrology/chart-foundations/", true],
        ["Timing &amp; Cycles", "/learn/astrology/timing-cycles/", true]
      ]
    },
    {
      title: "Qaballah",
      slug: "qaballah",
      links: [
        ["Tree of Life", "/learn/qaballah/tree-of-life/", true],
        ["Sephiroth", "/learn/qaballah/sephiroth/", true],
        ["Paths &amp; Correspondences", "/learn/qaballah/paths-correspondences/", true]
      ]
    },
    {
      title: "Numerology",
      slug: "numerology",
      links: [
        ["Numbers &amp; Meanings", "/learn/numerology/numbers/", true],
        ["Cycles &amp; Patterns", "/learn/numerology/cycles/", true]
      ]
    },
    {
      title: "Rituals",
      slug: "rituals",
      links: [
        ["Ritual Foundations", "/learn/rituals/foundations/", true],
        ["Timing &amp; Preparation", "/learn/rituals/timing-preparation/", true]
      ]
    },
    {
      title: "I Ching",
      slug: "i-ching",
      links: [
        ["Hexagrams", "/learn/i-ching/hexagrams/", true],
        ["Moving Lines", "/learn/i-ching/moving-lines/", true]
      ]
    },
    {
      title: "Runes",
      slug: "runes",
      links: [
        ["Rune Meanings", "/learn/runes/meanings/", true],
        ["Casting", "/learn/runes/casting/", true]
      ]
    },
    {
      title: "Oracles",
      slug: "oracle",
      links: [
        ["Oracle Decks", "/learn/oracles/decks/", true],
        ["Reading Methods", "/learn/oracles/reading-methods/", true]
      ]
    },
    {
      title: "Lenormand",
      slug: "lenormand",
      links: [
        ["Card Meanings", "/learn/lenormand/card-meanings/", true],
        ["Grand Tableau", "/learn/lenormand/grand-tableau/", true]
      ]
    },
    {
      title: "Osteomancy",
      slug: "osteomancy",
      links: [
        ["Pieces &amp; Meanings", "/learn/osteomancy/pieces/", true],
        ["Casting &amp; Placement", "/learn/osteomancy/casting/", true]
      ]
    }
  ];

  return areas.map((area) => `
    <section class="${groupClass}" aria-label="${area.title} learning">
      <a class="${titleClass}" href="/#practice-${area.slug}">${area.title}</a>
      <div class="${linksClass}">
        ${area.links.map(([title, path, planned]) => learningLink(title, path, {
          planned,
          current: currentPath === path
        })).join("")}
      </div>
    </section>
  `).join("");
}

function ensureSharedAtmosphere() {
  if (document.querySelector(".celestial-wallpaper")) {
    return;
  }

  /*
    Secondary pages used to inherit only the dark background, which made them
    feel like distant cousins of the homepage. This shared field carries the
    planetary, zodiacal, and magical-square details into every public room.
    No, the numbers are not random: Saturn and Jupiter are keeping an eye on us.
  */
  const wallpaper = `
    <div class="celestial-wallpaper site-symbol-field" aria-hidden="true">
      <span class="celestial-wallpaper__glyph celestial-wallpaper__glyph--zodiac" style="--x: 1%; --y: 8%; --s: 5.8rem; --r: -9deg; --d: -2s;">&#9800;</span>
      <span class="celestial-wallpaper__glyph celestial-wallpaper__glyph--planet" style="--x: 91%; --y: 13%; --s: 5.6rem; --r: 8deg; --d: -8s;">&#9737;</span>
      <span class="celestial-wallpaper__glyph celestial-wallpaper__glyph--alchemy" style="--x: 3%; --y: 27%; --s: 5.2rem; --r: -6deg; --d: -11s;">&#x1F702;</span>
      <span class="celestial-wallpaper__glyph celestial-wallpaper__glyph--zodiac" style="--x: 92%; --y: 34%; --s: 6rem; --r: 10deg; --d: -5s;">&#9804;</span>
      <span class="celestial-wallpaper__glyph celestial-wallpaper__glyph--planet" style="--x: 1%; --y: 48%; --s: 5.7rem; --r: 7deg; --d: -9s;">&#9791;</span>
      <span class="celestial-wallpaper__glyph celestial-wallpaper__glyph--zodiac" style="--x: 93%; --y: 57%; --s: 5.5rem; --r: -8deg; --d: -12s;">&#9806;</span>
      <span class="celestial-wallpaper__glyph celestial-wallpaper__glyph--planet" style="--x: 2%; --y: 72%; --s: 5.8rem; --r: -7deg; --d: -4s;">&#9795;</span>
      <span class="celestial-wallpaper__glyph celestial-wallpaper__glyph--alchemy" style="--x: 91%; --y: 79%; --s: 5.2rem; --r: 9deg; --d: -10s;">&#x1F704;</span>
      <span class="celestial-wallpaper__glyph celestial-wallpaper__glyph--zodiac" style="--x: 3%; --y: 91%; --s: 5.7rem; --r: 8deg; --d: -6s;">&#9810;</span>
      <span class="celestial-wallpaper__glyph celestial-wallpaper__glyph--planet" style="--x: 92%; --y: 94%; --s: 5.5rem; --r: -7deg; --d: -13s;">&#9796;</span>

      <div class="celestial-wallpaper__kamea celestial-wallpaper__kamea--saturn" style="--x: 77%; --y: 43%; --size: 6.6rem; --r: 5deg; --d: -6s;">
        <span>4</span><span>9</span><span>2</span>
        <span>3</span><span>5</span><span>7</span>
        <span>8</span><span>1</span><span>6</span>
      </div>

      <div class="celestial-wallpaper__kamea celestial-wallpaper__kamea--jupiter" style="--x: 8%; --y: 64%; --size: 7.4rem; --r: -6deg; --d: -11s;">
        <span>4</span><span>14</span><span>15</span><span>1</span>
        <span>9</span><span>7</span><span>6</span><span>12</span>
        <span>5</span><span>11</span><span>10</span><span>8</span>
        <span>16</span><span>2</span><span>3</span><span>13</span>
      </div>
    </div>
  `;

  const atmosphere = document.querySelector("[data-cosmic-journey], .black-opal-sky");
  if (atmosphere) {
    atmosphere.insertAdjacentHTML("afterend", wallpaper);
  } else {
    document.body.insertAdjacentHTML("afterbegin", wallpaper);
  }
}

function normalizeSharedNavigation() {
  document.querySelectorAll("a, button, summary").forEach((item) => {
    const normalizedText = item.textContent.replace(/\s+/g, " ").trim().toLowerCase();
    const titleCaseLabels = {
      "ways to work with me": "Ways to Work With Me",
      "how i read": "How I Read",
      "booking & inquiries": "Booking & Inquiries",
      "practices & tools": "Practices & Tools",
      "planets & symbols": "Planets & Symbols",
      "stones & crystal work": "Stones & Crystal Work",
      "lost opal astrology™": "Astrology"
    };
    if (titleCaseLabels[normalizedText]) item.textContent = titleCaseLabels[normalizedText];
  });

  const learnMenu = document.getElementById("learn-menu");
  if (learnMenu) {
    learnMenu.classList.add("nav-menu--learn");
    learnMenu.innerHTML = `
      <p class="nav-menu__label">Explore the Learning Library</p>
      <div class="nav-menu__learning-grid">${learningGroupsMarkup()}</div>
    `;
  }

  const mobileLearnDetails = Array.from(document.querySelectorAll(".mobile-nav details")).find(
    (details) => details.querySelector("summary")?.textContent.trim().startsWith("Learn")
  );
  const mobileLearnMenu = mobileLearnDetails?.querySelector(".mobile-nav__subnav");
  if (mobileLearnMenu) {
    mobileLearnMenu.classList.add("mobile-nav__subnav--learn");
    mobileLearnMenu.innerHTML = learningGroupsMarkup(true);
  }

  const readingLabels = ["Ways to Work With Me", "How I Read", "Booking & Inquiries"];
  document.querySelectorAll("#readings-menu a").forEach((link, index) => {
    if (readingLabels[index]) link.textContent = readingLabels[index];
  });

  const mobileReadingsDetails = Array.from(document.querySelectorAll(".mobile-nav details")).find(
    (details) => details.querySelector("summary")?.textContent.trim().startsWith("Readings")
  );
  mobileReadingsDetails?.querySelectorAll(".mobile-nav__subnav a").forEach((link, index) => {
    if (readingLabels[index]) link.textContent = readingLabels[index];
  });
}

ensureSharedAtmosphere();
normalizeSharedNavigation();

const termTipButtons = Array.from(document.querySelectorAll("[data-term-tip]"));

function closeTermTips(exceptButton = null) {
  termTipButtons.forEach((button) => {
    if (button === exceptButton) return;
    button.setAttribute("aria-expanded", "false");
    button.closest(".term-explainer")?.classList.remove("is-open");
  });
}

termTipButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    closeTermTips(willOpen ? button : null);
    button.setAttribute("aria-expanded", String(willOpen));
    button.closest(".term-explainer")?.classList.toggle("is-open", willOpen);
  });
});

document.addEventListener("click", () => closeTermTips());
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeTermTips();
});

const navTriggers = Array.from(document.querySelectorAll(".nav-trigger"));
const menuToggle = document.querySelector(".menu-toggle");
const drawer = document.querySelector(".mobile-drawer");
const drawerBackdrop = document.querySelector("[data-drawer-backdrop]");
const drawerClose = document.querySelector(".drawer-close");
const prototypeForm = document.querySelector("[data-prototype-form]");
const formStatus = document.querySelector("[data-form-status]");
const callRequestToggle = document.querySelector("[data-call-request-toggle]");
const callRequestFields = document.querySelector("[data-call-request-fields]");

/* The donation reminder belongs to the site, not just the homepage. Injecting
   it here prevents six nearly identical copies from drifting apart while we
   pretend copy-and-paste is a templating system. The donation landing page is
   the one obvious exception; asking someone to navigate to the page they are
   already standing on would be a little theatrical. */
if (!document.body.classList.contains("donate-page") && !document.querySelector("[data-support-dock]")) {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="mobile-support-dock" data-support-dock>
      <a class="mobile-support-dock__panel" href="/donate/" aria-label="Open the Lost Opal donation page">
        <span>
          <strong>Just got a free reading? <span>Donate if it helped.</span></strong>
          <small>Always optional &middot; Secure Payments</small>
        </span>
        <b aria-hidden="true">Donate</b>
      </a>
      <button
        class="mobile-support-dock__dismiss"
        type="button"
        data-support-dock-dismiss
        aria-label="Minimize donation reminder for this visit"
        title="Minimize for this visit"
      >
        <span aria-hidden="true">&times;</span>
      </button>
      <a
        class="mobile-support-dock__compact"
        href="/donate/"
        aria-label="Open the Lost Opal donation page"
        title="Donate"
      >
        <span aria-hidden="true">&hearts;</span>
        <strong>Donate</strong>
      </a>
    </div>
  `);
}

const supportDock = document.querySelector("[data-support-dock]");
const supportDockDismiss = document.querySelector("[data-support-dock-dismiss]");
const donationChoiceLinks = Array.from(document.querySelectorAll("[data-donation-choice]"));
const callRequestInputs = callRequestFields
  ? Array.from(callRequestFields.querySelectorAll("input"))
  : [];
let lastFocusedElement;

const supportDockSessionKey = "lost-opal-support-dock-dismissed";
const supportDockDonationDateKey = "lost-opal-support-dock-donation-date";

function getLocalDateStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function setSupportDockCollapsed(isCollapsed) {
  if (!supportDock) {
    return;
  }

  supportDock.hidden = false;
  supportDock.classList.toggle("is-collapsed", isCollapsed);
  document.body.classList.toggle("support-dock-collapsed", isCollapsed);

}

let shouldCollapseSupportDock = false;

try {
  shouldCollapseSupportDock = sessionStorage.getItem(supportDockSessionKey) === "true";
} catch {
  // A fresh page load still shows the full reminder if storage is unavailable.
}

try {
  shouldCollapseSupportDock ||= localStorage.getItem(supportDockDonationDateKey) === getLocalDateStamp();
} catch {
  // Donation links still work when storage is unavailable.
}

setSupportDockCollapsed(shouldCollapseSupportDock);

supportDockDismiss?.addEventListener("click", () => {
  setSupportDockCollapsed(true);

  try {
    sessionStorage.setItem(supportDockSessionKey, "true");
  } catch {
    // The dock still collapses when storage is unavailable.
  }
});

donationChoiceLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setSupportDockCollapsed(true);

    try {
      sessionStorage.setItem(supportDockSessionKey, "true");
      localStorage.setItem(supportDockDonationDateKey, getLocalDateStamp());
    } catch {
      // The chosen donation link still opens when storage is unavailable.
    }
  });
});

function closeDesktopMenus(exceptButton = null) {
  navTriggers.forEach((button) => {
    if (button === exceptButton) {
      return;
    }

    button.setAttribute("aria-expanded", "false");
    const menu = document.getElementById(button.getAttribute("aria-controls"));
    if (menu) {
      menu.hidden = true;
    }
  });
}

// The Coming Soon dialog uses this small public hook to tidy open menus.
window.closeDesktopMenus = closeDesktopMenus;

navTriggers.forEach((button) => {
  button.addEventListener("click", () => {
    const menu = document.getElementById(button.getAttribute("aria-controls"));
    if (!menu) {
      return;
    }
    const isOpening = button.getAttribute("aria-expanded") !== "true";

    closeDesktopMenus(button);
    button.setAttribute("aria-expanded", String(isOpening));
    menu.hidden = !isOpening;

    if (isOpening) {
      menu.querySelector("a")?.focus();
    }
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-group")) {
    closeDesktopMenus();
  }
});

function openDrawer() {
  if (!drawer || !drawerBackdrop || !drawerClose || !menuToggle) {
    return;
  }

  lastFocusedElement = document.activeElement;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  drawer.hidden = false;
  drawerBackdrop.hidden = false;
  document.body.classList.add("drawer-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close menu");
  drawerClose.focus({ preventScroll: true });

  /* iPad Safari may reapply its previous scroll position after the fixed
     drawer and focus target appear. Reassert the intended top position. */
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

function closeDrawer() {
  if (!drawer || !drawerBackdrop || !menuToggle) {
    return;
  }

  drawer.hidden = true;
  drawerBackdrop.hidden = true;
  document.body.classList.remove("drawer-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

menuToggle?.addEventListener("click", () => {
  if (drawer?.hidden) {
    openDrawer();
  } else {
    closeDrawer();
  }
});

drawerClose?.addEventListener("click", closeDrawer);
drawerBackdrop?.addEventListener("click", closeDrawer);

drawer?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (link) {
    closeDrawer();
  }
});

drawer?.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") {
    return;
  }

  const focusable = Array.from(
    drawer.querySelectorAll('a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')
  ).filter((element) => !element.hasAttribute("hidden"));

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeDesktopMenus();

  if (drawer && !drawer.hidden) {
    closeDrawer();
  }
});

function syncCallRequestFields() {
  if (!callRequestToggle || !callRequestFields) {
    return;
  }

  const isRequested = callRequestToggle.checked;
  callRequestFields.hidden = !isRequested;

  callRequestInputs.forEach((input) => {
    input.disabled = !isRequested;
    input.required = isRequested;
  });
}

callRequestToggle?.addEventListener("change", syncCallRequestFields);
syncCallRequestFields();

function clearInlineFormError(control) {
  control.removeAttribute("aria-invalid");
  control.closest(".field-group")?.classList.remove("has-error");
}

function labelForControl(control) {
  const label = prototypeForm?.querySelector(`label[for="${control.id}"]`);
  return label?.textContent.replace(/\s*\(optional\)\s*/i, "").trim().toLowerCase() || "this field";
}

function validateContactForm() {
  if (!prototypeForm || !formStatus) {
    return true;
  }

  const controls = Array.from(
    prototypeForm.querySelectorAll("input:not([type='hidden']):not([type='checkbox']), select, textarea")
  ).filter((control) => !control.disabled);
  const requiredControls = controls.filter((control) => control.required);
  const invalidControls = requiredControls.filter((control) => !control.checkValidity());

  controls.forEach(clearInlineFormError);
  formStatus.classList.remove("is-error", "is-success");

  if (invalidControls.length === 0) {
    formStatus.textContent = "";
    return true;
  }

  invalidControls.forEach((control) => {
    control.setAttribute("aria-invalid", "true");
    control.closest(".field-group")?.classList.add("has-error");
  });

  const allRequiredEmpty = requiredControls.every((control) => !String(control.value).trim());
  const firstInvalid = invalidControls[0];

  if (allRequiredEmpty) {
    formStatus.textContent = "Please fill out the form before sending. I need a few details so I know how to reach you.";
  } else if (firstInvalid.validity.typeMismatch && firstInvalid.type === "email") {
    formStatus.textContent = "Please enter a complete email address so I know where to reply.";
  } else {
    const missingLabels = invalidControls
      .filter((control) => control.validity.valueMissing)
      .map(labelForControl);
    const missingList = new Intl.ListFormat("en", {
      style: "long",
      type: "conjunction"
    }).format(missingLabels);

    formStatus.textContent = missingLabels.length
      ? `Please add ${missingList} before sending.`
      : "Please check the highlighted field before sending.";
  }

  formStatus.classList.add("is-error");
  firstInvalid.focus();
  return false;
}

prototypeForm?.addEventListener("input", (event) => {
  const control = event.target.closest("input, select, textarea");
  if (control) {
    clearInlineFormError(control);
  }
});

prototypeForm?.addEventListener("change", (event) => {
  const control = event.target.closest("input, select, textarea");
  if (control) {
    clearInlineFormError(control);
  }
});

prototypeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateContactForm()) {
    return;
  }

  const submitButton = prototypeForm.querySelector('button[type="submit"]');
  const formData = new FormData(prototypeForm);

  formStatus.textContent = "Sending your message…";
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");

  try {
    const response = await fetch("https://formsubmit.co/ajax/opal@lostopal.com", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    });

    if (!response.ok) {
      throw new Error("FormSubmit returned an error response.");
    }

    const result = await response.json();
    if (result.success === false) {
      throw new Error("FormSubmit rejected the submission.");
    }

    prototypeForm.reset();
    syncCallRequestFields();
    formStatus.textContent = "Message sent. I’ll be in touch as soon as I can.";
    formStatus.classList.add("is-success");
  } catch {
    const subject = encodeURIComponent(
      `Lost Opal inquiry — ${formData.get("inquiry") || "Website contact"}`
    );
    const fallbackDetails = [
      `Name: ${formData.get("name") || ""}`,
      `Email: ${formData.get("email") || ""}`,
      `Inquiry: ${formData.get("inquiry") || ""}`,
      formData.get("location") ? `Location: ${formData.get("location")}` : "",
      formData.get("request_call") ? "Request a call: Yes" : "",
      formData.get("phone") ? `Phone: ${formData.get("phone")}` : "",
      formData.get("best_time") ? `Best time to call: ${formData.get("best_time")}` : ""
    ].filter(Boolean);
    const body = encodeURIComponent(
      [
        ...fallbackDetails,
        "",
        "How may I serve?",
        formData.get("message") || ""
      ].join("\n")
    );

    formStatus.textContent =
      "The form could not send. Opening your email app instead so your message is not lost.";
    window.location.href = `mailto:opal@lostopal.com?subject=${subject}&body=${body}`;
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
  }
});

const toolTablist = document.querySelector("[data-tool-tabs] [role='tablist']");

if (toolTablist) {
  const toolTabs = Array.from(toolTablist.querySelectorAll("[role='tab']"));

  function activateToolTab(nextTab, moveFocus = true) {
    toolTabs.forEach((tabButton) => {
      const isActive = tabButton === nextTab;
      const panel = document.getElementById(tabButton.getAttribute("aria-controls"));

      tabButton.setAttribute("aria-selected", String(isActive));
      tabButton.tabIndex = isActive ? 0 : -1;
      panel.hidden = !isActive;
    });

    if (moveFocus) {
      nextTab.focus();
    }
  }

  toolTabs.forEach((tabButton, index) => {
    tabButton.addEventListener("click", () => activateToolTab(tabButton, false));

    tabButton.addEventListener("keydown", (event) => {
      let nextIndex = index;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % toolTabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + toolTabs.length) % toolTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = toolTabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      activateToolTab(toolTabs[nextIndex]);
    });
  });
}

const practiceTablist = document.querySelector(".practice-map[role='tablist']");

if (practiceTablist) {
  const practiceTabs = Array.from(practiceTablist.querySelectorAll("[role='tab']"));
  const practiceExplorer = document.querySelector("[data-practice-explorer]");

  function activatePracticeTab(nextTab, options = {}) {
    const { moveFocus = true, updateHash = false } = options;

    practiceTabs.forEach((tabButton) => {
      const isActive = tabButton === nextTab;
      const panel = document.getElementById(tabButton.getAttribute("aria-controls"));

      tabButton.setAttribute("aria-selected", String(isActive));
      tabButton.tabIndex = isActive ? 0 : -1;

      if (panel) {
        panel.hidden = !isActive;
      }
    });

    if (moveFocus) {
      nextTab.focus();
    }

    if (updateHash) {
      const panelId = nextTab.getAttribute("aria-controls");
      window.history.replaceState(null, "", `#${panelId}`);
    }
  }

  practiceTabs.forEach((tabButton, index) => {
    tabButton.addEventListener("click", () => {
      activatePracticeTab(tabButton, { moveFocus: false, updateHash: true });
    });

    tabButton.addEventListener("keydown", (event) => {
      let nextIndex = index;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % practiceTabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + practiceTabs.length) % practiceTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = practiceTabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      activatePracticeTab(practiceTabs[nextIndex], { updateHash: true });
    });
  });

  const requestedPanelId = window.location.hash.slice(1);
  const requestedTab = practiceTabs.find(
    (tabButton) => tabButton.getAttribute("aria-controls") === requestedPanelId
  );

  if (requestedTab) {
    activatePracticeTab(requestedTab, { moveFocus: false });
    window.requestAnimationFrame(() => practiceExplorer?.scrollIntoView({ block: "start" }));
  }

  window.addEventListener("hashchange", () => {
    const panelId = window.location.hash.slice(1);
    const matchingTab = practiceTabs.find(
      (tabButton) => tabButton.getAttribute("aria-controls") === panelId
    );

    if (matchingTab) {
      activatePracticeTab(matchingTab, { moveFocus: false });
      practiceExplorer?.scrollIntoView({ block: "start" });
    }
  });
}

})();

/* Shared atmosphere, unfinished-route notice, and footer maintenance live in
   this one common runtime so public pages do not need three extra requests. */
(() => {
  "use strict";

  const journey = document.querySelector("[data-cosmic-journey]");
  if (journey) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forceStaticJourney = document.body.classList.contains("draw-page");
    let frame = 0;

    function updateJourney() {
      frame = 0;
      if (reduceMotion.matches || forceStaticJourney) {
        journey.dataset.motion = "static";
        journey.style.removeProperty("--cosmic-position-y");
        journey.style.removeProperty("--cosmic-opacity");
        return;
      }

      const page = document.documentElement;
      const distance = Math.max(page.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, window.scrollY / distance));
      journey.dataset.motion = "scroll-directed";
      journey.dataset.phase = progress < 0.34 ? "dispersed" : progress < 0.76 ? "weaving" : "converging";
      journey.style.setProperty("--cosmic-position-y", `${(progress * 100).toFixed(2)}%`);
      journey.style.setProperty("--cosmic-opacity", (0.38 + progress * 0.2).toFixed(3));
    }

    function requestJourneyUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateJourney);
    }

    if (!forceStaticJourney) {
      window.addEventListener("scroll", requestJourneyUpdate, { passive: true });
      window.addEventListener("resize", requestJourneyUpdate, { passive: true });
      reduceMotion.addEventListener?.("change", requestJourneyUpdate);
    }
    updateJourney();
    journey.dataset.journeyReady = "true";
  }

  const comingSoonDialog = document.createElement("dialog");
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
      <p id="coming-soon-description">This room is still taking shape and is not open yet. Its material is being researched, written, and prepared with care.</p>
      <button class="coming-soon-return" type="button">Continue exploring</button>
    </article>`;
  document.body.append(comingSoonDialog);

  const comingSoonClose = comingSoonDialog.querySelector(".coming-soon-close");
  const comingSoonReturn = comingSoonDialog.querySelector(".coming-soon-return");
  const comingSoonDestination = comingSoonDialog.querySelector("[data-coming-soon-destination]");
  let comingSoonTrigger = null;

  function closeComingSoon() {
    if (comingSoonDialog.open) comingSoonDialog.close();
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const linkedPath = new URL(link.href, window.location.href).pathname;
    const plannedTitle = link.dataset.comingSoonTitle || plannedDestinations.get(linkedPath);
    if (!link.classList.contains("prototype-route") && !plannedTitle) return;

    event.preventDefault();
    comingSoonTrigger = link;
    comingSoonDestination.textContent = plannedTitle || link.textContent.trim();
    window.closeDesktopMenus?.();
    comingSoonDialog.showModal();
    comingSoonClose.focus();
  });

  comingSoonClose.addEventListener("click", closeComingSoon);
  comingSoonReturn.addEventListener("click", closeComingSoon);
  comingSoonDialog.addEventListener("click", (event) => {
    if (event.target === comingSoonDialog) closeComingSoon();
  });
  comingSoonDialog.addEventListener("close", () => {
    if (comingSoonTrigger instanceof HTMLElement) comingSoonTrigger.focus();
  });

  document.querySelectorAll("[data-copyright-years]").forEach((element) => {
    const establishedYear = Number(element.dataset.establishedYear);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(establishedYear)) return;
    element.textContent = currentYear > establishedYear
      ? `${establishedYear}\u2013${currentYear}`
      : String(establishedYear);
  });
})();
