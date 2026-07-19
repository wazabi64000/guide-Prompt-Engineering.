/**
 * app.js
 * Point d'entrée : toast + initialisation des modules
 * (pas de thème sombre)
 */

(function App() {
  /**
   * Affiche une notification temporaire
   * @param {string} message
   */
  function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  window.showToast = showToast;

  function initFooterYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFooterYear();
    Navigation.init();
    Clipboard.init();
    Search.init();
    Progress.init();
  });
})();
