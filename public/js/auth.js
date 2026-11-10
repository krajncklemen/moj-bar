const form = document.getElementById("login-form");
const errorEl = document.getElementById("error");
const submitBtn = document.getElementById("submit");
const toggle = document.getElementById("toggle-pass");
const pass = document.getElementById("password");

const USER_STORE = "foch_users_v1";
const VENUE_STORE = "foch_venues_v1";
const REG_STORE = "foch_registered_v1";

function loadUsers() {
  const saved = Storage.get(USER_STORE);
  if (saved) FOCH.users = saved;
}

function loadVenues() {
  const saved = Storage.get(VENUE_STORE);
  if (saved && Array.isArray(saved) && saved.length) FOCH.venues = saved;
}

loadUsers();
loadVenues();

if (Storage.getSession("foch_user")) {
  location.replace("./dashboard.html");
}

toggle?.addEventListener("click", () => {
  const show = pass.type === "password";
  pass.type = show ? "text" : "password";
  toggle.classList.toggle("is-on", show);
  toggle.setAttribute("aria-pressed", String(show));
  toggle.setAttribute("aria-label", show ? "Skrij geslo" : "Prikaži geslo");
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    form.username.value = chip.dataset.user;
    form.password.value = chip.dataset.pass;
    form.username.focus();
  });
});

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const username = form.username.value.trim().toLowerCase();
  const password = form.password.value;
  const user = FOCH.users[username];

  if (!user || user.password !== password) {
    errorEl.textContent = "Napačno uporabniško ime ali geslo.";
    errorEl.hidden = false;
    return;
  }

  submitBtn.disabled = true;
  Storage.setSession("foch_user", {
    username,
    role: user.role,
    name: user.name,
  });
  location.href = "./dashboard.html";
});

/* ——— Registracija v 2 korakih ——— */
const regPanel = document.getElementById("reg-panel");
const loginPanel = document.getElementById("login-panel");
const openReg = document.getElementById("open-reg");
const backLogin = document.getElementById("back-login");
const regStep1 = document.getElementById("reg-step-1");
const regStep2 = document.getElementById("reg-step-2");
const regError = document.getElementById("reg-error");
let pendingAdmin = null;

function showLogin() {
  loginPanel.hidden = false;
  regPanel.hidden = true;
  regStep1.hidden = false;
  regStep2.hidden = true;
  regError.hidden = true;
}

function showReg() {
  loginPanel.hidden = true;
  regPanel.hidden = false;
  regStep1.hidden = false;
  regStep2.hidden = true;
  regError.hidden = true;
}

openReg?.addEventListener("click", showReg);
backLogin?.addEventListener("click", showLogin);

document.getElementById("reg-form-1")?.addEventListener("submit", (e) => {
  e.preventDefault();
  regError.hidden = true;
  const fd = new FormData(e.target);
  const name = String(fd.get("name") || "").trim();
  const username = String(fd.get("username") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const password2 = String(fd.get("password2") || "");

  if (username.length < 3) {
    regError.textContent = "Uporabniško ime naj ima vsaj 3 znake.";
    regError.hidden = false;
    return;
  }
  if (password.length < 6) {
    regError.textContent = "Geslo naj ima vsaj 6 znakov.";
    regError.hidden = false;
    return;
  }
  if (password !== password2) {
    regError.textContent = "Gesli se ne ujemata.";
    regError.hidden = false;
    return;
  }
  if (FOCH.users[username] && username !== "admin") {
    regError.textContent = "To uporabniško ime je že zasedeno.";
    regError.hidden = false;
    return;
  }

  pendingAdmin = { name, username, password };
  regStep1.hidden = true;
  regStep2.hidden = false;
  const sub = document.getElementById("reg-sub");
  if (sub) sub.textContent = "Korak 2/2 — poimenuj lokala.";
});

document.getElementById("reg-back-1")?.addEventListener("click", () => {
  regStep2.hidden = true;
  regStep1.hidden = false;
});

document.getElementById("reg-form-2")?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!pendingAdmin) return;
  const fd = new FormData(e.target);
  const v1 = String(fd.get("venue1") || "Foch Bar").trim() || "Foch Bar";
  const v2 = String(fd.get("venue2") || "Label Bar").trim() || "Label Bar";

  const users = { ...FOCH.users };
  users[pendingAdmin.username] = {
    password: pendingAdmin.password,
    role: "admin",
    name: pendingAdmin.name,
    id: pendingAdmin.username,
  };
  FOCH.users = users;
  FOCH.venues = [
    { id: "foch", name: v1 },
    { id: "label", name: v2 },
  ];
  Storage.set(USER_STORE, FOCH.users);
  Storage.set(VENUE_STORE, FOCH.venues);
  Storage.set(REG_STORE, { at: new Date().toISOString(), admin: pendingAdmin.username });

  Storage.setSession("foch_user", {
    username: pendingAdmin.username,
    role: "admin",
    name: pendingAdmin.name,
  });
  location.href = "./dashboard.html";
});
