/**
 * Data layer abstrakcija (trenutno localStorage).
 * Kasneje zamenjaj implementacijo za backend/API.
 */
const Storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  getSession(key) {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw == null) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  clearSession(key) {
    sessionStorage.removeItem(key);
  },
};

window.Storage = Storage;
