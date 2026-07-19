/**
 * search.js
 * Recherche plein texte dans les titres et paragraphes du guide
 */

const Search = (() => {
  /** @type {{ id: string, title: string, text: string }[]} */
  let index = [];
  let input = null;
  let resultsEl = null;
  let focusIndex = -1;

  /**
   * Construit l'index de recherche à partir du DOM
   */
  function buildIndex() {
    index = [];
    document.querySelectorAll(".chapter[id], #introduction").forEach((section) => {
      const id = section.id;
      const titleEl = section.querySelector("h1, h2");
      const title = titleEl ? titleEl.textContent.trim() : id;

      const parts = [];
      section.querySelectorAll("h2, h3, h4, p, li").forEach((el) => {
        const t = el.textContent.trim();
        if (t) parts.push(t);
      });

      index.push({
        id,
        title,
        text: (title + " " + parts.join(" ")).toLowerCase(),
      });
    });

    // Sous-sections avec id (concepts, catégories bibliothèque)
    document.querySelectorAll(".chapter [id]").forEach((el) => {
      if (el.classList.contains("chapter")) return;
      const heading = el.matches("h3, h4") ? el : el.querySelector("h3, h4");
      const title = heading
        ? heading.textContent.trim()
        : (el.getAttribute("aria-label") || el.id);
      const text = (el.textContent || "").toLowerCase();
      if (title && el.id) {
        index.push({ id: el.id, title, text });
      }
    });
  }

  /**
   * Échappe le HTML
   * @param {string} s
   */
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Surligne la requête dans un titre
   * @param {string} title
   * @param {string} query
   */
  function highlight(title, query) {
    const safe = escapeHtml(title);
    if (!query) return safe;
    const re = new RegExp("(" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return safe.replace(re, "<mark>$1</mark>");
  }

  /**
   * Affiche les résultats
   * @param {string} query
   */
  function render(query) {
    if (!resultsEl) return;
    const q = query.trim().toLowerCase();
    focusIndex = -1;

    if (q.length < 2) {
      resultsEl.classList.remove("is-open");
      resultsEl.innerHTML = "";
      resultsEl.hidden = true;
      return;
    }

    const matches = index
      .filter((item) => item.text.includes(q) || item.title.toLowerCase().includes(q))
      .slice(0, 12);

    if (matches.length === 0) {
      resultsEl.innerHTML = '<li class="search-empty" role="option">Aucun résultat</li>';
      resultsEl.classList.add("is-open");
      resultsEl.hidden = false;
      return;
    }

    resultsEl.innerHTML = matches
      .map(
        (m, i) =>
          `<li role="option" id="search-opt-${i}">
            <button type="button" data-target="${escapeHtml(m.id)}">${highlight(m.title, q)}</button>
          </li>`
      )
      .join("");

    resultsEl.classList.add("is-open");
    resultsEl.hidden = false;
  }

  /**
   * Navigue vers un résultat
   * @param {string} id
   */
  function goTo(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", "#" + id);
    close();
    if (typeof Navigation !== "undefined") {
      Navigation.setSidebarOpen(false);
      Navigation.setActiveNav(id);
    }
  }

  function close() {
    if (!resultsEl || !input) return;
    resultsEl.classList.remove("is-open");
    resultsEl.innerHTML = "";
    resultsEl.hidden = true;
    focusIndex = -1;
  }

  /**
   * Met à jour le focus clavier dans la liste
   */
  function updateFocus() {
    if (!resultsEl) return;
    const buttons = resultsEl.querySelectorAll("button[data-target]");
    buttons.forEach((btn, i) => {
      btn.classList.toggle("is-focused", i === focusIndex);
    });
    if (focusIndex >= 0 && buttons[focusIndex]) {
      buttons[focusIndex].focus();
    }
  }

  /**
   * Lie un champ de recherche
   * @param {HTMLInputElement} field
   * @param {HTMLElement} list
   */
  function bindField(field, list) {
    field.addEventListener("input", () => render(field.value));
    field.addEventListener("keydown", (e) => {
      const buttons = list.querySelectorAll("button[data-target]");
      if (e.key === "Escape") {
        close();
        field.focus();
        return;
      }
      if (e.key === "ArrowDown" && buttons.length) {
        e.preventDefault();
        focusIndex = Math.min(focusIndex + 1, buttons.length - 1);
        updateFocus();
      } else if (e.key === "ArrowUp" && buttons.length) {
        e.preventDefault();
        focusIndex = Math.max(focusIndex - 1, 0);
        updateFocus();
      } else if (e.key === "Enter" && focusIndex >= 0 && buttons[focusIndex]) {
        e.preventDefault();
        goTo(buttons[focusIndex].getAttribute("data-target"));
      }
    });

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-target]");
      if (!btn) return;
      goTo(btn.getAttribute("data-target"));
    });
  }

  function init() {
    buildIndex();

    input = document.getElementById("search-input");
    resultsEl = document.getElementById("search-results");
    if (input && resultsEl) bindField(input, resultsEl);

    const mobileInput = document.getElementById("search-input-mobile");
    const mobileResults = document.getElementById("search-results-mobile");
    if (mobileInput && mobileResults) bindField(mobileInput, mobileResults);

    document.addEventListener("click", (e) => {
      if (e.target.closest(".search-wrap")) return;
      close();
    });
  }

  return { init, buildIndex };
})();
