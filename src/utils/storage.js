import { useCallback, useSyncExternalStore } from "react";

/*
  Tiny localStorage layer shared by the whole app.

  - Everything is stored as JSON.
  - Writes notify every component in the current tab (custom event) and in
    other tabs (native "storage" event), so the admin panel and the student
    site stay in sync live.
  - Reads are cached by raw string so useSyncExternalStore gets a stable
    reference until the data really changes.
*/

const CHANGE_EVENT = "campus-storage-change";
const cache = new Map();

export const EMPTY_LIST = Object.freeze([]);
export const EMPTY_OBJECT = Object.freeze({});

function rawGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readStored(key, fallback) {
  const raw = rawGet(key);
  if (raw === null) return fallback;

  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value;

  try {
    const value = JSON.parse(raw);
    cache.set(key, { raw, value });
    return value;
  } catch {
    return fallback;
  }
}

export function writeStored(key, value) {
  try {
    const raw = JSON.stringify(value);
    window.localStorage.setItem(key, raw);
    cache.set(key, { raw, value });
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    // Storage full or blocked (private mode).
    return false;
  }
}

export function removeStored(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  cache.delete(key);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

/**
 * useState-like hook backed by localStorage.
 * `fallback` must be a stable value (use EMPTY_LIST / EMPTY_OBJECT / null / false).
 * The setter accepts a value or an updater function and returns true if saved.
 */
export function useStored(key, fallback) {
  const value = useSyncExternalStore(
    subscribe,
    () => readStored(key, fallback),
    () => fallback
  );

  const setValue = useCallback(
    (next) => {
      const current = readStored(key, fallback);
      const resolved = typeof next === "function" ? next(current) : next;
      return writeStored(key, resolved);
    },
    [key, fallback]
  );

  return [value, setValue];
}
