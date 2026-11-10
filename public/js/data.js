/** Privzeta lupina – brez gesel in brez osebnih podatkov v shipped datoteki. */
const FOCH = {
  weekStart: "2026-09-07",
  weekLabel: "7.–13. september 2026",
  venues: (function () {
    try {
      const raw = localStorage.getItem("foch_venues_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {
      /* privzeti lokali */
    }
    return [
      { id: "foch", name: "Lokal A" },
      { id: "label", name: "Lokal B" },
    ];
  })(),
  hours: {
    weekday: { open: "06:00", change: "14:00", close: "23:00" },
    weekend: { open: "07:00", change: "15:00", close: "23:00" },
  },
  minStaff: { morning: 1, evening: 1 },
  users: {},
  alumni: [],
  employees: [],
  shifts: [],
  duties: [],
  leaves: [],
  swaps: [],
  takings: [],
  debts: [],
};

try {
  const rawUsers = localStorage.getItem("foch_users_v1");
  if (rawUsers) FOCH.users = JSON.parse(rawUsers) || {};
} catch (e) {
  FOCH.users = {};
}
