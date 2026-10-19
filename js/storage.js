// Saving and loading your data. This is the ONLY file that talks to localStorage.
// The storage object is passed in (window.localStorage in the browser, a fake
// one in tests), so everything here can be tested without a browser.
//
// Your data is one object saved as JSON text under one key:
//   { app, schemaVersion, createdAt, lastBackupAt, settings, progress, attempts, mistakes, writing, roleplay }
// When the data shape changes later, raise SCHEMA_VERSION and add a migration.
//   version 1 -> 2: added "writing" (drafts and history). Old data gets an empty one.
//   version 2 -> 3: added "roleplay" (results and log). Old data gets an empty one.

import { emptyWriting, MAX_TEXT, MAX_NOTE, MAX_HISTORY, RATINGS } from './logic/writing-progress.js';
import { emptyRoleplay, MAX_LOG } from './logic/roleplay-progress.js';

export const APP_NAME = 'skillforge';
export const SCHEMA_VERSION = 3;
export const STORAGE_KEY = 'skillforge-data';
export const CORRUPT_KEY = 'skillforge-data-corrupt'; // raw text of data we could not read
export const MAX_ATTEMPTS = 3000;
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export const THEMES = ['system', 'light', 'dark'];
export const FONT_SIZES = [16, 18, 20, 22];

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function defaultSettings() {
  return { theme: 'system', fontSize: 18, showComingSoon: true };
}

export function createDefaultData(now = new Date()) {
  return {
    app: APP_NAME,
    schemaVersion: SCHEMA_VERSION,
    createdAt: now.toISOString(),
    lastBackupAt: null,
    settings: defaultSettings(),
    progress: {},   // key = lessonId
    attempts: [],   // newest last, at most MAX_ATTEMPTS
    mistakes: {},   // key = "lessonId/exerciseId"
    writing: emptyWriting(), // drafts: key = taskId; history: newest last
    roleplay: emptyRoleplay(), // results: key = scenarioId; log: newest last
  };
}

