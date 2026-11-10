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
      { id: "foch", name: "Foch Bar" },
      { id: "label", name: "Label Bar" }
    ];
  })(),
  hours: {
    weekday: { open: "06:00", change: "14:00", close: "23:00" },
    weekend: { open: "07:00", change: "15:00", close: "23:00" }
  },
  minStaff: { morning: 1, evening: 1 },
  users: {
    admin: { password: "foch2026", role: "admin", name: "Administrator", id: "admin" },
    monika: { password: "foch2026", role: "zaposleni", name: "Monika Kukovec", id: "monika" },
    violeta: { password: "foch2026", role: "zaposleni", name: "Violeta Gorjup", id: "violeta" },
    naja: { password: "foch2026", role: "zaposleni", name: "Naja Bevc", id: "naja" },
    karin: { password: "foch2026", role: "zaposleni", name: "Karin Kolednik", id: "karin" },
    neza: { password: "foch2026", role: "zaposleni", name: "Neža Žigart", id: "neza" }
  },
  alumni: [],
  employees: [
    { id: "monika", name: "Monika Kukovec", role: "Strežba", contract: "redno", phone: "041 111 201", email: "monika.kukovec@fochbar.si", address: "Koroška cesta 12, Maribor", home: "foch", history: { "2026-06": 112, "2026-07": 96, "2026-08": 108 } },
    { id: "violeta", name: "Violeta Gorjup", role: "Strežba", contract: "redno", phone: "041 111 202", email: "violeta.gorjup@fochbar.si", address: "Partizanska 8, Maribor", home: "label", history: { "2026-06": 104, "2026-07": 100, "2026-08": 92 } },
    { id: "naja", name: "Naja Bevc", role: "Strežba", contract: "študent", phone: "041 111 203", email: "naja.bevc@fochbar.si", address: "Gosposvetska 21, Maribor", home: "foch", history: { "2026-06": 48, "2026-07": 56, "2026-08": 52 } },
    { id: "karin", name: "Karin Kolednik", role: "Strežba", contract: "popoldanski s.p.", phone: "041 111 204", email: "karin.kolednik@fochbar.si", address: "Titova 4, Maribor", home: "label", history: { "2026-06": 64, "2026-07": 72, "2026-08": 68 } },
    { id: "neza", name: "Neža Žigart", role: "Strežba", contract: "študent", phone: "041 111 205", email: "neza.zigart@fochbar.si", address: "Ljubljanska 9, Maribor", home: "foch", history: { "2026-06": 40, "2026-07": 44, "2026-08": 36 } }
  ],
  shifts: [
    { id: "s1", date: "2026-09-07", venue: "foch", employee: "monika", slot: "morning", start: "06:00", end: "14:00" },
    { id: "s2", date: "2026-09-07", venue: "foch", employee: "naja", slot: "evening", start: "16:00", end: "23:00" },
    { id: "s3", date: "2026-09-07", venue: "label", employee: "violeta", slot: "morning", start: "06:00", end: "14:00" },
    { id: "s4", date: "2026-09-07", venue: "label", employee: "karin", slot: "evening", start: "14:00", end: "23:00" },

    { id: "s5", date: "2026-09-08", venue: "foch", employee: "neza", slot: "morning", start: "06:00", end: "14:00" },
    { id: "s6", date: "2026-09-08", venue: "foch", employee: "karin", slot: "evening", start: "14:00", end: "23:00" },
    { id: "s7", date: "2026-09-08", venue: "label", employee: "violeta", slot: "evening", start: "14:00", end: "23:00" },

    { id: "s8", date: "2026-09-09", venue: "foch", employee: "monika", slot: "morning", start: "06:00", end: "14:00" },
    { id: "s9", date: "2026-09-09", venue: "foch", employee: "neza", slot: "evening", start: "14:00", end: "23:00" },
    { id: "s10", date: "2026-09-09", venue: "label", employee: "karin", slot: "evening", start: "14:00", end: "23:00" },

    { id: "s11", date: "2026-09-10", venue: "foch", employee: "violeta", slot: "evening", start: "14:00", end: "23:00" },
    { id: "s12", date: "2026-09-10", venue: "foch", employee: "naja", slot: "evening", start: "14:00", end: "23:00" },
    { id: "s13", date: "2026-09-10", venue: "label", employee: "monika", slot: "evening", start: "14:00", end: "23:00" },

    { id: "s14", date: "2026-09-11", venue: "foch", employee: "monika", slot: "morning", start: "06:00", end: "14:00" },
    { id: "s15", date: "2026-09-11", venue: "foch", employee: "karin", slot: "evening", start: "14:00", end: "23:00" },
    { id: "s16", date: "2026-09-11", venue: "label", employee: "violeta", slot: "evening", start: "14:00", end: "23:00" },
    { id: "s17", date: "2026-09-11", venue: "label", employee: "neza", slot: "evening", start: "14:00", end: "23:00" },

    { id: "s18", date: "2026-09-12", venue: "foch", employee: "naja", slot: "morning", start: "07:00", end: "15:00" },
    { id: "s19", date: "2026-09-12", venue: "foch", employee: "monika", slot: "evening", start: "15:00", end: "23:00" },
    { id: "s20", date: "2026-09-12", venue: "label", employee: "violeta", slot: "evening", start: "15:00", end: "23:00" },

    { id: "s21", date: "2026-09-13", venue: "foch", employee: "violeta", slot: "evening", start: "15:00", end: "23:00" },
    { id: "s22", date: "2026-09-13", venue: "label", employee: "monika", slot: "evening", start: "15:00", end: "23:00" }
  ],
  duties: [
    { date: "2026-09-07", venue: "foch", employee: "naja", kind: "Čiščenje toalet in lokala" },
    { date: "2026-09-08", venue: "label", employee: "violeta", kind: "Čiščenje toalet in lokala" },
    { date: "2026-09-09", venue: "foch", employee: "neza", kind: "Čiščenje toalet in lokala" },
    { date: "2026-09-10", venue: "label", employee: "monika", kind: "Čiščenje toalet in lokala" },
    { date: "2026-09-11", venue: "foch", employee: "karin", kind: "Zapiralna izmena + čiščenje" },
    { date: "2026-09-11", venue: "label", employee: "violeta", kind: "Zapiralna izmena + čiščenje" },
    { date: "2026-09-12", venue: "foch", employee: "monika", kind: "Čiščenje toalet in lokala" },
    { date: "2026-09-12", venue: "label", employee: "violeta", kind: "Čiščenje toalet in lokala" }
  ],
  leaves: [
    { id: "l1", employee: "naja", type: "prosto", from: "2026-09-13", to: "2026-09-13", status: "oddano", note: "Družinska obveznost" },
    { id: "l2", employee: "karin", type: "dopust", from: "2026-09-20", to: "2026-09-22", status: "oddano", note: "Dopust" },
    { id: "l3", employee: "neza", type: "bolniška", from: "2026-09-05", to: "2026-09-06", status: "odobreno", note: "Bolniška" },
    { id: "l4", employee: "monika", type: "dopust", from: "2026-07-13", to: "2026-07-17", status: "odobreno", note: "Dopust" },
    { id: "l5", employee: "violeta", type: "dopust", from: "2026-08-03", to: "2026-08-07", status: "odobreno", note: "Dopust" }
  ],
  swaps: [
    { id: "x1", type: "zamenjava", fromEmployee: "naja", fromShiftId: "s18", toEmployee: "monika", toShiftId: "s19", status: "caka_sodelavko", note: "Zvečer ne morem", created: "2026-09-08" },
    { id: "x2", type: "prevzem", fromEmployee: "karin", fromShiftId: "s10", toEmployee: "naja", toShiftId: "", status: "caka_vodjo", note: "Druga obveznost", created: "2026-09-08" },
    { id: "x3", type: "prevzem", fromEmployee: "monika", fromShiftId: "s1", toEmployee: "violeta", toShiftId: "", status: "odobreno", note: "Star primer", created: "2026-08-12" },
    { id: "x4", type: "zamenjava", fromEmployee: "monika", fromShiftId: "s8", toEmployee: "neza", toShiftId: "s9", status: "zavrnjeno", note: "Star primer", created: "2026-08-20" }
  ],
  takings: [
    { id: "p1", shiftId: "s1", date: "2026-09-07", venue: "foch", slot: "morning", employee: "monika", amount: 186.4, shortage: 0 },
    { id: "p2", shiftId: "s2", date: "2026-09-07", venue: "foch", slot: "evening", employee: "naja", amount: 312.2, shortage: 8.5 },
    { id: "p3", shiftId: "s3", date: "2026-09-07", venue: "label", slot: "morning", employee: "violeta", amount: 94.0, shortage: 0 },
    { id: "p4", shiftId: "s4", date: "2026-09-07", venue: "label", slot: "evening", employee: "karin", amount: 248.7, shortage: 3.2 }
  ],
  debts: [
    { id: "g1", created: "2026-09-08", venue: "foch", employee: "naja", guest: "Marko P.", invoice: "R-2026-118", amount: 24.5, reason: "Račun ob 23.00, pride jutri", status: "odprto" },
    { id: "g2", created: "2026-09-07", venue: "label", employee: "violeta", guest: "Ana T.", invoice: "R-2026-109", amount: 18, reason: "Pozabila denarnico", status: "odprto" },
    { id: "g3", created: "2026-09-07", venue: "foch", employee: "monika", guest: "Luka K.", invoice: "R-2026-112", amount: 42, reason: "Rojstni dan, doplača v petek", status: "odprto" },
    { id: "g4", created: "2026-09-06", venue: "foch", employee: "karin", guest: "Jan B.", invoice: "R-2026-101", amount: 15.8, reason: "Kratka, prinese v torek", status: "placano", paidAt: "2026-09-07" },
    { id: "g5", created: "2026-09-05", venue: "label", employee: "violeta", guest: "Tjaša M.", invoice: "R-2026-097", amount: 31, reason: "Zabava, ostalo odprto", status: "odprto" }
  ]
};
