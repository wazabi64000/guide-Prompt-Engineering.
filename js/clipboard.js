/**
 * clipboard.js
 * Copie le contenu des blocs prompt/code dans le presse-papiers
 */

const Clipboard = (() => {
  /**
   * Copie du texte dans le presse-papiers
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* fallback ci-dessous */
      }
    }

    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  /**
   * Affiche un retour visuel sur le bouton
   * @param {HTMLButtonElement} btn
   */
  function markCopied(btn) {
    const original = btn.textContent;
    btn.classList.add("is-copied");
    btn.textContent = "Copié !";
    btn.setAttribute("aria-label", "Contenu copié");

    window.setTimeout(() => {
      btn.classList.remove("is-copied");
      btn.textContent = original;
      btn.setAttribute("aria-label", "Copier le contenu");
    }, 1800);
  }

  /**
   * Initialise tous les boutons [data-copy]
   */
  function init() {
    document.addEventListener("click", async (event) => {
      const btn = event.target.closest("[data-copy]");
      if (!btn) return;

      const targetId = btn.getAttribute("data-copy");
      let text = "";

      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) text = el.textContent || "";
      } else {
        const block = btn.closest(".prompt-block, .code-block");
        const pre = block ? block.querySelector("pre") : null;
        text = pre ? pre.textContent || "" : "";
      }

      text = text.trim();
      if (!text) return;

      const ok = await copyText(text);
      if (ok) {
        markCopied(btn);
        if (typeof window.showToast === "function") {
          window.showToast("Prompt copié dans le presse-papiers");
        }
      }
    });
  }

  return { init, copyText };
})();
