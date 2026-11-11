const DAYS = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];
const DAYS_FULL = ["ponedeljek", "torek", "sreda", "četrtek", "petek", "sobota", "nedelja"];
const TODAY = "2026-09-08";
const SHIFT_STORE = "foch_shifts_v3";
const EMP_STORE = "foch_employees_v1";
const LEAVE_STORE = "foch_leaves_v1";
const SWAP_STORE = "foch_swaps_v1";
const USER_STORE = "foch_users_v1";
const TAKE_STORE = "foch_takings_v1";
const DEBT_STORE = "foch_debts_v1";
const ALUMNI_STORE = "foch_alumni_v1";
const CONTRACTS = ["redno", "študent", "popoldanski s.p."];
const LEAVE_TYPES = ["dopust", "bolniška", "prosto"];
const MONTHS_SL = ["januar", "februar", "marec", "april", "maj", "junij", "julij", "avgust", "september", "oktober", "november", "december"];
const CURRENT_MONTH = TODAY.slice(0, 7);
const NEXT_MONTH = "2026-10";
const PLAN_MONTHS = [CURRENT_MONTH, NEXT_MONTH];

function getSession() {
  const raw = sessionStorage.getItem("foch_user");
  if (!raw) {
    location.replace("./index.html");
    return null;
  }
  try {
    const session = JSON.parse(raw);
    if (!session || !session.username || !session.role) {
      sessionStorage.removeItem("foch_user");
      location.replace("./index.html");
      return null;
    }
    return session;
  } catch (e) {
    sessionStorage.removeItem("foch_user");
    location.replace("./index.html");
    return null;
  }
}

function emp(id) {
  return FOCH.employees.find((e) => e.id === id) || (FOCH.alumni || []).find((e) => e.id === id);
}

function venueName(id) {
  return FOCH.venues.find((v) => v.id === id)?.name || id;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISO(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseISO(s) {
  return new Date(s + "T12:00:00");
}

function addDays(date, n) {
  const d = parseISO(date);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

function mondayOf(date) {
  return addDays(date, -weekdayIndex(date));
}

function weekDates(start) {
  const base = start || FOCH.weekStart;
  return Array.from({ length: 7 }, (_, i) => addDays(base, i));
}

function weeksForMonth(month) {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const last = `${month}-${pad2(lastDay)}`;
  const out = [];
  let cur = mondayOf(`${month}-01`);
  for (let i = 0; i < 8; i++) {
    const days = weekDates(cur);
    if (days.some((d) => d.startsWith(month))) out.push(cur);
    if (days[6] >= last) break;
    cur = addDays(cur, 7);
  }
  return out;
}

function weekCaption(start) {
  const days = weekDates(start);
  const a = parseISO(days[0]);
  const b = parseISO(days[6]);
  const sameMonth = a.getMonth() === b.getMonth();
  if (sameMonth) return `${a.getDate()}.–${b.getDate()}. ${MONTHS_SL[a.getMonth()]} ${a.getFullYear()}`;
  return `${a.getDate()}. ${MONTHS_SL[a.getMonth()]} – ${b.getDate()}. ${MONTHS_SL[b.getMonth()]} ${b.getFullYear()}`;
}

function dateSpan(from, to) {
  const out = [];
  let cur = from;
  while (cur <= to) {
    out.push(cur);
    cur = addDays(cur, 1);
    if (out.length > 62) break;
  }
  return out;
}

function weekdayIndex(date) {
  const n = new Date(date + "T12:00:00").getDay();
  return n === 0 ? 6 : n - 1;
}

function isWeekend(date) {
  const n = weekdayIndex(date);
  return n >= 5;
}

function hoursFor(date) {
  return isWeekend(date) ? FOCH.hours.weekend : FOCH.hours.weekday;
}

function slotDefaults(date, slot) {
  const h = hoursFor(date);
  return slot === "morning" ? { start: h.open, end: h.change } : { start: h.change, end: h.close };
}

function slotLabel(date, slot) {
  const d = slotDefaults(date, slot);
  return slot === "morning" ? `Dopoldan ${d.start}–${d.end}` : `Popoldan ${d.start}–${d.end}`;
}

function minFor() {
  return 1;
}

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusBadge(status) {
  const map = {
    oddano: "wait",
    odobreno: "yes",
    zavrnjeno: "no",
    caka_sodelavko: "wait",
    caka_vodjo: "wait"
  };
  const label = {
    caka_sodelavko: "čaka sodelavko",
    caka_vodjo: "čaka vodjo"
  }[status] || status;
  return `<span class="badge ${map[status] || ""}">${label}</span>`;
}

function swapTypeLabel(type) {
  return type === "zamenjava" ? "Zamenjava" : "Prevzem";
}

function swapRequestCount(employeeId) {
  return (FOCH.swaps || []).filter((s) => s.fromEmployee === employeeId).length;
}

function leaveLabel(type) {
  return { dopust: "Dopust", bolniška: "Bolniška", prosto: "Prosto" }[type] || type;
}

function fmtDay(date) {
  const d = new Date(date + "T12:00:00");
  return `${DAYS_FULL[weekdayIndex(date)]}, ${d.getDate()}. ${d.getMonth() + 1}.`;
}

function loadShifts() {
  try {
    const raw = localStorage.getItem(SHIFT_STORE);
    if (raw) FOCH.shifts = JSON.parse(raw);
  } catch (err) {
    /* demo podatki */
  }
}

function saveShifts() {
  localStorage.setItem(SHIFT_STORE, JSON.stringify(FOCH.shifts));
}

function loadEmployees() {
  try {
    const raw = localStorage.getItem(EMP_STORE);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved)) FOCH.employees = saved;
  } catch (err) {
    /* demo */
  }
}

function saveEmployees() {
  localStorage.setItem(EMP_STORE, JSON.stringify(FOCH.employees));
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USER_STORE);
    if (raw) FOCH.users = JSON.parse(raw);
  } catch (err) {
    /* demo */
  }
}

function saveUsers() {
  localStorage.setItem(USER_STORE, JSON.stringify(FOCH.users));
}

function loadTakings() {
  try {
    const raw = localStorage.getItem(TAKE_STORE);
    if (raw) FOCH.takings = JSON.parse(raw);
  } catch (err) {
    /* demo */
  }
  if (!FOCH.takings) FOCH.takings = [];
}

function saveTakings() {
  localStorage.setItem(TAKE_STORE, JSON.stringify(FOCH.takings));
}

function loadDebts() {
  try {
    const raw = localStorage.getItem(DEBT_STORE);
    if (raw) FOCH.debts = JSON.parse(raw);
  } catch (err) {
    /* demo */
  }
  if (!FOCH.debts) FOCH.debts = [];
}

function saveDebts() {
  localStorage.setItem(DEBT_STORE, JSON.stringify(FOCH.debts));
}

function loadAlumni() {
  try {
    const raw = localStorage.getItem(ALUMNI_STORE);
    if (raw) FOCH.alumni = JSON.parse(raw);
  } catch (err) {
    /* demo */
  }
  if (!FOCH.alumni) FOCH.alumni = [];
}

function saveAlumni() {
  localStorage.setItem(ALUMNI_STORE, JSON.stringify(FOCH.alumni));
}

function nextTakeId() {
  return "p" + (FOCH.takings.reduce((m, x) => Math.max(m, parseInt(String(x.id).slice(1), 10) || 0), 0) + 1);
}

function nextDebtId() {
  return "g" + (FOCH.debts.reduce((m, x) => Math.max(m, parseInt(String(x.id).slice(1), 10) || 0), 0) + 1);
}

