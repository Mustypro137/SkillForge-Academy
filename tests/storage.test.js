import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_NAME, SCHEMA_VERSION, STORAGE_KEY, CORRUPT_KEY, MAX_ATTEMPTS,
  createDefaultData, loadData, saveData, validateData, exportData, parseImport,
  localDateString, dataSizeKb,
} from '../js/storage.js';
import { MAX_TEXT, MAX_HISTORY } from '../js/logic/writing-progress.js';

// A tiny fake of localStorage.
function fakeStorage(initial = {}) {
  const items = new Map(Object.entries(initial));
  return {
    items,
    getItem: (k) => (items.has(k) ? items.get(k) : null),
    setItem: (k, v) => { items.set(k, String(v)); },
    removeItem: (k) => { items.delete(k); },
  };
}

test('no saved data gives default data and no warning', () => {
  const { data, warning } = loadData(fakeStorage());
  assert.equal(warning, null);
  assert.equal(data.app, APP_NAME);
  assert.equal(data.schemaVersion, SCHEMA_VERSION);
  assert.deepEqual(data.attempts, []);
  assert.equal(data.settings.theme, 'system');
});

test('save then load returns the same data (like a page refresh)', () => {
  const store = fakeStorage();
  const data = createDefaultData();
  data.settings.theme = 'dark';
  data.progress['lesson-1'] = { status: 'in-progress' };
  data.attempts.push({ exerciseId: 'a', result: 'correct' });
  data.mistakes['lesson-1/a'] = { timesWrong: 2 };
  assert.deepEqual(saveData(store, data), { ok: true });

  const loaded = loadData(store);
  assert.equal(loaded.warning, null);
  assert.deepEqual(loaded.data, data);
});

test('corrupted JSON starts fresh, keeps the raw text and warns', () => {
  const store = fakeStorage({ [STORAGE_KEY]: '{abc' });
  const { data, warning } = loadData(store);
  assert.equal(warning, 'corrupt');
  assert.deepEqual(data.attempts, []);
  assert.equal(store.getItem(CORRUPT_KEY), '{abc');
  assert.equal(store.getItem(STORAGE_KEY), '{abc'); // not overwritten until you change something
});

test('saved data from another app is treated as corrupt', () => {
  const store = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ app: 'other', schemaVersion: 1 }) });
  assert.equal(loadData(store).warning, 'corrupt');
});

test('saved data from a newer version is kept and not used', () => {
  const text = JSON.stringify({ app: APP_NAME, schemaVersion: SCHEMA_VERSION + 1 });
  const store = fakeStorage({ [STORAGE_KEY]: text });
  const { warning } = loadData(store);
  assert.equal(warning, 'newer');
  assert.equal(store.getItem(CORRUPT_KEY), text);
});

test('wrong shapes inside saved data are repaired', () => {
  const store = fakeStorage({
    [STORAGE_KEY]: JSON.stringify({
      app: APP_NAME, schemaVersion: 1,
      attempts: 'oops', progress: [], mistakes: 5, settings: { theme: 'blue', fontSize: 99, showComingSoon: 'yes' },
    }),
  });
  const { data, warning } = loadData(store);
  assert.equal(warning, null);
  assert.deepEqual(data.attempts, []);
  assert.deepEqual(data.progress, {});
  assert.deepEqual(data.mistakes, {});
  assert.deepEqual(data.settings, { theme: 'system', fontSize: 18, showComingSoon: true });
});

test('storage that throws on read gives defaults and an "unavailable" warning', () => {
  const store = { getItem() { throw new Error('blocked'); }, setItem() {} };
  assert.equal(loadData(store).warning, 'unavailable');
});

test('a full storage is reported, not thrown', () => {
  const store = { setItem() { const e = new Error('full'); e.name = 'QuotaExceededError'; throw e; } };
  const result = saveData(store, createDefaultData());
  assert.equal(result.ok, false);
  assert.match(result.error, /full/);
});

test('other save errors are reported, not thrown', () => {
  const store = { setItem() { throw new Error('nope'); } };
  assert.equal(saveData(store, createDefaultData()).ok, false);
});

test('attempts are capped, the oldest are removed', () => {
  const raw = createDefaultData();
  raw.attempts = Array.from({ length: MAX_ATTEMPTS + 5 }, (_, i) => ({ n: i }));
  const { data } = validateData(raw);
  assert.equal(data.attempts.length, MAX_ATTEMPTS);
  assert.equal(data.attempts[0].n, 5);
  assert.equal(data.attempts.at(-1).n, MAX_ATTEMPTS + 4);
});

test('dangerous keys are removed from progress and mistakes', () => {
  const raw = JSON.parse('{"app":"skillforge","schemaVersion":1,"progress":{"__proto__":{"x":1},"ok":{"a":1}},"mistakes":{"constructor":{"y":1}}}');
  const { data } = validateData(raw);
  assert.deepEqual(Object.keys(data.progress), ['ok']);
  assert.deepEqual(Object.keys(data.mistakes), []);
  assert.equal({}.x, undefined);
});

test('export makes valid JSON with app, version and backup date', () => {
  const now = new Date(2026, 9, 19, 23, 30); // 19 Oct 2026, local time
  const out = exportData(createDefaultData(), now);
  assert.equal(out.filename, 'skillforge-backup-2026-10-19.json');
  const parsed = JSON.parse(out.json);
  assert.equal(parsed.app, APP_NAME);
  assert.equal(parsed.schemaVersion, SCHEMA_VERSION);
  assert.equal(parsed.lastBackupAt, now.toISOString());
});

