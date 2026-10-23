const accountsKey = "sensitivity-accounts";
const failsKey = "sensitivity-login-fails";

const emailWindowMs = 15 * 60 * 1000;
const emailMissLimit = 3;
const burstMs = 2 * 60 * 1000;
const burstLimit = 5;

type AccountBook = Record<string, { salt: string; hash: string }>;

type FailBook = {
  at: Record<string, number[]>;
  locked: string[];
  global: boolean;
  recent: number[];
};

function emptyFails(): FailBook {
  return { at: {}, locked: [], global: false, recent: [] };
}

function normalize(email: string) {
  return email.trim().toLowerCase();
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "");
    if (!value || typeof value !== "object") return fallback;
    return value as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readAccounts() {
  return readJson<AccountBook>(accountsKey, {});
}

function readFails() {
  const book = readJson<Partial<FailBook>>(failsKey, emptyFails());
  return {
    at: book.at ?? {},
    locked: Array.isArray(book.locked) ? book.locked : [],
    global: Boolean(book.global),
    recent: Array.isArray(book.recent) ? book.recent : [],
  };
}

function makeSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function digest(salt: string, password: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function passwordLoginBlocked(email: string) {
  const book = readFails();
  if (book.global) return true;
  const key = normalize(email);
  if (!key) return false;
  return book.locked.includes(key);
}

export function notePasswordMiss(email: string) {
  const book = readFails();
  const key = normalize(email);
  const now = Date.now();
  const misses = (book.at[key] ?? []).filter((time) => now - time < emailWindowMs);
  misses.push(now);
  book.at[key] = misses;
  if (misses.length >= emailMissLimit && !book.locked.includes(key)) book.locked.push(key);

  book.recent = book.recent.filter((time) => now - time < burstMs);
  book.recent.push(now);
  if (book.recent.length >= burstLimit) book.global = true;

  writeJson(failsKey, book);
  return passwordLoginBlocked(email) ? ("otp" as const) : ("ok" as const);
}

export function clearEmailLock(email: string) {
  const book = readFails();
  const key = normalize(email);
  delete book.at[key];
  book.locked = book.locked.filter((item) => item !== key);
  book.recent = [];
  writeJson(failsKey, book);
}

export function clearLoginLock(email: string) {
  clearEmailLock(email);
  const book = readFails();
  book.global = false;
  book.recent = [];
  writeJson(failsKey, book);
}

export function hasPasswordAccount(email: string) {
  return Boolean(readAccounts()[normalize(email)]);
}

export async function resetPassword(email: string, password: string) {
  const key = normalize(email);
  const book = readAccounts();
  if (!book[key]) return "missing" as const;
  if (password.length < 8) return "short" as const;
  const salt = makeSalt();
  book[key] = { salt, hash: await digest(salt, password) };
  writeJson(accountsKey, book);
  return "saved" as const;
}

export async function saveOrCheckPassword(email: string, password: string) {
  const key = normalize(email);
  const book = readAccounts();
  const account = book[key];
  if (!account) {
    if (password.length < 8) return "short" as const;
    const salt = makeSalt();
    book[key] = { salt, hash: await digest(salt, password) };
    writeJson(accountsKey, book);
    return "created" as const;
  }
  const hash = await digest(account.salt, password);
  return hash === account.hash ? ("match" as const) : ("miss" as const);
}
