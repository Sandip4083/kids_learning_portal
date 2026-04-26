/**
 * Centralized localStorage abstraction with versioned schema
 * All contexts use this instead of raw localStorage calls
 */

const STORAGE_VERSION = 2;
const STORAGE_PREFIX = "klp-";

function getKey(key) {
  return `${STORAGE_PREFIX}${key}`;
}

export function loadFromStorage(key, defaultValue = null) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(getKey(key));
    if (raw === null) return defaultValue;
    const parsed = JSON.parse(raw);
    // Version check
    if (parsed._version && parsed._version < STORAGE_VERSION) {
      return migrateData(key, parsed, defaultValue);
    }
    return parsed.data !== undefined ? parsed.data : parsed;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage(key, data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      getKey(key),
      JSON.stringify({ _version: STORAGE_VERSION, data, _updated: Date.now() })
    );
  } catch (e) {
    console.warn(`Storage write failed for ${key}:`, e.message);
  }
}

export function removeFromStorage(key) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getKey(key));
}

export function clearAllStorage() {
  if (typeof window === "undefined") return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

/** Migrate old data formats to new schema */
function migrateData(key, oldData, defaultValue) {
  // v1 → v2: wrap raw data in versioned envelope
  if (!oldData._version || oldData._version === 1) {
    const migrated = oldData.data || oldData;
    saveToStorage(key, migrated);
    return migrated;
  }
  return defaultValue;
}

/** Get storage usage stats */
export function getStorageStats() {
  if (typeof window === "undefined") return { used: 0, keys: 0 };
  let totalSize = 0;
  let count = 0;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => {
      totalSize += localStorage.getItem(k).length * 2; // UTF-16
      count++;
    });
  return { used: totalSize, keys: count, usedKB: (totalSize / 1024).toFixed(1) };
}
