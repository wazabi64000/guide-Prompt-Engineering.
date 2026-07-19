/**
 * navigation.js
 * Menu latéral, navigation fluide, accordéons, onglets, filtre bibliothèque
 */

const Navigation = (() => {
  let sidebar = null;
  let overlay = null;
  let menuToggle = null;
  let sectionObserver = null;

  /**
   * Ouvre / ferme le menu mobile
   * @param {boolean} open
   */
  function setSidebarOpen(open) {
    if (!sidebar || !overlay || !menuToggle) return;
    sidebar.classList.toggle("is-open", open);
    overlay.classList.toggle("is-visible", open);
    overlay.setAttribute("aria-hidden", String(!open));
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      const firstLink = sidebar.querySelector(".nav-list a");
      if (firstLink) firstLink.focus();
    }
  }

  /**
   * Met en évidence le lien de navigation correspondant à la section visible
   * @param {string} id
   */
  function setActiveNav(id) {
    const links = document.querySelectorAll(".nav-list a[href^='#']");
    links.forEach((link) => {
      const match = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", match);
      if (match) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /**
   * Observe les chapitres pour synchroniser le menu
   */
  function observeSections() {
    const sections = document.querySelectorAll(".chapter[id], .hero[id]");
    if (!("IntersectionObserver" in window) || sections.length === 0) return;

    sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0] && visible[0].target.id) {
          setActiveNav(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      }
    );

    sections.forEach((s) => sectionObserver.observe(s));
  }

  /**
   * Initialise les accordéons (ARIA)
   */
  function initAccordions() {
    document.querySelectorAll(".accordion").forEach((accordion) => {
      accordion.querySelectorAll(".accordion-trigger").forEach((trigger) => {
        const panelId = trigger.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;

        trigger.addEventListener("click", () => {
          const expanded = trigger.getAttribute("aria-expanded") === "true";
          trigger.setAttribute("aria-expanded", String(!expanded));
          panel.hidden = expanded;
        });
      });
    });
  }

  /**
   * Initialise les onglets (ARIA + clavier)
   */
  function initTabs() {
    document.querySelectorAll(".tabs").forEach((tabsRoot) => {
      const tabList = tabsRoot.querySelector('[role="tablist"]');
      if (!tabList) return;

      const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
      const panels = tabs
        .map((t) => document.getElementById(t.getAttribute("aria-controls")))
        .filter(Boolean);

      /**
       * @param {number} index
       */
      function activate(index) {
        tabs.forEach((tab, i) => {
          const selected = i === index;
          tab.setAttribute("aria-selected", String(selected));
          tab.tabIndex = selected ? 0 : -1;
          if (panels[i]) panels[i].hidden = !selected;
        });
      }

      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activate(index));
        tab.addEventListener("keydown", (e) => {
          let next = index;
          if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
          else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
          else if (e.key === "Home") next = 0;
          else if (e.key === "End") next = tabs.length - 1;
          else return;

          e.preventDefault();
          activate(next);
          tabs[next].focus();
        });
      });

      const current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      activate(current >= 0 ? current : 0);
    });
  }

  /**
   * Filtres de la bibliothèque de prompts
   */
  function initLibraryFilters() {
    const chips = document.querySelectorAll(".filter-chip[data-filter]");
    const categories = document.querySelectorAll(".library-category[data-category]");
    if (!chips.length) return;

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.getAttribute("data-filter");
        chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));

        categories.forEach((cat) => {
          const catId = cat.getAttribute("data-category");
          const show = filter === "all" || filter === catId;
          cat.hidden = !show;
        });
      });
    });
  }

  /**
   * Navigation fluide via ancres
   */
  function initSmoothAnchors() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", "#" + id);
      setSidebarOpen(false);
      setActiveNav(id);

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
    });
  }

  /**
   * Point d'entrée
   */
  function init() {
    sidebar = document.getElementById("sidebar");
    overlay = document.getElementById("sidebar-overlay");
    menuToggle = document.getElementById("menu-toggle");
    const menuClose = document.getElementById("sidebar-close");

    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        const open = menuToggle.getAttribute("aria-expanded") !== "true";
        setSidebarOpen(open);
      });
    }

    if (menuClose) {
      menuClose.addEventListener("click", () => setSidebarOpen(false));
    }

    if (overlay) {
      overlay.addEventListener("click", () => setSidebarOpen(false));
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    });

    initSmoothAnchors();
    observeSections();
    initAccordions();
    initTabs();
    initLibraryFilters();
  }

  return { init, setSidebarOpen, setActiveNav };
})();
