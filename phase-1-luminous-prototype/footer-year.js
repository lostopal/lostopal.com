(() => {
  "use strict";

  // One tiny script saves Future Us from updating six footers every January.
  document.querySelectorAll("[data-copyright-years]").forEach((element) => {
    const establishedYear = Number(element.dataset.establishedYear);
    const currentYear = new Date().getFullYear();

    if (!Number.isInteger(establishedYear)) {
      return;
    }

    element.textContent =
      currentYear > establishedYear
        ? `${establishedYear}\u2013${currentYear}`
        : String(establishedYear);
  });
})();
