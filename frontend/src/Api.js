// single place the frontend talks to the backend from — every page imports
// these helpers instead of hardcoding its own fetch calls
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const jsonHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// api("/issues") → GET · api("/issues", { method: "POST", body }) → POST.
// resolves with the parsed JSON, throws Error(message) on any non-OK reply.
// a rejected GET (expired/invalid token) ends the session and asks for login.
export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: jsonHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && method === "GET") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/login");
    throw new Error("Please log in again.");
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON reply (e.g. image bytes) — nothing to parse
  }
  if (!res.ok) throw new Error(json?.message || "Something went wrong.");
  return json;
}

// fire this whenever anything marks notifications read — the dashboard layout
// listens for "notif-read" and refreshes its bell + sidebar badges on the spot
// instead of waiting for the next 30s poll
export function notifsChanged() {
  window.dispatchEvent(new Event("notif-read"));
}

// reads a File into a data URL and stores it as BinData via the backend.
// returns the new Image id to attach to an issue/item.
export async function uploadImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
  const json = await api("/images", { method: "POST", body: { data: dataUrl } });
  return json.image;
}

// "2 hours ago" style labels from timestamps — used by lists, chats, timelines
export function ago(dateish) {
  const then = new Date(dateish).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(dateish).toLocaleDateString();
}

// greeting name — the full name while it fits (≤24 chars); longer names
// collapse to just the first name so the hero heading never wraps awkwardly
export function displayName(name, fallback) {
  const full = (name || "").trim();
  if (!full) return fallback;
  return full.length <= 24 ? full : full.split(" ")[0];
}

// the logged-in user stored at login/signup — null when the shape is unreadable
export function storedUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}
