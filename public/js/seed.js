/**
 * Vzorčni podatki se ustvarijo šele ob kliku (localStorage).
 * Gesla so naključna – nikoli hardcodana v kodi.
 */
(function () {
  const KEYS = {
    users: "foch_users_v1",
    venues: "foch_venues_v1",
    shifts: "foch_shifts_v3",
    employees: "foch_employees_v1",
    leaves: "foch_leaves_v1",
    swaps: "foch_swaps_v1",
    takings: "foch_takings_v1",
    debts: "foch_debts_v1",
    alumni: "foch_alumni_v1",
  };

  function randomPassword(len) {
    const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(len || 10);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  }

  function buildSample() {
    const adminPass = randomPassword(12);
    const staffPass = randomPassword(12);

    const users = {
      admin: { password: adminPass, role: "admin", name: "Administrator", id: "admin" },
      ana: { password: staffPass, role: "zaposleni", name: "Ana Primer", id: "ana" },
      marko: { password: staffPass, role: "zaposleni", name: "Marko Primer", id: "marko" },
      sara: { password: staffPass, role: "zaposleni", name: "Sara Primer", id: "sara" },
      luka: { password: staffPass, role: "zaposleni", name: "Luka Primer", id: "luka" },
      eva: { password: staffPass, role: "zaposleni", name: "Eva Primer", id: "eva" },
    };

    const venues = [
      { id: "foch", name: "Lokal A" },
      { id: "label", name: "Lokal B" },
    ];

    const employees = [
      { id: "ana", name: "Ana Primer", role: "Strežba", contract: "redno", phone: "", email: "", address: "", home: "foch", history: { "2026-06": 112, "2026-07": 96, "2026-08": 108 } },
      { id: "marko", name: "Marko Primer", role: "Strežba", contract: "redno", phone: "", email: "", address: "", home: "label", history: { "2026-06": 104, "2026-07": 100, "2026-08": 92 } },
      { id: "sara", name: "Sara Primer", role: "Strežba", contract: "študent", phone: "", email: "", address: "", home: "foch", history: { "2026-06": 48, "2026-07": 56, "2026-08": 52 } },
      { id: "luka", name: "Luka Primer", role: "Strežba", contract: "popoldanski s.p.", phone: "", email: "", address: "", home: "label", history: { "2026-06": 64, "2026-07": 72, "2026-08": 68 } },
      { id: "eva", name: "Eva Primer", role: "Strežba", contract: "študent", phone: "", email: "", address: "", home: "foch", history: { "2026-06": 40, "2026-07": 44, "2026-08": 36 } },
    ];

    const shifts = [
      { id: "s1", date: "2026-09-07", venue: "foch", employee: "ana", slot: "morning", start: "06:00", end: "14:00" },
      { id: "s2", date: "2026-09-07", venue: "foch", employee: "sara", slot: "evening", start: "16:00", end: "23:00" },
      { id: "s3", date: "2026-09-07", venue: "label", employee: "marko", slot: "morning", start: "06:00", end: "14:00" },
      { id: "s4", date: "2026-09-07", venue: "label", employee: "luka", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s5", date: "2026-09-08", venue: "foch", employee: "eva", slot: "morning", start: "06:00", end: "14:00" },
      { id: "s6", date: "2026-09-08", venue: "foch", employee: "luka", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s7", date: "2026-09-08", venue: "label", employee: "marko", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s8", date: "2026-09-09", venue: "foch", employee: "ana", slot: "morning", start: "06:00", end: "14:00" },
      { id: "s9", date: "2026-09-09", venue: "foch", employee: "eva", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s10", date: "2026-09-09", venue: "label", employee: "luka", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s11", date: "2026-09-10", venue: "foch", employee: "marko", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s12", date: "2026-09-10", venue: "foch", employee: "sara", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s13", date: "2026-09-10", venue: "label", employee: "ana", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s14", date: "2026-09-11", venue: "foch", employee: "ana", slot: "morning", start: "06:00", end: "14:00" },
      { id: "s15", date: "2026-09-11", venue: "foch", employee: "luka", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s16", date: "2026-09-11", venue: "label", employee: "marko", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s17", date: "2026-09-11", venue: "label", employee: "eva", slot: "evening", start: "14:00", end: "23:00" },
      { id: "s18", date: "2026-09-12", venue: "foch", employee: "sara", slot: "morning", start: "07:00", end: "15:00" },
      { id: "s19", date: "2026-09-12", venue: "foch", employee: "ana", slot: "evening", start: "15:00", end: "23:00" },
      { id: "s20", date: "2026-09-12", venue: "label", employee: "marko", slot: "evening", start: "15:00", end: "23:00" },
      { id: "s21", date: "2026-09-13", venue: "foch", employee: "marko", slot: "evening", start: "15:00", end: "23:00" },
      { id: "s22", date: "2026-09-13", venue: "label", employee: "ana", slot: "evening", start: "15:00", end: "23:00" },
    ];

    const duties = [
      { date: "2026-09-07", venue: "foch", employee: "sara", kind: "Čiščenje toalet in lokala" },
      { date: "2026-09-08", venue: "label", employee: "marko", kind: "Čiščenje toalet in lokala" },
      { date: "2026-09-09", venue: "foch", employee: "eva", kind: "Čiščenje toalet in lokala" },
      { date: "2026-09-10", venue: "label", employee: "ana", kind: "Čiščenje toalet in lokala" },
      { date: "2026-09-11", venue: "foch", employee: "luka", kind: "Zapiralna izmena + čiščenje" },
      { date: "2026-09-11", venue: "label", employee: "marko", kind: "Zapiralna izmena + čiščenje" },
      { date: "2026-09-12", venue: "foch", employee: "ana", kind: "Čiščenje toalet in lokala" },
      { date: "2026-09-12", venue: "label", employee: "marko", kind: "Čiščenje toalet in lokala" },
    ];

    const leaves = [
      { id: "l1", employee: "sara", type: "prosto", from: "2026-09-13", to: "2026-09-13", status: "oddano", note: "Osebno" },
      { id: "l2", employee: "luka", type: "dopust", from: "2026-09-20", to: "2026-09-22", status: "oddano", note: "Dopust" },
      { id: "l3", employee: "eva", type: "bolniška", from: "2026-09-05", to: "2026-09-06", status: "odobreno", note: "Bolniška" },
      { id: "l4", employee: "ana", type: "dopust", from: "2026-07-13", to: "2026-07-17", status: "odobreno", note: "Dopust" },
      { id: "l5", employee: "marko", type: "dopust", from: "2026-08-03", to: "2026-08-07", status: "odobreno", note: "Dopust" },
    ];

    const swaps = [
      { id: "x1", type: "zamenjava", fromEmployee: "sara", fromShiftId: "s18", toEmployee: "ana", toShiftId: "s19", status: "caka_sodelavko", note: "Zvečer ne morem", created: "2026-09-08" },
      { id: "x2", type: "prevzem", fromEmployee: "luka", fromShiftId: "s10", toEmployee: "sara", toShiftId: "", status: "caka_vodjo", note: "Druga obveznost", created: "2026-09-08" },
      { id: "x3", type: "prevzem", fromEmployee: "ana", fromShiftId: "s1", toEmployee: "marko", toShiftId: "", status: "odobreno", note: "Star primer", created: "2026-08-12" },
      { id: "x4", type: "zamenjava", fromEmployee: "ana", fromShiftId: "s8", toEmployee: "eva", toShiftId: "s9", status: "zavrnjeno", note: "Star primer", created: "2026-08-20" },
    ];

    const takings = [
      { id: "p1", shiftId: "s1", date: "2026-09-07", venue: "foch", slot: "morning", employee: "ana", amount: 186.4, shortage: 0 },
      { id: "p2", shiftId: "s2", date: "2026-09-07", venue: "foch", slot: "evening", employee: "sara", amount: 312.2, shortage: 8.5 },
      { id: "p3", shiftId: "s3", date: "2026-09-07", venue: "label", slot: "morning", employee: "marko", amount: 94.0, shortage: 0 },
      { id: "p4", shiftId: "s4", date: "2026-09-07", venue: "label", slot: "evening", employee: "luka", amount: 248.7, shortage: 3.2 },
    ];

    const debts = [
      { id: "g1", created: "2026-09-08", venue: "foch", employee: "sara", guest: "Gost A", invoice: "R-1001", amount: 24.5, reason: "Odprt račun", status: "odprto" },
      { id: "g2", created: "2026-09-07", venue: "label", employee: "marko", guest: "Gost B", invoice: "R-1002", amount: 18, reason: "Odprt račun", status: "odprto" },
      { id: "g3", created: "2026-09-07", venue: "foch", employee: "ana", guest: "Gost C", invoice: "R-1003", amount: 42, reason: "Odprt račun", status: "odprto" },
      { id: "g4", created: "2026-09-06", venue: "foch", employee: "luka", guest: "Gost D", invoice: "R-1004", amount: 15.8, reason: "Odprt račun", status: "placano", paidAt: "2026-09-07" },
      { id: "g5", created: "2026-09-05", venue: "label", employee: "marko", guest: "Gost E", invoice: "R-1005", amount: 31, reason: "Odprt račun", status: "odprto" },
    ];

    return {
      users,
      venues,
      employees,
      shifts,
      duties,
      leaves,
      swaps,
      takings,
      debts,
      alumni: [],
      credentials: {
        adminUser: "admin",
        adminPass,
        staffUser: "ana",
        staffPass,
      },
    };
  }

  function applySampleSeed() {
    const sample = buildSample();
    localStorage.setItem(KEYS.users, JSON.stringify(sample.users));
    localStorage.setItem(KEYS.venues, JSON.stringify(sample.venues));
    localStorage.setItem(KEYS.employees, JSON.stringify(sample.employees));
    localStorage.setItem(KEYS.shifts, JSON.stringify(sample.shifts));
    localStorage.setItem(KEYS.leaves, JSON.stringify(sample.leaves));
    localStorage.setItem(KEYS.swaps, JSON.stringify(sample.swaps));
    localStorage.setItem(KEYS.takings, JSON.stringify(sample.takings));
    localStorage.setItem(KEYS.debts, JSON.stringify(sample.debts));
    localStorage.setItem(KEYS.alumni, JSON.stringify(sample.alumni));
    localStorage.setItem("foch_duties_v1", JSON.stringify(sample.duties));

    if (typeof FOCH !== "undefined") {
      FOCH.users = sample.users;
      FOCH.venues = sample.venues;
      FOCH.employees = sample.employees;
      FOCH.shifts = sample.shifts;
      FOCH.duties = sample.duties;
      FOCH.leaves = sample.leaves;
      FOCH.swaps = sample.swaps;
      FOCH.takings = sample.takings;
      FOCH.debts = sample.debts;
      FOCH.alumni = sample.alumni;
    }

    return sample.credentials;
  }

  window.applySampleSeed = applySampleSeed;
})();
