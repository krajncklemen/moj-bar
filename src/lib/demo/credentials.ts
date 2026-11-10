/** Lokalna demo poverila (samo brskalnik). Ni produkcijski Auth. */

const CREDENTIALS_KEY = "moj-bar-demo-credentials-v1";

type CredMap = Record<string, { salt: string; hash: string }>;

function readMap(): CredMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || "{}") as CredMap;
  } catch {
    return {};
  }
}

function writeMap(map: CredMap) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(map));
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

export async function setCredential(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const salt = randomSalt();
  const hash = await hashPassword(password, salt);
  const map = readMap();
  map[normalized] = { salt, hash };
  writeMap(map);
}

export async function verifyCredential(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const entry = readMap()[normalized];
  if (!entry) return false;
  const hash = await hashPassword(password, entry.salt);
  return hash === entry.hash;
}

export function clearCredentials() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CREDENTIALS_KEY);
}

/** Naključno lokalno geslo (prikaže se enkrat, ne hardcodano v kodi). */
export function generateLocalPassword() {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
