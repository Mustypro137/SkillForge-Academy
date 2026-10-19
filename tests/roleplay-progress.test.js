import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyRoleplay, applyRun, scenarioStatus, bestPercent, roleplaySummary, MAX_LOG,
} from '../js/logic/roleplay-progress.js';

const summary = (percent, best = 1, ok = 1, weak = 0) => ({ percent, best, ok, weak });
const scenarios = [{ id: 'rp-01' }, { id: 'rp-02' }, { id: 'rp-03' }];
const day = (n) => new Date(Date.UTC(2026, 9, n, 10));

test('the first finished conversation creates a result', () => {
  const next = applyRun(emptyRoleplay(), 'rp-01', summary(75, 3, 1, 0), day(1));
  assert.deepEqual(next.results['rp-01'], {
    runs: 1, bestPercent: 75, lastPercent: 75, lastCounts: { best: 3, ok: 1, weak: 0 }, lastAt: day(1).toISOString(),
  });
  assert.deepEqual(next.log, [{ scenarioId: 'rp-01', at: day(1).toISOString(), percent: 75 }]);
});

test('the best result is kept when a later run is worse; the last result is updated', () => {
  let rp = applyRun(emptyRoleplay(), 'rp-01', summary(90), day(1));
  rp = applyRun(rp, 'rp-01', summary(50), day(2));
  assert.equal(rp.results['rp-01'].runs, 2);
  assert.equal(rp.results['rp-01'].bestPercent, 90);
  assert.equal(rp.results['rp-01'].lastPercent, 50);
  assert.equal(rp.log.length, 2);
});

test('applyRun does not change the old data', () => {
  const old = emptyRoleplay();
  applyRun(old, 'rp-01', summary(50), day(1));
  assert.deepEqual(old, { results: {}, log: [] });
});

test('the log keeps only the newest entries', () => {
  let rp = emptyRoleplay();
  for (let i = 0; i < MAX_LOG + 5; i += 1) rp = applyRun(rp, 'rp-01', summary(i % 100), day(1));
  assert.equal(rp.log.length, MAX_LOG);
  assert.equal(rp.log[0].percent, 5);
});

test('status and best percent', () => {
  const rp = applyRun(emptyRoleplay(), 'rp-01', summary(60), day(1));
  assert.equal(scenarioStatus(rp, 'rp-01'), 'done');
  assert.equal(scenarioStatus(rp, 'rp-02'), 'not-started');
  assert.equal(scenarioStatus(undefined, 'rp-02'), 'not-started');
  assert.equal(bestPercent(rp, 'rp-01'), 60);
  assert.equal(bestPercent(rp, 'rp-02'), null);
});

test('roleplaySummary counts played scenarios and strong ones (80% or more)', () => {
  let rp = applyRun(emptyRoleplay(), 'rp-01', summary(80), day(1));
  rp = applyRun(rp, 'rp-02', summary(79), day(1));
  assert.deepEqual(roleplaySummary(rp, scenarios), { total: 3, done: 2, strong: 1 });
  assert.deepEqual(roleplaySummary(emptyRoleplay(), scenarios), { total: 3, done: 0, strong: 0 });
});
