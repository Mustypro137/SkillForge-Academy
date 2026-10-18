// Keeps your data in memory while the app runs, and saves it after every change.
// Pages read with getData() and change data with updateData(). They never touch
// storage directly.

import { loadData, saveData, createDefaultData } from './storage.js';

let storage = null;
let data = null;
let warning = null;
let saveError = null;
const listeners = new Set();

function notify() {
  for (const listener of listeners) listener(data);
}

// Call once when the app starts. "store" is window.localStorage (or a fake in tests).
export function initState(store, now = new Date()) {
  storage = store;
  ({ data, warning } = loadData(storage, now));
  saveError = null;
}

export function getData() { return data; }
export function getWarning() { return warning; }
export function getSaveError() { return saveError; }

// Runs change(data), then saves. Example: updateData((d) => { d.settings.theme = 'dark'; })
export function updateData(change) {
  change(data);
  persist();
}

// Replaces everything (used by import and reset).
export function replaceData(newData) {
  data = newData;
  warning = null;
  persist();
}

export function resetData(now = new Date()) {
  replaceData(createDefaultData(now));
}

function persist() {
  const result = saveData(storage, data);
  saveError = result.ok ? null : result.error;
  notify();
}

// Calls listener(data) after every change. Returns a function that stops listening.
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