function parseMoney(v) {
  const n = Number(String(v || "0").replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function fmtEur(n) {
  return (Number(n) || 0).toLocaleString("sl-SI", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function takingForShift(shiftId) {
  return FOCH.takings.find((t) => t.shiftId === shiftId);
}

function slugName(name) {
  const base = String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 16) || "zaposlena";
  let id = base;
  let n = 2;
  while (FOCH.users[id] || FOCH.employees.some((e) => e.id === id)) {
    id = base + n;
    n += 1;
  }
  return id;
}

function loadLeaves() {
  try {
    const raw = localStorage.getItem(LEAVE_STORE);
    if (raw) FOCH.leaves = JSON.parse(raw);
  } catch (err) {
    /* demo */
  }
}

function saveLeaves() {
  localStorage.setItem(LEAVE_STORE, JSON.stringify(FOCH.leaves));
}

function loadSwaps() {
  try {
    const raw = localStorage.getItem(SWAP_STORE);
    if (raw) FOCH.swaps = JSON.parse(raw);
  } catch (err) {
    /* demo */
  }
  if (!FOCH.swaps) FOCH.swaps = [];
}

function saveSwaps() {
  localStorage.setItem(SWAP_STORE, JSON.stringify(FOCH.swaps));
}

function nextSwapId() {
  return "x" + (FOCH.swaps.reduce((m, s) => Math.max(m, parseInt(String(s.id).slice(1), 10) || 0), 0) + 1);
}

function shiftById(id) {
  return FOCH.shifts.find((s) => s.id === id);
}

function describeShift(s) {
  if (!s) return "izmena ni več v urniku";
  return `${fmtDay(s.date)} · ${venueName(s.venue)} · ${s.slot === "morning" ? "dopoldan" : "popoldan"} ${s.start}–${s.end}`;
}

function nextLeaveId() {
  return "l" + (FOCH.leaves.reduce((m, l) => Math.max(m, parseInt(String(l.id).slice(1), 10) || 0), 0) + 1);
}

function leaveCovers(leave, date) {
  return leave.from <= date && date <= leave.to;
}

function approvedLeaveOn(employeeId, date) {
  return FOCH.leaves.find(
    (l) => l.employee === employeeId && l.status === "odobreno" && leaveCovers(l, date)
  );
}

function minutesBetween(start, end) {
  const [sh, sm] = String(start).split(":").map(Number);
  const [eh, em] = String(end).split(":").map(Number);
  let a = sh * 60 + (sm || 0);
  let b = eh * 60 + (em || 0);
  if (b <= a) b += 24 * 60;
  return b - a;
}

function shiftHours(s) {
  return minutesBetween(s.start, s.end) / 60;
}

function fmtHours(n) {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function monthHours(employeeId, month) {
  return FOCH.shifts
    .filter((s) => s.employee === employeeId && s.date.startsWith(month))
    .reduce((sum, s) => sum + shiftHours(s), 0);
}

function monthSplit(employeeId, month) {
  const list = FOCH.shifts.filter((s) => s.employee === employeeId && s.date.startsWith(month));
  const worked = list.filter((s) => s.date <= TODAY).reduce((sum, s) => sum + shiftHours(s), 0);
  const planned = list.filter((s) => s.date > TODAY).reduce((sum, s) => sum + shiftHours(s), 0);
  return { worked, planned, total: worked + planned };
}

function countLeaveDays(employeeId, type) {
  return FOCH.leaves
    .filter((l) => l.employee === employeeId && l.type === type && l.status === "odobreno")
    .reduce((n, l) => {
      const a = new Date(l.from + "T12:00:00");
      const b = new Date(l.to + "T12:00:00");
      return n + Math.round((b - a) / 86400000) + 1;
    }, 0);
}

function monthTitle(key) {
  const [y, m] = key.split("-");
  return `${MONTHS_SL[Number(m) - 1]} ${y}`;
}

function nextShiftId() {
  return "s" + (FOCH.shifts.reduce((m, s) => Math.max(m, parseInt(s.id.slice(1), 10) || 0), 0) + 1);
}

const user = getSession();
if (!user) {
  /* preusmeritev na prijavo */
} else {
  loadUsers();
  try {
    const rawVenues = localStorage.getItem("foch_venues_v1");
    if (rawVenues) {
      const parsed = JSON.parse(rawVenues);
      if (Array.isArray(parsed) && parsed.length) FOCH.venues = parsed;
    }
  } catch (e) {
    /* privzeti lokali */
  }
  try {
    const rawDuties = localStorage.getItem("foch_duties_v1");
    if (rawDuties) FOCH.duties = JSON.parse(rawDuties) || [];
  } catch (e) {
    FOCH.duties = FOCH.duties || [];
  }
  loadShifts();
  loadEmployees();
  loadLeaves();
  loadSwaps();
  loadTakings();
  loadDebts();
  loadAlumni();

  let planMonth = CURRENT_MONTH;
  let currentWeekStart = mondayOf(TODAY);
  FOCH.weekStart = currentWeekStart;

  function updateWeekbar() {
    document.getElementById("week-label").textContent = weekCaption(currentWeekStart);
  }

  document.getElementById("who-name").textContent = user.name;
  document.getElementById("who-role").textContent = user.role === "admin" ? "Administracija" : "Zaposleni";
  updateWeekbar();
  document.getElementById("logout").addEventListener("click", () => {
    sessionStorage.removeItem("foch_user");
    location.replace("./index.html");
  });

  document.querySelectorAll(".nav [data-view]").forEach((btn) => {
    if (btn.dataset.role === "admin" && user.role !== "admin") btn.remove();
    if (btn.dataset.role === "staff" && user.role === "admin") btn.remove();
  });

  const views = {
    pregled: document.getElementById("view-pregled"),
    urnik: document.getElementById("view-urnik"),
    dopusti: document.getElementById("view-dopusti"),
    menjave: document.getElementById("view-menjave"),
    dolzniki: document.getElementById("view-dolzniki"),
    izkupicek: document.getElementById("view-izkupicek"),
    ekipa: document.getElementById("view-ekipa")
  };

  function showView(id) {
    Object.entries(views).forEach(([key, el]) => el.classList.toggle("hidden", key !== id));
    document.querySelectorAll(".nav [data-view]").forEach((b) => {
      b.classList.toggle("active", b.dataset.view === id);
    });
    if (id === "urnik") renderUrnik();
    if (id === "dopusti") renderDopusti();
    if (id === "menjave") renderMenjave();
    if (id === "dolzniki") renderDolzniki();
    if (id === "izkupicek") renderIzkupicek();
    if (id === "ekipa" && user.role === "admin") renderEkipa();
    if (id === "pregled") {
      if (user.role === "admin") renderAdminPregled();
      else renderStaffPregled();
    }
  }

  document.querySelector(".nav").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-view]");
    if (btn) showView(btn.dataset.view);
  });

  function shiftsOn(date, venue, slot) {
    return FOCH.shifts.filter(
      (s) => s.date === date && (!venue || s.venue === venue) && (!slot || s.slot === slot)
    );
  }

  function dutiesOn(date, venue) {
    return FOCH.duties.filter((d) => d.date === date && (!venue || d.venue === venue));
  }

  function coverageToday() {
    return FOCH.venues
      .map((v) => {
        const list = shiftsOn(TODAY, v.id);
        const morning = shiftsOn(TODAY, v.id, "morning");
        const evening = shiftsOn(TODAY, v.id, "evening");
        const ok = morning.length >= 1 && evening.length >= 1;
        const names = list
          .map((s) => `<div>${emp(s.employee).name.split(" ")[0]} · ${s.start}–${s.end} (${s.slot === "morning" ? "dopoldan" : "popoldan"})</div>`)
          .join("");
        return `<article class="kpi ${ok ? "ok" : "warn"}">
        <div class="name">${v.name} ${ok ? '<span class="badge ok">pokrito</span>' : '<span class="badge warn">luknja</span>'}</div>
        <div class="stat">dopoldan ${morning.length}/1 · popoldan ${evening.length}/1<br>${names || "Nihče ni razporejen."}</div>
      </article>`;
      })
      .join("");
  }

  function hoursLadder() {
    return FOCH.employees
      .map((e) => ({ e, ...monthSplit(e.id, CURRENT_MONTH) }))
      .sort((a, b) => b.total - a.total)
      .map((row, i) => {
        const max = Math.max(
          ...FOCH.employees.map((x) => monthSplit(x.id, CURRENT_MONTH).total),
          1
        );
        const pct = Math.round((row.total / max) * 100);
        return `<div class="rank-row">
          <span class="rank-n">${i + 1}</span>
          <div class="rank-body">
            <div class="rank-top"><b>${row.e.name}</b><span>${fmtHours(row.total)} h</span></div>
            <div class="rank-bar"><i style="width:${pct}%"></i></div>
            <div class="t">oddelane ${fmtHours(row.worked)} h · planirane ${fmtHours(row.planned)} h</div>
          </div>
        </div>`;
      })
      .join("");
  }

  function pendingLeaves() {
    const open = FOCH.leaves.filter((l) => l.status === "oddano");
    if (!open.length) return `<p class="muted">Ni čakajočih prošenj.</p>`;
    return open
      .map((l) => {
        const e = emp(l.employee);
        return `<div class="row">
        <div><b>${e.name}</b><div class="t">${leaveLabel(l.type)} · ${l.from}${l.from !== l.to ? "–" + l.to : ""} · ${l.note}</div></div>
        ${statusBadge(l.status)}
      </div>`;
      })
      .join("");
  }

  function weekTable(filterEmployee) {
    const dates = weekDates();
    const head = `<tr><th></th>${dates
      .map((d, i) => `<th>${DAYS[i]}<br>${d.slice(8, 10)}.${d.slice(5, 7)}.</th>`)
      .join("")}</tr>`;
    const body = FOCH.venues
      .map((v) => {
        const cells = dates
          .map((d) => {
            const list = shiftsOn(d, v.id).filter((s) => !filterEmployee || s.employee === filterEmployee);
            const hole =
              !filterEmployee &&
              (shiftsOn(d, v.id, "morning").length < 1 || shiftsOn(d, v.id, "evening").length < 1);
            const html = list
              .map((s) => {
                const e = emp(s.employee);
                return `<span class="shift"><b>${e.name.split(" ")[0]}</b><em>${s.start}–${s.end}</em></span>`;
              })
              .join("");
            const holeHtml = hole ? '<span class="hole">premalo ljudi</span>' : "";
            return `<td>${html || "—"}${holeHtml}</td>`;
          })
          .join("");
        return `<tr><td class="venue">${v.name}</td>${cells}</tr>`;
      })
      .join("");
    return `<div class="week-wrap"><table class="week">${head}${body}</table></div>`;
  }

  function myShifts(id) {
    return FOCH.shifts
      .filter((s) => s.employee === id)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  }

  function takingsWeekTable() {
    const dates = weekDates();
    const head = `<tr><th></th>${dates
      .map((d, i) => `<th>${DAYS[i]}<br>${d.slice(8, 10)}.${d.slice(5, 7)}.</th>`)
      .join("")}</tr>`;
    const body = FOCH.venues
      .map((v) => {
        const cells = dates
          .map((d) => {
            return ["morning", "evening"]
              .map((slot) => {
                const list = FOCH.takings.filter((t) => t.date === d && t.venue === v.id && t.slot === slot);
                const people = shiftsOn(d, v.id, slot);
                if (!list.length && !people.length) return `<div class="t">—</div>`;
                const sum = list.reduce((n, t) => n + (Number(t.amount) || 0), 0);
                const short = list.reduce((n, t) => n + (Number(t.shortage) || 0), 0);
                const names = (list.length ? list : people)
                  .map((x) => {
                    const e = emp(x.employee);
                    const take = takingForShift(x.shiftId || x.id);
                    return `${e ? e.name.split(" ")[0] : x.employee}${take ? " " + fmtEur(take.amount) : ""}`;
                  })
                  .join("<br>");
                return `<div><b>${slot === "morning" ? "Dop." : "Pop."}</b> ${list.length ? fmtEur(sum) : "ni vpisa"}${short ? `<div class="hole">manjko ${fmtEur(short)}</div>` : ""}<div class="t">${names}</div></div>`;
              })
              .join("");
          })
          .map((html) => `<td>${html}</td>`)
          .join("");
        return `<tr><td class="venue">${v.name}</td>${cells}</tr>`;
      })
      .join("");
    return `<div class="week-wrap"><table class="week">${head}${body}</table></div>`;
  }

  function openTakeModal(shiftId) {
    const s = shiftById(shiftId);
    if (!s) return;
    if (user.role !== "admin" && s.employee !== user.username) return;
    const t = takingForShift(shiftId);
    document.getElementById("modal").innerHTML = `
      <div class="modal-back" data-close="1">
        <div class="modal-card" role="dialog">
          <h3>Izkupiček smene</h3>
          <p class="muted">${emp(s.employee).name} · ${describeShift(s)}</p>
          <label class="field"><span>Izkupiček (€)</span><input type="number" step="0.01" min="0" id="tk-amount" value="${t ? t.amount : ""}" /></label>
          <label class="field"><span>Manjko (€)</span><input type="number" step="0.01" min="0" id="tk-short" value="${t ? t.shortage : 0}" /></label>
          <div class="modal-actions">
            <button type="button" class="ghost" id="tk-cancel">Prekliči</button>
            <button type="button" class="cta" id="tk-save">Shrani</button>
          </div>
        </div>
      </div>`;
    document.getElementById("tk-cancel").onclick = closeModal;
    document.getElementById("tk-save").onclick = () => {
      const amount = parseMoney(document.getElementById("tk-amount").value);
      const shortage = parseMoney(document.getElementById("tk-short").value);
      if (t) {
        t.amount = amount;
        t.shortage = shortage;
        t.employee = s.employee;
        t.date = s.date;
        t.venue = s.venue;
        t.slot = s.slot;
      } else {
        FOCH.takings.push({
          id: nextTakeId(),
          shiftId: s.id,
          date: s.date,
          venue: s.venue,
          slot: s.slot,
          employee: s.employee,
          amount,
          shortage
        });
      }
      saveTakings();
      closeModal();
      if (user.role === "admin") renderAdminPregled();
      else renderStaffPregled();
    };
    document.querySelector(".modal-back").addEventListener("click", (ev) => {
      if (ev.target.dataset.close) closeModal();
    });
  }

  function bindPregled() {
    views.pregled.querySelectorAll("[data-take]").forEach((btn) => {
      btn.addEventListener("click", () => openTakeModal(btn.dataset.take));
    });
  }

  function renderStaffPregled() {
    const mine = myShifts(user.username);
    const today = mine.filter((s) => s.date === TODAY);
    const hero = today.length
      ? `<div class="hero-shift">
        <div class="muted">Danes · ${today.map((s) => venueName(s.venue)).join(", ")}</div>
        <div class="when">${today.map((s) => s.start + "–" + s.end).join(" · ")}</div>
      </div>`
      : `<div class="hero-shift"><div class="muted">Danes nimate izmene.</div></div>`;

    const list = mine
      .map((s) => {
        const t = takingForShift(s.id);
        const money = t
          ? `${fmtEur(t.amount)}${t.shortage ? ` · manjko ${fmtEur(t.shortage)}` : ""}`
          : "brez izkupička";
        return `<div class="row">
          <div><b>${fmtDay(s.date)}</b><div class="t">${venueName(s.venue)} · ${s.slot === "morning" ? "dopoldan" : "popoldan"} · ${s.start}–${s.end}</div></div>
          <div class="leave-actions"><span class="t">${money}</span><button type="button" class="ghost" data-take="${s.id}">${t ? "Uredi" : "Vpiši"}</button></div>
        </div>`;
      })
      .join("");

    const leaves = FOCH.leaves.filter((l) => l.employee === user.username);
    const leaveHtml = leaves.length
      ? leaves
          .map(
            (l) =>
              `<div class="row"><div><b>${leaveLabel(l.type)}</b><div class="t">${l.from}${l.from !== l.to ? " – " + l.to : ""}</div></div>${statusBadge(l.status)}</div>`
          )
          .join("")
      : `<p class="muted">Nimate oddanih prošenj.</p>`;

    views.pregled.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <h3>Moje izmene</h3>
        ${hero}
        <div class="list">${list || '<p class="muted">Ta teden nimate izmen.</p>'}</div>
        <p class="muted" style="margin-top:10px">Izkupiček in manjko vidiš samo pri svojih smenah.</p>
      </section>
      <section class="card">
        <h3>Dopusti in prosto</h3>
        <div class="list">${leaveHtml}</div>
        <h3 style="margin-top:18px">Moje menjave</h3>
        <div class="list">${swapListHtml(FOCH.swaps.filter((x) => x.fromEmployee === user.username || x.toEmployee === user.username).slice(0, 4))}</div>
      </section>
    </div>`;
    bindPregled();
  }

  function renderAdminPregled() {
    views.pregled.innerHTML = `
    <div class="grid-2">
      <section class="card">
        <h3>Pokritost danes · ${fmtDay(TODAY)}</h3>
        <div class="kpis">${coverageToday()}</div>
        <h3>Urnik tedna</h3>
        ${weekTable()}
        <p class="muted" style="margin-top:12px">Urejanje: zavihek Urnik. Pon–pet 6.00–23.00 (smena 14.00), vikend 7.00–23.00 (smena 15.00).</p>
      </section>
      <section class="card">
        <h3>Čakajoče prošnje</h3>
        <div class="list">${pendingLeaves()}</div>
        <h3 style="margin-top:18px">Menjave za vodjo</h3>
        <div class="list">${swapListHtml(FOCH.swaps.filter((x) => x.status === "caka_vodjo"))}</div>
        <h3 style="margin-top:18px">Ure ta mesec</h3>
        <p class="muted">Od največ do najmanj · oddelane + planirane</p>
        <div class="list">${hoursLadder()}</div>
      </section>
    </div>
    <section class="card" style="margin-top:16px">
      <h3>Izkupiček tedna</h3>
      <p class="muted">Po lokalu, dnevu in smeni · od vseh zaposlenih</p>
      ${takingsWeekTable()}
    </section>`;
    bindPregled();
  }

  function conflict(employee, date, slot, exceptId) {
    return FOCH.shifts.find(
      (s) => s.employee === employee && s.date === date && s.slot === slot && s.id !== exceptId
    );
  }

  function conflictMsg(hit, employee) {
    const e = emp(employee);
    const smena = hit.slot === "morning" ? "dopoldanski" : "popoldanski";
    return `${e.name.split(" ")[0]} je že na ${smena} smeni ${fmtDay(hit.date)} v ${venueName(hit.venue)}. Istega dne ne more biti na dveh lokalih v isti smeni.`;
  }

  function addShift(employee, date, venue, slot) {
    const off = approvedLeaveOn(employee, date);
    if (off) {
      return {
        ok: false,
        msg: `${emp(employee).name.split(" ")[0]} ima odobreno odsotnost (${leaveLabel(off.type)}) ${off.from}${off.from !== off.to ? "–" + off.to : ""}.`
      };
    }
    const hit = conflict(employee, date, slot);
    if (hit) return { ok: false, msg: conflictMsg(hit, employee) };
    const def = slotDefaults(date, slot);
    FOCH.shifts.push({
      id: nextShiftId(),
      date,
      venue,
      employee,
      slot,
      start: def.start,
      end: def.end
    });
    saveShifts();
    return { ok: true };
  }

  function moveShift(id, date, venue, slot) {
    const s = FOCH.shifts.find((x) => x.id === id);
    if (!s) return { ok: false, msg: "Izmena ne obstaja." };
    const off = approvedLeaveOn(s.employee, date);
    if (off) {
      return {
        ok: false,
        msg: `${emp(s.employee).name.split(" ")[0]} ima odobreno odsotnost (${leaveLabel(off.type)}) na ta dan.`
      };
    }
    const hit = conflict(s.employee, date, slot, id);
    if (hit) return { ok: false, msg: conflictMsg(hit, s.employee) };
    const sameSlot = s.date === date && s.slot === slot;
    s.date = date;
    s.venue = venue;
    s.slot = slot;
    if (!sameSlot) {
      const def = slotDefaults(date, slot);
      s.start = def.start;
      s.end = def.end;
    }
    saveShifts();
    return { ok: true };
  }

  function removeShift(id) {
    FOCH.shifts = FOCH.shifts.filter((s) => s.id !== id);
    saveShifts();
  }

  function plannerNav() {
    const weeks = weeksForMonth(planMonth);
    if (!weeks.includes(currentWeekStart)) {
      currentWeekStart = weeks[0] || currentWeekStart;
      FOCH.weekStart = currentWeekStart;
    }
    const idx = weeks.indexOf(currentWeekStart);
    return `<div class="planner-nav">
      <div class="month-tabs">
        ${PLAN_MONTHS.map((m) => `<button type="button" class="ghost ${m === planMonth ? "active" : ""}" data-month="${m}">${monthTitle(m)}</button>`).join("")}
      </div>
      <div class="week-tabs">
        <button type="button" class="ghost" data-week="-1" ${idx <= 0 ? "disabled" : ""}>← Teden</button>
        <span>${weekCaption(currentWeekStart)}</span>
        <button type="button" class="ghost" data-week="1" ${idx >= weeks.length - 1 ? "disabled" : ""}>Teden →</button>
      </div>
    </div>`;
  }

  function editorGrid() {
    const dates = weekDates();
    const head = dates
      .map((d, i) => {
        const h = hoursFor(d);
        return `<div class="ed-day"><b>${DAYS[i]} ${d.slice(8, 10)}.${d.slice(5, 7)}.</b><span>${h.open}–${h.close}</span></div>`;
      })
      .join("");

    const rows = FOCH.venues
      .flatMap((v) =>
        ["morning", "evening"].map((slot) => {
          const cells = dates
            .map((d) => {
              const list = shiftsOn(d, v.id, slot);
              const need = minFor(d, slot);
              const hole = list.length < need;
              const chips = list
                .map((s) => {
                  const e = emp(s.employee);
                  const custom = s.start !== slotDefaults(d, slot).start || s.end !== slotDefaults(d, slot).end;
                  return `<button type="button" class="ed-chip" draggable="true" data-shift="${s.id}" title="Klikni za uro, povleci za premik">
                    <b>${e.name.split(" ")[0]}</b>
                    <em>${s.start}–${s.end}${custom ? " · po dogovoru" : ""}</em>
                  </button>`;
                })
                .join("");
              return `<div class="ed-slot${hole ? " is-hole" : ""}" data-date="${d}" data-venue="${v.id}" data-slot="${slot}">
                ${chips || '<span class="ed-empty">spusti ime</span>'}
                ${hole ? '<span class="hole">premalo</span>' : ""}
              </div>`;
            })
            .join("");
          return `<div class="ed-row">
            <div class="ed-label"><b>${v.name}</b><span>${slot === "morning" ? "Dopoldan" : "Popoldan"}</span></div>
            ${cells}
          </div>`;
        })
      )
      .join("");

    const bench = FOCH.employees
      .map(
        (e) =>
          `<button type="button" class="bench-chip" draggable="true" data-emp="${e.id}"><span class="ava">${initials(e.name)}</span>${e.name.split(" ")[0]}</button>`
      )
      .join("");

    return `<div class="editor">
      ${plannerNav()}
      <div class="editor-head">
        <div>
          <h3>Sestavi urnik</h3>
          <p class="muted">Planiraš tekoči in naslednji mesec. Povleci ime na smeno. Klikni izmeno za uro po dogovoru.</p>
        </div>
        <div class="hours-note">
          <span>Pon–pet 6.00–23.00 · smena 14.00</span>
          <span>Sob–ned 7.00–23.00 · smena 15.00</span>
          <button type="button" class="ghost danger" data-clear-week="1">Pobriši celi teden</button>
        </div>
      </div>
      <div class="bench">${bench}</div>
      <p class="flash" id="ed-flash" hidden></p>
      <div class="ed-grid">
        <div class="ed-row ed-head"><div class="ed-label"></div>${head}</div>
        ${rows}
      </div>
    </div>`;
  }

  function flash(msg) {
    const el = document.getElementById("ed-flash");
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || "";
  }

  function closeModal() {
    document.getElementById("modal").innerHTML = "";
  }

  function openTimeModal(shiftId) {
    const s = FOCH.shifts.find((x) => x.id === shiftId);
    if (!s) return;
    const e = emp(s.employee);
    const def = slotDefaults(s.date, s.slot);
    document.getElementById("modal").innerHTML = `
      <div class="modal-back" data-close="1">
        <div class="modal-card" role="dialog">
          <h3>Ura izmene</h3>
          <p class="muted">${e.name} · ${venueName(s.venue)} · ${fmtDay(s.date)}</p>
          <p class="muted">Standardna smena: ${def.start}–${def.end}</p>
          <label class="field"><span>Začetek</span><input type="time" id="m-start" value="${s.start}" /></label>
          <label class="field"><span>Konec</span><input type="time" id="m-end" value="${s.end}" /></label>
          <div class="modal-actions">
            <button type="button" class="ghost" id="m-reset">Standardna ura</button>
            <button type="button" class="ghost danger" id="m-del">Odstrani</button>
            <button type="button" class="cta" id="m-save">Shrani</button>
          </div>
        </div>
      </div>`;
    document.getElementById("m-reset").onclick = () => {
      document.getElementById("m-start").value = def.start;
      document.getElementById("m-end").value = def.end;
    };
    document.getElementById("m-del").onclick = () => {
      removeShift(s.id);
      closeModal();
      renderUrnik();
    };
    document.getElementById("m-save").onclick = () => {
      s.start = document.getElementById("m-start").value || def.start;
      s.end = document.getElementById("m-end").value || def.end;
      saveShifts();
      closeModal();
      renderUrnik();
    };
    document.querySelector(".modal-back").addEventListener("click", (ev) => {
      if (ev.target.dataset.close) closeModal();
    });
  }

  let editorBound = false;
  function bindEditor() {
    const root = views.urnik;
    if (editorBound) return;
    editorBound = true;
    let drag = null;

    root.addEventListener("dragstart", (e) => {
      const chip = e.target.closest("[data-emp], [data-shift]");
      if (!chip) return;
      drag = chip.dataset.shift
        ? { type: "shift", id: chip.dataset.shift }
        : { type: "emp", id: chip.dataset.emp };
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData("text/plain", JSON.stringify(drag));
      chip.classList.add("is-drag");
    });

    root.addEventListener("dragend", (e) => {
      const chip = e.target.closest("[data-emp], [data-shift]");
      if (chip) chip.classList.remove("is-drag");
      drag = null;
    });

    root.addEventListener("dragover", (e) => {
      const slot = e.target.closest(".ed-slot");
      if (!slot) return;
      e.preventDefault();
      slot.classList.add("is-over");
    });

    root.addEventListener("dragleave", (e) => {
      const slot = e.target.closest(".ed-slot");
      if (slot) slot.classList.remove("is-over");
    });

    root.addEventListener("drop", (e) => {
      const slot = e.target.closest(".ed-slot");
      if (!slot) return;
      e.preventDefault();
      slot.classList.remove("is-over");
      let payload = drag;
      try {
        payload = JSON.parse(e.dataTransfer.getData("text/plain")) || drag;
      } catch (err) {
        payload = drag;
      }
      if (!payload) return;
      const date = slot.dataset.date;
      const venue = slot.dataset.venue;
      const sl = slot.dataset.slot;
      const res = payload.type === "shift" ? moveShift(payload.id, date, venue, sl) : addShift(payload.id, date, venue, sl);
      if (!res.ok) flash(res.msg);
      else flash("");
      renderUrnik();
    });

    root.addEventListener("click", (e) => {
      const monthBtn = e.target.closest("[data-month]");
      if (monthBtn) {
        planMonth = monthBtn.dataset.month;
        const weeks = weeksForMonth(planMonth);
        currentWeekStart = weeks.includes(mondayOf(TODAY)) && planMonth === CURRENT_MONTH ? mondayOf(TODAY) : weeks[0];
        FOCH.weekStart = currentWeekStart;
        updateWeekbar();
        renderUrnik();
        return;
      }
      const weekBtn = e.target.closest("[data-week]");
      if (weekBtn) {
        const weeks = weeksForMonth(planMonth);
        const idx = weeks.indexOf(currentWeekStart) + Number(weekBtn.dataset.week);
        if (weeks[idx]) {
          currentWeekStart = weeks[idx];
          FOCH.weekStart = currentWeekStart;
          updateWeekbar();
          renderUrnik();
        }
        return;
      }
      if (e.target.closest("[data-clear-week]")) {
        const days = weekDates(currentWeekStart);
        document.getElementById("modal").innerHTML = `
          <div class="modal-back" data-close="1">
            <div class="modal-card" role="dialog">
              <h3>Pobriši celi teden?</h3>
              <p class="muted">${weekCaption(currentWeekStart)} — vse izmene obeh lokalov.</p>
              <div class="modal-actions">
                <button type="button" class="ghost" id="cw-cancel">Prekliči</button>
                <button type="button" class="cta" id="cw-ok">Pobriši</button>
              </div>
            </div>
          </div>`;
        document.getElementById("cw-cancel").onclick = closeModal;
        document.getElementById("cw-ok").onclick = () => {
          FOCH.shifts = FOCH.shifts.filter((s) => !days.includes(s.date));
          saveShifts();
          closeModal();
          renderUrnik();
          renderAdminPregled();
        };
        document.querySelector(".modal-back").addEventListener("click", (ev) => {
          if (ev.target.dataset.close) closeModal();
        });
        return;
      }
      const chip = e.target.closest(".ed-chip");
      if (chip) openTimeModal(chip.dataset.shift);
    });
  }

  function renderUrnik() {
    if (user.role === "admin") {
      views.urnik.innerHTML = `<section class="card editor-card">${editorGrid()}</section>`;
      bindEditor();
    } else {
      views.urnik.innerHTML = `<section class="card">${plannerNav()}<h3>Moj urnik</h3>
        <p class="muted">Pon–pet 6.00–23.00 (smena 14.00) · vikend 7.00–23.00 (smena 15.00)</p>
        ${weekTable(user.username)}</section>`;
      bindEditor();
    }
  }

  function leaveImpact(leave) {
    const days = dateSpan(leave.from, leave.to);
    const holes = [];
    days.forEach((date) => {
      FOCH.venues.forEach((v) => {
        ["morning", "evening"].forEach((slot) => {
          const list = shiftsOn(date, v.id, slot);
          const mine = list.filter((s) => s.employee === leave.employee);
          if (mine.length && list.length - mine.length < 1) {
            holes.push(`${venueName(v.id)} · ${slot === "morning" ? "dopoldan" : "popoldan"} · ${fmtDay(date)}`);
          }
        });
      });
    });
    return holes;
  }

  function submitLeave(payload) {
    if (!payload.from || !payload.to) return { ok: false, msg: "Izberi obdobje." };
    if (payload.from > payload.to) return { ok: false, msg: "Datum od ne sme biti za datumom do." };
    if (payload.from < TODAY) return { ok: false, msg: "Odsotnost lahko oddaš od danes naprej." };
    const lastPlan = `${NEXT_MONTH}-31`;
    if (payload.from > lastPlan || payload.to > lastPlan) {
      return { ok: false, msg: "Planira se samo tekoči in naslednji mesec (september–oktober)." };
    }
    const overlap = FOCH.leaves.find(
      (l) =>
        l.employee === payload.employee &&
        l.status !== "zavrnjeno" &&
        l.from <= payload.to &&
        payload.from <= l.to
    );
    if (overlap) return { ok: false, msg: "V tem obdobju že imaš oddano ali odobreno odsotnost." };
    FOCH.leaves.unshift({
      id: nextLeaveId(),
      employee: payload.employee,
      type: payload.type,
      from: payload.from,
      to: payload.to,
      status: "oddano",
      note: payload.note || ""
    });
    saveLeaves();
    return { ok: true };
  }

  function applyLeaveDecision(id, status) {
    const leave = FOCH.leaves.find((l) => l.id === id);
    if (!leave) return;
    leave.status = status;
    if (status === "odobreno") {
      const days = dateSpan(leave.from, leave.to);
      FOCH.shifts = FOCH.shifts.filter((s) => !(s.employee === leave.employee && days.includes(s.date)));
      saveShifts();
    }
    saveLeaves();
    renderDopusti();
    renderUrnik();
    if (user.role === "admin") renderAdminPregled();
  }

  function confirmApprove(id) {
    const leave = FOCH.leaves.find((l) => l.id === id);
    if (!leave) return;
    const holes = leaveImpact(leave);
    if (!holes.length) {
      applyLeaveDecision(id, "odobreno");
      return;
    }
    document.getElementById("modal").innerHTML = `
      <div class="modal-back" data-close="1">
        <div class="modal-card modal-wide" role="dialog">
          <h3>Opozorilo pred odobritvijo</h3>
          <p class="muted">${emp(leave.employee).name} · ${leaveLabel(leave.type)} · ${leave.from}${leave.from !== leave.to ? "–" + leave.to : ""}</p>
          <p>Po odobritvi bi te smene ostale pod minimumom (1 oseba):</p>
          <div class="list">${holes.map((h) => `<div class="row"><span class="hole">${h}</span></div>`).join("")}</div>
          <div class="modal-actions">
            <button type="button" class="ghost" id="l-cancel">Prekliči</button>
            <button type="button" class="cta" id="l-ok">Odobri vseeno</button>
          </div>
        </div>
      </div>`;
    document.getElementById("l-cancel").onclick = closeModal;
    document.getElementById("l-ok").onclick = () => {
      closeModal();
      applyLeaveDecision(id, "odobreno");
    };
    document.querySelector(".modal-back").addEventListener("click", (ev) => {
      if (ev.target.dataset.close) closeModal();
    });
  }

  function leaveRow(l) {
    const e = emp(l.employee);
    let actions = statusBadge(l.status);
    if (user.role === "admin" && l.status === "oddano") {
      actions = `<div class="leave-actions">
            <button type="button" class="ghost" data-approve="${l.id}">Odobri</button>
            <button type="button" class="ghost danger" data-reject="${l.id}">Zavrni</button>
          </div>`;
    } else if (user.role === "admin" && (l.status === "odobreno" || l.status === "zavrnjeno")) {
      actions = `<div class="leave-actions">
            ${statusBadge(l.status)}
            <button type="button" class="ghost" data-reopen="${l.id}">Vrni v odobritev</button>
            <button type="button" class="ghost danger" data-leave-del="${l.id}">Izbriši</button>
          </div>`;
    }
    return `<div class="row leave-row">
      <div><b>${e.name}</b><div class="t">${leaveLabel(l.type)} · ${l.from}${l.from !== l.to ? "–" + l.to : ""} · ${l.note || "brez opombe"}</div></div>
      ${actions}
    </div>`;
  }

  function renderDopusti() {
    const mine = user.role === "admin" ? FOCH.leaves : FOCH.leaves.filter((l) => l.employee === user.username);
    const pending = mine.filter((l) => l.status === "oddano");
    const rest = mine.filter((l) => l.status !== "oddano");
    const form =
      user.role === "admin"
        ? ""
        : `<form class="leave-form" id="leave-form">
            <label class="field"><span>Vrsta</span>
              <select name="type">${LEAVE_TYPES.map((t) => `<option value="${t}">${leaveLabel(t)}</option>`).join("")}</select>
            </label>
            <label class="field"><span>Od</span><input type="date" name="from" min="${TODAY}" max="${NEXT_MONTH}-31" required /></label>
            <label class="field"><span>Do</span><input type="date" name="to" min="${TODAY}" max="${NEXT_MONTH}-31" required /></label>
            <label class="field field-wide"><span>Opomba</span><input type="text" name="note" placeholder="npr. družinska obveznost" /></label>
            <button type="submit" class="cta">Oddaj prošnjo</button>
          </form>
          <p class="muted">Oddaja je mogoča za september in oktober 2026.</p>
          <p class="flash" id="leave-flash" hidden></p>`;

    views.dopusti.innerHTML = `<section class="card">
      <h3>${user.role === "admin" ? "Odobritev odsotnosti" : "Dopust in bolniška"}</h3>
      ${form}
      <h3 style="margin-top:18px">Čakajoče</h3>
      <div class="list">${pending.map(leaveRow).join("") || '<p class="muted">Ni čakajočih prošenj.</p>'}</div>
      <h3 style="margin-top:18px">Ostalo</h3>
      <div class="list">${rest.map(leaveRow).join("") || '<p class="muted">Ni prejšnjih prošenj.</p>'}</div>
    </section>`;

    const formEl = document.getElementById("leave-form");
    if (formEl) {
      formEl.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const data = new FormData(formEl);
        const res = submitLeave({
          employee: user.username,
          type: data.get("type"),
          from: data.get("from"),
          to: data.get("to"),
          note: data.get("note")
        });
        const flashEl = document.getElementById("leave-flash");
        if (!res.ok) {
          flashEl.hidden = false;
          flashEl.textContent = res.msg;
          return;
        }
        renderDopusti();
      });
    }

    views.dopusti.querySelectorAll("[data-approve]").forEach((btn) => {
      btn.addEventListener("click", () => confirmApprove(btn.dataset.approve));
    });
    views.dopusti.querySelectorAll("[data-reject]").forEach((btn) => {
      btn.addEventListener("click", () => applyLeaveDecision(btn.dataset.reject, "zavrnjeno"));
    });
    views.dopusti.querySelectorAll("[data-reopen]").forEach((btn) => {
      btn.addEventListener("click", () => applyLeaveDecision(btn.dataset.reopen, "oddano"));
    });
    views.dopusti.querySelectorAll("[data-leave-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        FOCH.leaves = FOCH.leaves.filter((l) => l.id !== btn.dataset.leaveDel);
        saveLeaves();
        renderDopusti();
        if (user.role === "admin") renderAdminPregled();
      });
    });
  }

  function upcomingShifts(employeeId) {
    return FOCH.shifts
      .filter((s) => s.employee === employeeId && s.date >= TODAY)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  }

  function swapOpenOnShift(shiftId, exceptId) {
    return FOCH.swaps.find(
      (x) =>
        x.id !== exceptId &&
        (x.status === "caka_sodelavko" || x.status === "caka_vodjo") &&
        (x.fromShiftId === shiftId || x.toShiftId === shiftId)
    );
  }

  function swapSummary(x) {
    const fromS = shiftById(x.fromShiftId);
    const toS = x.toShiftId ? shiftById(x.toShiftId) : null;
    const a = emp(x.fromEmployee);
    const b = emp(x.toEmployee);
    if (x.type === "zamenjava") {
      return `${a.name.split(" ")[0]} ↔ ${b.name.split(" ")[0]} · ${describeShift(fromS)}  ↔  ${describeShift(toS)}`;
    }
    return `${a.name.split(" ")[0]} → ${b.name.split(" ")[0]} prevzame · ${describeShift(fromS)}`;
  }

  function swapListHtml(list) {
    if (!list.length) return `<p class="muted">Ni menjav.</p>`;
    return list
      .map(
        (x) =>
          `<div class="row"><div><b>${swapTypeLabel(x.type)}</b><div class="t">${swapSummary(x)}${x.note ? " · " + x.note : ""}</div></div>${statusBadge(x.status)}</div>`
      )
      .join("");
  }

  function submitSwap(payload) {
    if (!payload.fromShiftId || !payload.toEmployee) return { ok: false, msg: "Izberi izmeno in sodelavko." };
    if (payload.toEmployee === payload.fromEmployee) return { ok: false, msg: "Ne moreš menjati same s seboj." };
    const mine = shiftById(payload.fromShiftId);
    if (!mine || mine.employee !== payload.fromEmployee) return { ok: false, msg: "Izmena ni tvoja ali je ni več." };
    if (mine.date < TODAY) return { ok: false, msg: "Preteklih izmen ni mogoče menjati." };
    if (swapOpenOnShift(mine.id)) return { ok: false, msg: "Za to izmeno že teče menjava." };
    const off = approvedLeaveOn(payload.toEmployee, mine.date);
    if (payload.type === "prevzem" && off) {
      return { ok: false, msg: `${emp(payload.toEmployee).name.split(" ")[0]} ima ta dan odobreno odsotnost.` };
    }
    let toShiftId = payload.toShiftId || "";
    if (payload.type === "zamenjava") {
      const theirs = shiftById(toShiftId);
      if (!theirs || theirs.employee !== payload.toEmployee) return { ok: false, msg: "Izberi izmeno sodelavke." };
      if (theirs.id === mine.id) return { ok: false, msg: "Izberi dve različni izmeni." };
      if (theirs.date < TODAY) return { ok: false, msg: "Preteklih izmen ni mogoče menjati." };
      if (swapOpenOnShift(theirs.id)) return { ok: false, msg: "Njena izmena je že v drugi menjavi." };
      const off2 = approvedLeaveOn(payload.fromEmployee, theirs.date);
      if (off2) return { ok: false, msg: "Na dan njene izmene imaš odobreno odsotnost." };
    }
    FOCH.swaps.unshift({
      id: nextSwapId(),
      type: payload.type,
      fromEmployee: payload.fromEmployee,
      fromShiftId: payload.fromShiftId,
      toEmployee: payload.toEmployee,
      toShiftId: payload.type === "zamenjava" ? toShiftId : "",
      status: "caka_sodelavko",
      note: payload.note || "",
      created: TODAY
    });
    saveSwaps();
    return { ok: true };
  }

  function swapImpact(x) {
    const warnings = [];
    const mine = shiftById(x.fromShiftId);
    if (!mine) return ["Izmena predlagateljice ni več v urniku."];
    if (mine.employee !== x.fromEmployee) warnings.push("Predlagateljica ni več na svoji izmeni.");
    if (x.type === "prevzem") {
      const hit = conflict(x.toEmployee, mine.date, mine.slot);
      if (hit) warnings.push(conflictMsg(hit, x.toEmployee));
      if (approvedLeaveOn(x.toEmployee, mine.date)) warnings.push("Sodelavka ima ta dan odobreno odsotnost.");
    } else {
      const theirs = shiftById(x.toShiftId);
      if (!theirs) return ["Izmena sodelavke ni več v urniku."];
      const hitA = conflict(x.fromEmployee, theirs.date, theirs.slot, theirs.id);
      const hitB = conflict(x.toEmployee, mine.date, mine.slot, mine.id);
      if (hitA) warnings.push(conflictMsg(hitA, x.fromEmployee));
      if (hitB) warnings.push(conflictMsg(hitB, x.toEmployee));
    }
    return warnings;
  }

  function applySwap(x) {
    const mine = shiftById(x.fromShiftId);
    if (!mine) return { ok: false, msg: "Izmena ni več v urniku." };
    if (x.type === "prevzem") {
      const check = conflict(x.toEmployee, mine.date, mine.slot);
      if (check) return { ok: false, msg: conflictMsg(check, x.toEmployee) };
      mine.employee = x.toEmployee;
    } else {
      const theirs = shiftById(x.toShiftId);
      if (!theirs) return { ok: false, msg: "Izmena sodelavke ni več v urniku." };
      const a = mine.employee;
      const b = theirs.employee;
      mine.employee = b;
      theirs.employee = a;
    }
    saveShifts();
    return { ok: true };
  }

  function setSwapStatus(id, status) {
    const x = FOCH.swaps.find((s) => s.id === id);
    if (!x) return;
    if (status === "odobreno") {
      const res = applySwap(x);
      if (!res.ok) {
        flashSwap(res.msg);
        return;
      }
    }
    x.status = status;
    saveSwaps();
    renderMenjave();
    if (user.role === "admin") renderAdminPregled();
    else renderStaffPregled();
    renderUrnik();
  }

  function flashSwap(msg) {
    const el = document.getElementById("swap-flash");
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || "";
  }

  function swapRow(x) {
    const actions = [];
    if (user.role !== "admin" && x.status === "caka_sodelavko" && x.toEmployee === user.username) {
      actions.push(`<button type="button" class="ghost" data-swap-peer="${x.id}">Sprejmi</button>`);
      actions.push(`<button type="button" class="ghost danger" data-swap-peer-no="${x.id}">Zavrni</button>`);
    }
    if (user.role === "admin" && x.status === "caka_vodjo") {
      actions.push(`<button type="button" class="ghost" data-swap-ok="${x.id}">Odobri</button>`);
      actions.push(`<button type="button" class="ghost danger" data-swap-no="${x.id}">Zavrni</button>`);
    }
    if (user.role === "admin" && x.status === "caka_sodelavko") {
      actions.push(`<button type="button" class="ghost danger" data-swap-no="${x.id}">Zavrni</button>`);
    }
    if (user.role !== "admin" && x.fromEmployee === user.username && (x.status === "caka_sodelavko" || x.status === "caka_vodjo")) {
      actions.push(`<button type="button" class="ghost danger" data-swap-no="${x.id}">Prekliči</button>`);
    }
    if (user.role === "admin" && (x.status === "odobreno" || x.status === "zavrnjeno")) {
      actions.push(`<button type="button" class="ghost" data-swap-reopen="${x.id}">Vrni v odobritev</button>`);
      actions.push(`<button type="button" class="ghost danger" data-swap-del="${x.id}">Izbriši</button>`);
    }
    return `<div class="row leave-row">
      <div><b>${swapTypeLabel(x.type)}</b><div class="t">${swapSummary(x)}${x.note ? " · " + x.note : ""}</div></div>
      <div class="leave-actions">${statusBadge(x.status)}${actions.join("")}</div>
    </div>`;
  }

  function renderMenjave() {
    const mineUpcoming = user.role === "admin" ? [] : upcomingShifts(user.username);
    const form =
      user.role === "admin"
        ? `<p class="muted">Zaposlena predlaga, sodelavka potrdi, ti daš zadnjo potrditev. Šele nato se urnik zamenja.</p>`
        : `<form class="leave-form" id="swap-form">
            <label class="field field-wide"><span>Moja izmena</span>
              <select name="fromShiftId" required>
                <option value="">— izberi —</option>
                ${mineUpcoming.map((s) => `<option value="${s.id}">${describeShift(s)}</option>`).join("")}
              </select>
            </label>
            <label class="field"><span>Vrsta</span>
              <select name="type" id="swap-type">
                <option value="prevzem">Prevzem (sodelavka vzame mojo)</option>
                <option value="zamenjava">Zamenjava dveh izmen</option>
              </select>
            </label>
            <label class="field"><span>Sodelavka</span>
              <select name="toEmployee" id="swap-peer" required>
                <option value="">— izberi —</option>
                ${FOCH.employees
                  .filter((e) => e.id !== user.username)
                  .map((e) => `<option value="${e.id}">${e.name} · ${swapRequestCount(e.id)} zahtev</option>`)
                  .join("")}
              </select>
            </label>
            <label class="field field-wide" id="swap-their-wrap" hidden>
              <span>Njena izmena</span>
              <select name="toShiftId" id="swap-their"></select>
            </label>
            <label class="field field-wide"><span>Opomba</span><input type="text" name="note" placeholder="zakaj menjava" /></label>
            <button type="submit" class="cta">Predlagaj menjavo</button>
          </form>
          <p class="muted">Vsak predlog se zabeleži. Ti imaš do zdaj ${swapRequestCount(user.username)} zahtev za menjavo.</p>
          <p class="flash" id="swap-flash" hidden></p>`;

    const relevant =
      user.role === "admin"
        ? FOCH.swaps
        : FOCH.swaps.filter((x) => x.fromEmployee === user.username || x.toEmployee === user.username);
    const pending = relevant.filter((x) => x.status === "caka_sodelavko" || x.status === "caka_vodjo");
    const rest = relevant.filter((x) => x.status === "odobreno" || x.status === "zavrnjeno");

    views.menjave.innerHTML = `<section class="card">
      <h3>Menjava izmen</h3>
      ${form}
      <h3 style="margin-top:18px">V teku</h3>
      <div class="list">${pending.map(swapRow).join("") || '<p class="muted">Ni odprtih menjav.</p>'}</div>
      <h3 style="margin-top:18px">Zgodovina</h3>
      <div class="list">${rest.map(swapRow).join("") || '<p class="muted">Ni prejšnjih menjav.</p>'}</div>
      ${
        user.role === "admin"
          ? `<h3 style="margin-top:18px">Kolikokrat so zahtevale menjavo</h3>
             <div class="list">${FOCH.employees
               .map((e) => ({ e, n: swapRequestCount(e.id) }))
               .sort((a, b) => b.n - a.n)
               .map(
                 (row) =>
                   `<div class="row"><div><b>${row.e.name}</b><div class="t">zahteve za menjavo</div></div><b>${row.n}</b></div>`
               )
               .join("")}</div>`
          : ""
      }
    </section>`;

    const typeEl = document.getElementById("swap-type");
    const peerEl = document.getElementById("swap-peer");
    const theirWrap = document.getElementById("swap-their-wrap");
    const theirEl = document.getElementById("swap-their");

    function fillTheir() {
      if (!typeEl || !peerEl || !theirEl) return;
      const show = typeEl.value === "zamenjava";
      theirWrap.hidden = !show;
      theirEl.required = show;
      const peer = peerEl.value;
      const opts = peer
        ? upcomingShifts(peer).map((s) => `<option value="${s.id}">${describeShift(s)}</option>`).join("")
        : "";
      theirEl.innerHTML = `<option value="">— izberi —</option>${opts}`;
    }
    if (typeEl) {
      typeEl.addEventListener("change", fillTheir);
      peerEl.addEventListener("change", fillTheir);
      fillTheir();
    }

    const formEl = document.getElementById("swap-form");
    if (formEl) {
      formEl.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const data = new FormData(formEl);
        const res = submitSwap({
          fromEmployee: user.username,
          fromShiftId: data.get("fromShiftId"),
          toEmployee: data.get("toEmployee"),
          toShiftId: data.get("toShiftId"),
          type: data.get("type"),
          note: data.get("note")
        });
        if (!res.ok) {
          flashSwap(res.msg);
          return;
        }
        renderMenjave();
      });
    }

    views.menjave.querySelectorAll("[data-swap-peer]").forEach((btn) => {
      btn.addEventListener("click", () => setSwapStatus(btn.dataset.swapPeer, "caka_vodjo"));
    });
    views.menjave.querySelectorAll("[data-swap-peer-no]").forEach((btn) => {
      btn.addEventListener("click", () => setSwapStatus(btn.dataset.swapPeerNo, "zavrnjeno"));
    });
    views.menjave.querySelectorAll("[data-swap-ok]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const x = FOCH.swaps.find((s) => s.id === btn.dataset.swapOk);
        const warn = x ? swapImpact(x) : [];
        if (warn.length) {
          document.getElementById("modal").innerHTML = `
            <div class="modal-back" data-close="1">
              <div class="modal-card modal-wide" role="dialog">
                <h3>Opozorilo pred odobritvijo menjave</h3>
                <div class="list">${warn.map((w) => `<div class="row"><span class="hole">${w}</span></div>`).join("")}</div>
                <div class="modal-actions">
                  <button type="button" class="ghost" id="sx-cancel">Prekliči</button>
                  <button type="button" class="cta" id="sx-ok">Odobri vseeno</button>
                </div>
              </div>
            </div>`;
          document.getElementById("sx-cancel").onclick = closeModal;
          document.getElementById("sx-ok").onclick = () => {
            closeModal();
            setSwapStatus(x.id, "odobreno");
          };
          document.querySelector(".modal-back").addEventListener("click", (ev) => {
            if (ev.target.dataset.close) closeModal();
          });
          return;
        }
        setSwapStatus(btn.dataset.swapOk, "odobreno");
      });
    });
    views.menjave.querySelectorAll("[data-swap-no]").forEach((btn) => {
      btn.addEventListener("click", () => setSwapStatus(btn.dataset.swapNo, "zavrnjeno"));
    });
    views.menjave.querySelectorAll("[data-swap-reopen]").forEach((btn) => {
      btn.addEventListener("click", () => setSwapStatus(btn.dataset.swapReopen, "caka_vodjo"));
    });
    views.menjave.querySelectorAll("[data-swap-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        FOCH.swaps = FOCH.swaps.filter((x) => x.id !== btn.dataset.swapDel);
        saveSwaps();
        renderMenjave();
        if (user.role === "admin") renderAdminPregled();
        else renderStaffPregled();
      });
    });
  }

  function addEmployee(payload) {
    const name = (payload.name || "").trim();
    if (!name) return { ok: false, msg: "Vpiši ime in priimek." };
    const id = slugName(name);
    FOCH.employees.push({
      id,
      name,
      role: "Strežba",
      contract: payload.contract || "študent",
      phone: (payload.phone || "").trim(),
      email: (payload.email || "").trim(),
      address: (payload.address || "").trim(),
      home: "foch",
      history: {}
    });
    const password = String(payload.password || "").trim();
    if (password.length < 6) return { ok: false, msg: "Geslo naj ima vsaj 6 znakov." };
    FOCH.users[id] = { password, role: "zaposleni", name, id };
    saveEmployees();
    saveUsers();
    return { ok: true, id };
  }

  function removeEmployee(id) {
    const person = FOCH.employees.find((e) => e.id === id);
    if (!person) return;
    const hrs = monthSplit(id, CURRENT_MONTH);
    FOCH.alumni.unshift({
      ...person,
      leftAt: TODAY,
      archivedHours: hrs.total
    });
    FOCH.employees = FOCH.employees.filter((e) => e.id !== id);
    FOCH.shifts = FOCH.shifts.filter((s) => !(s.employee === id && s.date >= TODAY));
    if (FOCH.users[id] && FOCH.users[id].role !== "admin") delete FOCH.users[id];
    saveAlumni();
    saveEmployees();
    saveUsers();
    saveShifts();
  }

  function renderEkipa() {
    views.ekipa.innerHTML = `<section class="card">
      <h3>Ekipa</h3>
      <p class="muted">Klikni zaposleno za podatke in geslo. Odstranjene grejo med pretekle zaposlene.</p>
      <div class="people">${FOCH.employees
        .map((e) => {
          const hrs = monthSplit(e.id, CURRENT_MONTH);
          const vac = countLeaveDays(e.id, "dopust");
          return `<div class="person-wrap">
            <button type="button" class="person person-btn" data-emp="${e.id}">
            <div class="ava">${initials(e.name)}</div>
            <div>
              <b>${e.name}</b>
              <div class="t">${e.contract} · ${e.phone || "brez telefona"}</div>
            </div>
            <div class="emp-stats">
              <span>${fmtHours(hrs.total)} h ta mesec</span>
              <span>${vac} dni dopusta</span>
              <span>${swapRequestCount(e.id)} menjav</span>
            </div>
          </button>
          <button type="button" class="ghost danger emp-del" data-emp-del="${e.id}">Odstrani</button>
          </div>`;
        })
        .join("")}</div>
      <h3 style="margin-top:18px">Dodaj zaposleno</h3>
      <form class="leave-form" id="emp-add-form">
        <label class="field"><span>Ime in priimek</span><input type="text" name="name" required placeholder="npr. Eva Kranjc" /></label>
        <label class="field"><span>Tip zaposlitve</span>
          <select name="contract">${CONTRACTS.map((c) => `<option value="${c}">${c}</option>`).join("")}</select>
        </label>
        <label class="field"><span>Telefon</span><input type="text" name="phone" /></label>
        <label class="field field-wide"><span>E-pošta</span><input type="email" name="email" /></label>
        <label class="field field-wide"><span>Naslov</span><input type="text" name="address" /></label>
        <label class="field"><span>Geslo za prijavo</span><input type="text" name="password" required minlength="6" autocomplete="new-password" placeholder="nastavi geslo" /></label>
        <button type="submit" class="cta">Dodaj</button>
      </form>
      <p class="flash" id="emp-flash" hidden></p>
      <h3 style="margin-top:18px">Pretekle zaposlene</h3>
      <p class="muted">Podatki ostanejo za pogled nazaj. Prijava je ukinjena.</p>
      <div class="list">${
        (FOCH.alumni || [])
          .map((e) => {
            const hrs = monthSplit(e.id, CURRENT_MONTH);
            return `<button type="button" class="row person-btn" data-alumni="${e.id}" style="width:100%;text-align:left">
              <div><b>${e.name}</b><div class="t">${e.contract} · odšla ${e.leftAt || "—"} · ${e.phone || "brez telefona"}</div></div>
              <span>${fmtHours(hrs.total || e.archivedHours || 0)} h v arhivu</span>
            </button>`;
          })
          .join("") || '<p class="muted">Ni preteklih zaposlenih.</p>'
      }</div>
    </section>`;
    if (!teamBound) {
      teamBound = true;
      views.ekipa.addEventListener("click", (e) => {
        const del = e.target.closest("[data-emp-del]");
        if (del) {
          const id = del.dataset.empDel;
          const eObj = emp(id);
          if (!eObj) return;
          document.getElementById("modal").innerHTML = `
            <div class="modal-back" data-close="1">
              <div class="modal-card" role="dialog">
                <h3>Odstrani ${eObj.name}?</h3>
                <p class="muted">Gre med pretekle zaposlene. Prijava se ukine, prihodnje izmene se snesejo, stari podatki ostanejo.</p>
                <div class="modal-actions">
                  <button type="button" class="ghost" id="rm-cancel">Prekliči</button>
                  <button type="button" class="cta" id="rm-ok">Odstrani</button>
                </div>
              </div>
            </div>`;
          document.getElementById("rm-cancel").onclick = closeModal;
          document.getElementById("rm-ok").onclick = () => {
            removeEmployee(id);
            closeModal();
            renderEkipa();
            renderUrnik();
            renderDopusti();
            renderMenjave();
            renderAdminPregled();
          };
          document.querySelector(".modal-back").addEventListener("click", (ev) => {
            if (ev.target.dataset.close) closeModal();
          });
          return;
        }
        const alum = e.target.closest("[data-alumni]");
        if (alum) {
          openEmployeeModal(alum.dataset.alumni, true);
          return;
        }
        const btn = e.target.closest("[data-emp]");
        if (btn) openEmployeeModal(btn.dataset.emp);
      });
    }
    const addForm = document.getElementById("emp-add-form");
    if (addForm) {
      addForm.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const data = new FormData(addForm);
        const res = addEmployee({
          name: data.get("name"),
          contract: data.get("contract"),
          phone: data.get("phone"),
          email: data.get("email"),
          address: data.get("address"),
          password: data.get("password")
        });
        const flashEl = document.getElementById("emp-flash");
        if (!res.ok) {
          flashEl.hidden = false;
          flashEl.textContent = res.msg;
          return;
        }
        renderEkipa();
        renderUrnik();
      });
    }
  }

  let teamBound = false;

  function openEmployeeModal(id, archived) {
    const e = emp(id);
    if (!e) return;
    const isArchived = !!archived || !FOCH.employees.some((x) => x.id === id);
    const login = FOCH.users[id];
    const hrs = monthSplit(e.id, CURRENT_MONTH);
    const vac = countLeaveDays(e.id, "dopust");
    const histKeys = Object.keys(e.history || {}).sort().reverse();
    const histRows = histKeys
      .map((k) => `<div class="row"><div>${monthTitle(k)}</div><b>${fmtHours(e.history[k])} h</b></div>`)
      .join("");
    document.getElementById("modal").innerHTML = `
      <div class="modal-back" data-close="1">
        <div class="modal-card modal-wide" role="dialog">
          <h3>${e.name}${isArchived ? " · pretekla" : ""}</h3>
          <div class="kpis">
            <div class="kpi"><div class="name">${fmtHours(hrs.worked)} h</div><div class="stat">oddelane · ${monthTitle(CURRENT_MONTH)}</div></div>
            <div class="kpi"><div class="name">${fmtHours(hrs.planned)} h</div><div class="stat">planirane · ${monthTitle(CURRENT_MONTH)}</div></div>
          </div>
          <p class="muted">Skupaj ta mesec: ${fmtHours(hrs.total)} h · koristen dopust: ${vac} dni · zahteve za menjavo: ${swapRequestCount(e.id)}${e.leftAt ? " · odšla " + e.leftAt : ""}</p>
          <label class="field"><span>Tip zaposlitve</span>
            <select id="e-contract" ${isArchived ? "disabled" : ""}>${CONTRACTS.map((c) => `<option value="${c}" ${c === e.contract ? "selected" : ""}>${c}</option>`).join("")}</select>
          </label>
          <label class="field"><span>Naslov bivanja</span><input type="text" id="e-address" value="${e.address || ""}" ${isArchived ? "disabled" : ""} /></label>
          <label class="field"><span>Telefon</span><input type="text" id="e-phone" value="${e.phone || ""}" ${isArchived ? "disabled" : ""} /></label>
          <label class="field"><span>E-pošta</span><input type="email" id="e-email" value="${e.email || ""}" ${isArchived ? "disabled" : ""} /></label>
          ${
            isArchived
              ? ""
              : `<label class="field"><span>Geslo za prijavo</span><input type="text" id="e-pass" value="${login ? login.password : ""}" placeholder="novo geslo" /></label>
          <p class="muted">Uporabniško ime: ${id}</p>`
          }
          <button type="button" class="ghost" id="e-hist-btn">Prikaži pretekle mesece</button>
          <div id="e-hist" class="list hidden" style="margin-top:10px">${histRows || '<p class="muted">Ni preteklih mesecev.</p>'}</div>
          <div class="modal-actions">
            <button type="button" class="ghost" id="e-cancel">Zapri</button>
            ${isArchived ? "" : `<button type="button" class="cta" id="e-save">Shrani</button>`}
          </div>
        </div>
      </div>`;
    document.getElementById("e-hist-btn").onclick = () => {
      const box = document.getElementById("e-hist");
      const open = box.classList.contains("hidden");
      box.classList.toggle("hidden", !open);
      document.getElementById("e-hist-btn").textContent = open ? "Skrij pretekle mesece" : "Prikaži pretekle mesece";
    };
    document.getElementById("e-cancel").onclick = closeModal;
    const saveBtn = document.getElementById("e-save");
    if (saveBtn) {
      saveBtn.onclick = () => {
        e.contract = document.getElementById("e-contract").value;
        e.address = document.getElementById("e-address").value.trim();
        e.phone = document.getElementById("e-phone").value.trim();
        e.email = document.getElementById("e-email").value.trim();
        const pass = document.getElementById("e-pass");
        if (pass && FOCH.users[e.id]) {
          const next = pass.value.trim();
          if (next) FOCH.users[e.id].password = next;
          saveUsers();
        }
        saveEmployees();
        closeModal();
        renderEkipa();
      };
    }
    document.querySelector(".modal-back").addEventListener("click", (ev) => {
      if (ev.target.dataset.close) closeModal();
    });
  }

  function debtSort(list) {
    return list.slice().sort((a, b) => String(b.created).localeCompare(String(a.created)) || String(b.id).localeCompare(String(a.id)));
  }

  function debtRow(d, archive) {
    const e = emp(d.employee);
    const pay = !archive
      ? `<button type="button" class="ghost" data-debt-pay="${d.id}">Plačano</button>`
      : `<span class="badge yes">plačano ${d.paidAt || ""}</span>
         <button type="button" class="ghost danger" data-debt-del="${d.id}">Izbriši</button>`;
    return `<div class="row leave-row">
      <div>
        <b>${d.guest || "Gost"} · ${fmtEur(d.amount)}</b>
        <div class="t">${fmtDay(d.created)} · ${venueName(d.venue)} · račun ${d.invoice || "—"} · ${e ? e.name : d.employee}${d.reason ? " · " + d.reason : ""}</div>
      </div>
      <div class="leave-actions">${pay}</div>
    </div>`;
  }

  function renderDolzniki() {
    const open = debtSort(FOCH.debts.filter((d) => d.status !== "placano"));
    const archive = debtSort(FOCH.debts.filter((d) => d.status === "placano"));
    const rank = FOCH.employees
      .map((e) => {
        const mine = open.filter((d) => d.employee === e.id);
        return {
          e,
          n: mine.length,
          sum: mine.reduce((s, d) => s + (Number(d.amount) || 0), 0)
        };
      })
      .filter((row) => user.role === "admin" || row.n)
      .sort((a, b) => b.n - a.n || b.sum - a.sum);

    views.dolzniki.innerHTML = `<section class="card">
      <h3>Dolžniki</h3>
      <p class="muted">Vsi vidijo seznam. Ko gost prinese denar, označiš plačano — gre v arhiv.</p>
      <form class="leave-form" id="debt-form">
        <label class="field"><span>Dolžnik</span><input type="text" name="guest" required placeholder="ime gosta" /></label>
        <label class="field"><span>Znesek (€)</span><input type="number" name="amount" step="0.01" min="0" required /></label>
        <label class="field"><span>Št. računa</span><input type="text" name="invoice" required placeholder="npr. R-2026-120" /></label>
        <label class="field"><span>Lokal</span>
          <select name="venue">${FOCH.venues.map((v) => `<option value="${v.id}">${v.name}</option>`).join("")}</select>
        </label>
        ${
          user.role === "admin"
            ? `<label class="field"><span>Odobrila</span>
          <select name="employee">
            ${FOCH.employees.map((e) => `<option value="${e.id}">${e.name}</option>`).join("")}
          </select>
        </label>`
            : `<input type="hidden" name="employee" value="${user.username}" />`
        }
        <label class="field field-wide"><span>Razlog</span><input type="text" name="reason" placeholder="zakaj je ostal dolžan" /></label>
        <button type="submit" class="cta">Dodaj dolžnika</button>
      </form>
      <p class="flash" id="debt-flash" hidden></p>
      ${
        user.role === "admin"
          ? `<h3 style="margin-top:18px">Kdo odobri največ dolgov</h3>
             <div class="list">${rank
               .map(
                 (row) =>
                   `<div class="row"><div><b>${row.e.name}</b><div class="t">${row.n} odprtih</div></div><b>${fmtEur(row.sum)}</b></div>`
               )
               .join("")}</div>`
          : ""
      }
      <h3 style="margin-top:18px">Odprto · od novejšega</h3>
      <div class="list">${open.map((d) => debtRow(d, false)).join("") || '<p class="muted">Ni odprtih dolžnikov.</p>'}</div>
      <h3 style="margin-top:18px">Arhiv plačanih</h3>
      <div class="list">${archive.map((d) => debtRow(d, true)).join("") || '<p class="muted">Arhiv je prazen.</p>'}</div>
    </section>`;

    const form = document.getElementById("debt-form");
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const data = new FormData(form);
      const amount = parseMoney(data.get("amount"));
      if (amount <= 0) {
        const flashEl = document.getElementById("debt-flash");
        flashEl.hidden = false;
        flashEl.textContent = "Znesek mora biti večji od 0.";
        return;
      }
      FOCH.debts.unshift({
        id: nextDebtId(),
        created: TODAY,
        venue: data.get("venue"),
        employee: data.get("employee") || (user.role === "admin" ? FOCH.employees[0].id : user.username),
        guest: String(data.get("guest") || "").trim(),
        invoice: String(data.get("invoice") || "").trim(),
        amount,
        reason: String(data.get("reason") || "").trim(),
        status: "odprto"
      });
      saveDebts();
      renderDolzniki();
    });
    views.dolzniki.querySelectorAll("[data-debt-pay]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const d = FOCH.debts.find((x) => x.id === btn.dataset.debtPay);
        if (!d) return;
        d.status = "placano";
        d.paidAt = TODAY;
        d.paidBy = user.username;
        saveDebts();
        renderDolzniki();
      });
    });
    views.dolzniki.querySelectorAll("[data-debt-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        FOCH.debts = FOCH.debts.filter((x) => x.id !== btn.dataset.debtDel);
        saveDebts();
        renderDolzniki();
      });
    });
  }

  function takingSum(list) {
    return list.reduce(
      (acc, t) => ({
        amount: acc.amount + (Number(t.amount) || 0),
        shortage: acc.shortage + (Number(t.shortage) || 0)
      }),
      { amount: 0, shortage: 0 }
    );
  }

  function renderIzkupicek() {
    const week = weekDates(currentWeekStart);
    const monthKey = planMonth;
    const people = FOCH.employees.concat(FOCH.alumni || []);
    const venueCards = FOCH.venues
      .map((v) => {
        const weekList = FOCH.takings.filter((t) => t.venue === v.id && week.includes(t.date));
        const monthList = FOCH.takings.filter((t) => t.venue === v.id && t.date.startsWith(monthKey));
        const w = takingSum(weekList);
        const m = takingSum(monthList);
        return `<article class="kpi">
          <div class="name">${v.name}</div>
          <div class="stat">
            Teden ${weekCaption(currentWeekStart)}<br>
            izkupiček ${fmtEur(w.amount)} · manjko ${fmtEur(w.shortage)}<br><br>
            Mesec ${monthTitle(monthKey)}<br>
            izkupiček ${fmtEur(m.amount)} · manjko ${fmtEur(m.shortage)}
          </div>
        </article>`;
      })
      .join("");

    const rankSource = user.role === "admin" ? people : people.filter((e) => e.id === user.username);
    const rank = rankSource
      .map((e) => {
        const list = FOCH.takings.filter((t) => t.employee === e.id && t.date.startsWith(monthKey));
        const s = takingSum(list);
        return { e, ...s, n: list.length };
      })
      .sort((a, b) => b.amount - a.amount);

    const weekRank = rankSource
      .map((e) => {
        const list = FOCH.takings.filter((t) => t.employee === e.id && week.includes(t.date));
        const s = takingSum(list);
        return { e, ...s };
      })
      .sort((a, b) => b.amount - a.amount);

    views.izkupicek.innerHTML = `<section class="card">
      <h3>Izkupiček</h3>
      ${plannerNav()}
      <div class="kpis">${venueCards}</div>
      <h3 style="margin-top:18px">Zaposlene · ${monthTitle(monthKey)} · od največ do najmanj</h3>
      <div class="list">${
        rank
          .map((row, i) => {
            const max = Math.max(rank[0] ? rank[0].amount : 1, 1);
            const pct = Math.round((row.amount / max) * 100);
            return `<div class="rank-row">
              <span class="rank-n">${i + 1}</span>
              <div class="rank-body">
                <div class="rank-top"><b>${row.e.name}${row.e.leftAt ? " (pretekla)" : ""}</b><span>${fmtEur(row.amount)}</span></div>
                <div class="rank-bar"><i style="width:${pct}%"></i></div>
                <div class="t">${row.n} smen · manjko ${fmtEur(row.shortage)}</div>
              </div>
            </div>`;
          })
          .join("") || '<p class="muted">Ni vpisanih izkupičkov.</p>'
      }</div>
      <h3 style="margin-top:18px">Ta teden</h3>
      <div class="list">${
        weekRank
          .map(
            (row) =>
              `<div class="row"><div><b>${row.e.name}</b><div class="t">manjko ${fmtEur(row.shortage)}</div></div><b>${fmtEur(row.amount)}</b></div>`
          )
          .join("") || '<p class="muted">Ta teden še ni vpisov.</p>'
      }</div>
    </section>`;

    views.izkupicek.querySelectorAll("[data-month]").forEach((btn) => {
      btn.addEventListener("click", () => {
        planMonth = btn.dataset.month;
        const weeks = weeksForMonth(planMonth);
        currentWeekStart =
          weeks.includes(mondayOf(TODAY)) && planMonth === CURRENT_MONTH ? mondayOf(TODAY) : weeks[0];
        FOCH.weekStart = currentWeekStart;
        updateWeekbar();
        renderIzkupicek();
      });
    });
    views.izkupicek.querySelectorAll("[data-week]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const weeks = weeksForMonth(planMonth);
        const idx = weeks.indexOf(currentWeekStart) + Number(btn.dataset.week);
        if (weeks[idx]) {
          currentWeekStart = weeks[idx];
          FOCH.weekStart = currentWeekStart;
          updateWeekbar();
          renderIzkupicek();
        }
      });
    });
  }

  if (user.role === "admin") renderAdminPregled();
  else renderStaffPregled();
  renderUrnik();
  renderDopusti();
  renderMenjave();
  renderDolzniki();
  renderIzkupicek();
  if (user.role === "admin") renderEkipa();
  const startView = new URLSearchParams(location.search).get("view") || "pregled";
  showView(startView);
}