// 2026-10-19 (your local date, not UTC)
export function localDateString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoDateText(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

// Copies an object of objects, dropping dangerous keys and non-object values.
function cleanRecords(source) {
  const result = {};
  for (const [key, value] of Object.entries(source)) {
    if (!FORBIDDEN_KEYS.has(key) && isPlainObject(value)) result[key] = value;
  }
  return result;
}

const isText = (value) => typeof value === 'string';

// Keeps only well-formed drafts and history entries, and cuts texts to their limits.
function cleanWriting(source) {
  const writing = emptyWriting();
  if (!isPlainObject(source)) return writing;
  if (isPlainObject(source.drafts)) {
    for (const [taskId, draft] of Object.entries(source.drafts)) {
      if (FORBIDDEN_KEYS.has(taskId) || !isPlainObject(draft) || !isText(draft.text)) continue;
      writing.drafts[taskId] = {
        text: draft.text.slice(0, MAX_TEXT),
        updatedAt: isIsoDateText(draft.updatedAt) ? draft.updatedAt : null,
      };
    }
  }
  if (Array.isArray(source.history)) {
    writing.history = source.history
      .filter((e) => isPlainObject(e) && isText(e.taskId) && isText(e.text) && isIsoDateText(e.at))
      .map((e) => ({
        ...e,
        text: e.text.slice(0, MAX_TEXT),
        note: isText(e.note) ? e.note.slice(0, MAX_NOTE) : '',
        rating: RATINGS.includes(e.rating) ? e.rating : null,
      }))
      .slice(-MAX_HISTORY);
  }
  return writing;
}

const isCount = (value) => Number.isInteger(value) && value >= 0;
const isPercent = (value) => Number.isFinite(value) && value >= 0 && value <= 100;

// Keeps only well-formed roleplay results and log entries.
function cleanRoleplay(source) {
  const roleplay = emptyRoleplay();
  if (!isPlainObject(source)) return roleplay;
  if (isPlainObject(source.results)) {
    for (const [id, r] of Object.entries(source.results)) {
      if (FORBIDDEN_KEYS.has(id) || !isPlainObject(r) || !isCount(r.runs) || !isPercent(r.bestPercent)) continue;
      const counts = isPlainObject(r.lastCounts) ? r.lastCounts : {};
      roleplay.results[id] = {
        runs: r.runs,
        bestPercent: r.bestPercent,
        lastPercent: isPercent(r.lastPercent) ? r.lastPercent : r.bestPercent,
        lastCounts: {
          best: isCount(counts.best) ? counts.best : 0,
          ok: isCount(counts.ok) ? counts.ok : 0,
          weak: isCount(counts.weak) ? counts.weak : 0,
        },
        lastAt: isIsoDateText(r.lastAt) ? r.lastAt : null,
      };
    }
  }
  if (Array.isArray(source.log)) {
    roleplay.log = source.log
      .filter((e) => isPlainObject(e) && isText(e.scenarioId) && isIsoDateText(e.at) && isPercent(e.percent))
      .map((e) => ({ scenarioId: e.scenarioId, at: e.at, percent: e.percent }))
      .slice(-MAX_LOG);
  }
  return roleplay;
}

function cleanSettings(source) {
  const defaults = defaultSettings();
  const s = isPlainObject(source) ? source : {};
  return {
    theme: THEMES.includes(s.theme) ? s.theme : defaults.theme,
    fontSize: FONT_SIZES.includes(s.fontSize) ? s.fontSize : defaults.fontSize,
    showComingSoon: typeof s.showComingSoon === 'boolean' ? s.showComingSoon : defaults.showComingSoon,
  };
}

// Checks (and cleans) a data object.
//   strict: false -> repair wrong parts quietly (used when loading saved data)
//   strict: true  -> reject wrong parts with a message (used for imported files)
// Returns { ok: true, data } or { ok: false, error }.
export function validateData(raw, { strict = false } = {}) {
  if (!isPlainObject(raw)) return { ok: false, error: 'This is not a SkillForge backup file.' };
  if (raw.app !== APP_NAME) return { ok: false, error: 'This file was not made by SkillForge Academy.' };
  if (typeof raw.schemaVersion !== 'number') return { ok: false, error: 'The file has no version number.' };
  if (raw.schemaVersion > SCHEMA_VERSION) {
    return { ok: false, error: 'This backup was made by a newer version of the app. Update the app first.' };
  }
  // Older data has no "writing" or "roleplay"; the clean functions below give it empty ones.

  if (strict) {
    if (!Array.isArray(raw.attempts)) return { ok: false, error: 'The backup is damaged: "attempts" must be a list.' };
    for (const name of ['progress', 'mistakes', 'settings']) {
      if (!isPlainObject(raw[name])) return { ok: false, error: `The backup is damaged: "${name}" is missing or wrong.` };
    }
  }

  if (strict && raw.writing !== undefined && !isPlainObject(raw.writing)) {
    return { ok: false, error: 'The backup is damaged: "writing" is wrong.' };
  }

  if (strict && raw.roleplay !== undefined && !isPlainObject(raw.roleplay)) {
    return { ok: false, error: 'The backup is damaged: "roleplay" is wrong.' };
  }

  const base = createDefaultData();
  const attempts = Array.isArray(raw.attempts) ? raw.attempts.filter(isPlainObject) : [];

  return {
    ok: true,
    data: {
      app: APP_NAME,
      schemaVersion: SCHEMA_VERSION,
      createdAt: isIsoDateText(raw.createdAt) ? raw.createdAt : base.createdAt,
      lastBackupAt: isIsoDateText(raw.lastBackupAt) ? raw.lastBackupAt : null,
      settings: cleanSettings(raw.settings),
      progress: isPlainObject(raw.progress) ? cleanRecords(raw.progress) : {},
      attempts: attempts.slice(-MAX_ATTEMPTS), // drop the oldest if too many
      mistakes: isPlainObject(raw.mistakes) ? cleanRecords(raw.mistakes) : {},
      writing: cleanWriting(raw.writing),
      roleplay: cleanRoleplay(raw.roleplay),
    },
  };
}

// Loads saved data. Never throws.
// Returns { data, warning } where warning is null, 'corrupt', 'newer' or 'unavailable'.
// When the saved text cannot be used, it is kept under CORRUPT_KEY (not deleted).
export function loadData(storage, now = new Date()) {
  let text;
  try {
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: createDefaultData(now), warning: 'unavailable' };
  }
  if (text === null) return { data: createDefaultData(now), warning: null };

  let result;
  try {
    result = validateData(JSON.parse(text));
  } catch {
    result = { ok: false, error: 'bad json' };
  }
  if (result.ok) return { data: result.data, warning: null };

  const newer = /newer version/.test(result.error);
  try { storage.setItem(CORRUPT_KEY, text); } catch { /* nothing more we can do */ }
  return { data: createDefaultData(now), warning: newer ? 'newer' : 'corrupt' };
}

// Saves data. Never throws. Returns { ok: true } or { ok: false, error }.
export function saveData(storage, data) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (error) {
    const full = error && (error.name === 'QuotaExceededError' || error.code === 22);
    return {
      ok: false,
      error: full
        ? 'The browser storage is full. Export a backup and free some space.'
        : 'Your progress could not be saved in this browser.',
    };
  }
}

// Makes the backup file. Sets lastBackupAt to now.
export function exportData(data, now = new Date()) {
  const exported = { ...data, lastBackupAt: now.toISOString() };
  return {
    filename: `skillforge-backup-${localDateString(now)}.json`,
    json: JSON.stringify(exported, null, 2),
    data: exported,
  };
}

// Reads the text of a backup file. Never changes anything.
// Returns { ok: true, data, summary } or { ok: false, error }.
export function parseImport(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This file is not valid JSON. Choose a SkillForge backup file.' };
  }
  const result = validateData(raw, { strict: true });
  if (!result.ok) return result;
  const { data } = result;
  return {
    ok: true,
    data,
    summary: {
      lessons: Object.keys(data.progress).length,
      attempts: data.attempts.length,
      mistakes: Object.keys(data.mistakes).length,
      writings: data.writing.history.length,
      roleplays: Object.keys(data.roleplay.results).length,
      createdAt: data.createdAt,
      lastBackupAt: data.lastBackupAt,
    },
  };
}

// Size of the saved data in kilobytes (one decimal).
export function dataSizeKb(data) {
  return Math.round(JSON.stringify(data).length / 102.4) / 10;
}
