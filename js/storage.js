/**
 * storage.js
 * Abstraction LocalStorage pour thème et progression de lecture
 */

const Storage = (() => {
  const PREFIX = "pe-guide:";

  /**
   * Lit une valeur JSON depuis le localStorage
   * @param {string} key
   * @param {*} fallback
   * @returns {*}
   */
  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  /**
   * Écrit une valeur JSON dans le localStorage
   * @param {string} key
   * @param {*} value
   */
  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.warn("[storage] Impossible d'écrire :", err);
    }
  }

  /**
   * Supprime une clé
   * @param {string} key
   */
  function remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
  }

  return { get, set, remove };
})();
