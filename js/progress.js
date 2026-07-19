/**
 * progress.js
 * Barre de progression de lecture + mémorisation de la position
 */

const Progress = (() => {
  let bar = null;
  let saveTimer = null;

  /**
   * Calcule le pourcentage de scroll de la page
   * @returns {number}
   */
  function getScrollPercent() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    if (height <= 0) return 0;
    return Math.min(100, Math.max(0, (scrollTop / height) * 100));
  }

  /**
   * Met à jour la barre visuelle
   */
  function updateBar() {
    if (!bar) return;
    const pct = getScrollPercent();
    bar.style.width = pct.toFixed(1) + "%";
    bar.setAttribute("aria-valuenow", String(Math.round(pct)));
  }

  /**
   * Sauvegarde la position (debounce)
   */
  function scheduleSave() {
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      Storage.set("scrollY", window.scrollY || 0);
      Storage.set("scrollPercent", getScrollPercent());
    }, 300);
  }

  /**
   * Restaure la dernière position connue
   */
  function restorePosition() {
    const y = Storage.get("scrollY", 0);
    if (typeof y === "number" && y > 0) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "auto" });
        updateBar();
      });
    }
  }

  /**
   * Initialise le suivi de progression
   */
  function init() {
    bar = document.getElementById("reading-progress");
    if (!bar) return;

    updateBar();
    window.addEventListener("scroll", () => {
      updateBar();
      scheduleSave();
    }, { passive: true });

    window.addEventListener("resize", updateBar, { passive: true });

    // Restauration différée pour laisser le layout se stabiliser
    window.setTimeout(restorePosition, 100);
  }

  return { init, getScrollPercent, updateBar };
})();