test('local date uses the local day, not UTC', () => {
  assert.equal(localDateString(new Date(2026, 0, 5, 0, 10)), '2026-01-05');
});

test('export then import gives back the same data', () => {
  const data = createDefaultData();
  data.progress['l1'] = { status: 'completed' };
  data.attempts.push({ exerciseId: 'x' });
  data.mistakes['l1/x'] = { timesWrong: 1 };
  const out = exportData(data);
  const result = parseImport(out.json);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data, out.data);
  assert.deepEqual(
    [result.summary.lessons, result.summary.attempts, result.summary.mistakes],
    [1, 1, 1],
  );
});

test('import rejects bad files with a clear message', () => {
  const good = JSON.parse(exportData(createDefaultData()).json);
  const cases = {
    'not JSON': 'hello {',
    'a list': '[]',
    'wrong app': JSON.stringify({ ...good, app: 'other' }),
    'no version': JSON.stringify({ ...good, schemaVersion: undefined }),
    'newer version': JSON.stringify({ ...good, schemaVersion: SCHEMA_VERSION + 1 }),
    'attempts is text': JSON.stringify({ ...good, attempts: 'x' }),
    'settings missing': JSON.stringify({ ...good, settings: undefined }),
    'mistakes is a list': JSON.stringify({ ...good, mistakes: [] }),
  };
  for (const [name, text] of Object.entries(cases)) {
    const result = parseImport(text);
    assert.equal(result.ok, false, name);
    assert.ok(result.error.length > 10, name);
  }
});

test('dataSizeKb returns a small number for small data', () => {
  assert.ok(dataSizeKb(createDefaultData()) < 1);
});

test('new data has an empty writing area', () => {
  assert.deepEqual(createDefaultData().writing, { drafts: {}, history: [] });
});

test('version 1 data (without writing) is still loaded and gets an empty writing area', () => {
  const store = fakeStorage({
    [STORAGE_KEY]: JSON.stringify({ app: APP_NAME, schemaVersion: 1, attempts: [{ exerciseId: 'a' }], progress: {}, mistakes: {}, settings: {} }),
  });
  const { data, warning } = loadData(store);
  assert.equal(warning, null);
  assert.equal(data.schemaVersion, SCHEMA_VERSION);
  assert.equal(data.attempts.length, 1);
  assert.deepEqual(data.writing, { drafts: {}, history: [] });
});

test('a version 1 backup file can be imported', () => {
  const old = { app: APP_NAME, schemaVersion: 1, attempts: [], progress: {}, mistakes: {}, settings: {} };
  const result = parseImport(JSON.stringify(old));
  assert.equal(result.ok, true);
  assert.equal(result.summary.writings, 0);
});

test('writing drafts and history are cleaned: bad parts removed, long text cut, dangerous keys dropped', () => {
  const long = 'x'.repeat(MAX_TEXT + 50);
  const raw = JSON.parse(`{
    "app": "${APP_NAME}", "schemaVersion": ${SCHEMA_VERSION}, "attempts": [], "progress": {}, "mistakes": {}, "settings": {},
    "writing": {
      "drafts": {
        "wr-01": { "text": "${long}", "updatedAt": "2026-10-19T10:00:00.000Z" },
        "wr-02": { "text": 5 },
        "__proto__": { "text": "bad" }
      },
      "history": [
        { "taskId": "wr-01", "text": "ok", "at": "2026-10-19T10:00:00.000Z", "rating": "great", "note": "n" },
        { "taskId": "wr-01", "text": "bad rating", "at": "2026-10-19T10:00:00.000Z", "rating": "amazing" },
        { "taskId": 5, "text": "no task id", "at": "2026-10-19T10:00:00.000Z" },
        { "taskId": "wr-01", "text": "no date", "at": "not a date" },
        "junk"
      ]
    }
  }`);
  const { data } = validateData(raw);
  assert.deepEqual(Object.keys(data.writing.drafts), ['wr-01']);
  assert.equal(data.writing.drafts['wr-01'].text.length, MAX_TEXT);
  assert.equal(data.writing.history.length, 2);
  assert.equal(data.writing.history[0].rating, 'great');
  assert.equal(data.writing.history[1].rating, null);
  assert.equal({}.text, undefined);
});

test('writing history is capped at the newest entries', () => {
  const history = Array.from({ length: MAX_HISTORY + 5 }, (_, n) => ({ taskId: 'wr-01', text: String(n), at: '2026-10-19T10:00:00.000Z' }));
  const { data } = validateData({ app: APP_NAME, schemaVersion: SCHEMA_VERSION, writing: { history } });
  assert.equal(data.writing.history.length, MAX_HISTORY);
  assert.equal(data.writing.history[0].text, '5');
});

test('import rejects a damaged writing area, and counts saved writings', () => {
  const good = JSON.parse(exportData(createDefaultData()).json);
  assert.equal(parseImport(JSON.stringify({ ...good, writing: [] })).ok, false);
  good.writing.history.push({ taskId: 'wr-01', text: 'hi', at: '2026-10-19T10:00:00.000Z' });
  assert.equal(parseImport(JSON.stringify(good)).summary.writings, 1);
});
