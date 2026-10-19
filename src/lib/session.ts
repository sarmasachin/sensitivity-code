export const accountEmailKey = "sensitivity-email";
export const lastCodeKey = "sensitivity-code";

const votesKey = "sensitivity-votes";
const savedKey = "sensitivity-saved";

export function hasAccount() {
  return Boolean(sessionStorage.getItem(accountEmailKey));
}

function readMap(key: string) {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) ?? "{}") as unknown;
    if (!value || typeof value !== "object") return {} as Record<string, string>;
    return value as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

export function voteFor(id: string) {
  const vote = readMap(votesKey)[id];
  return vote === "working" || vote === "broken" ? vote : null;
}

export function setVote(id: string, vote: "working" | "broken") {
  const map = readMap(votesKey);
  map[id] = vote;
  sessionStorage.setItem(votesKey, JSON.stringify(map));
}

export function isSaved(id: string) {
  return readMap(savedKey)[id] === "1";
}

export function saveCode(id: string) {
  const map = readMap(savedKey);
  map[id] = "1";
  sessionStorage.setItem(savedKey, JSON.stringify(map));
}

export function savedCount() {
  return Object.keys(readMap(savedKey)).length;
}
