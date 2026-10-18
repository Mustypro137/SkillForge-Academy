import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initState, getData, getWarning, getSaveError, updateData, replaceData, resetData, subscribe,
} from '../js/state.js';
import { STORAGE_KEY, createDefaultData } from '../js/storage.js';

function fakeStorage() {
  const items = new Map();
  return {
    items,
    getItem: (k) => (items.has(k) ? items.get(k) : null),
    setItem: (k, v) => { items.set(k, String(v)); },
  };
}

test('updateData changes memory, saves, and tells listeners', () => {
  const store = fakeStorage();
  initState(store);
  let calls = 0;
  const stop = subscribe(() => { calls++; });

  updateData((d) => { d.settings.theme = 'dark'; });

  assert.equal(getData().settings.theme, 'dark');
  assert.equal(JSON.parse(store.getItem(STORAGE_KEY)).settings.theme, 'dark');
  assert.equal(calls, 1);

  stop();
  updateData((d) => { d.settings.theme = 'light'; });
  assert.equal(calls, 1);
});

test('data survives a restart (new initState with the same storage)', () => {
  const store = fakeStorage();
  initState(store);
  updateData((d) => { d.progress['l1'] = { status: 'completed' }; });
  initState(store);
  assert.deepEqual(getData().progress, { l1: { status: 'completed' } });
});

test('replaceData and resetData save the new data', () => {
  const store = fakeStorage();
  initState(store);
  const other = createDefaultData();
  other.mistakes['a/b'] = { timesWrong: 3 };
  replaceData(other);
  assert.deepEqual(JSON.parse(store.getItem(STORAGE_KEY)).mistakes, { 'a/b': { timesWrong: 3 } });
  resetData();
  assert.deepEqual(getData().mistakes, {});
  assert.deepEqual(JSON.parse(store.getItem(STORAGE_KEY)).mistakes, {});
});

test('a failing save is reported by getSaveError and the app keeps working', () => {
  const store = fakeStorage();
  initState(store);
  store.setItem = () => { throw new Error('nope'); };
  updateData((d) => { d.settings.fontSize = 20; });
  assert.equal(getData().settings.fontSize, 20);
  assert.ok(getSaveError());
});

test('corrupt saved data gives a warning', () => {
  const store = fakeStorage();
  store.setItem(STORAGE_KEY, '{abc');
  initState(store);
  assert.equal(getWarning(), 'corrupt');
});
