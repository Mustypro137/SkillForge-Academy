import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findRoute } from '../js/router.js';
import { routes } from '../js/routes.js';

test('empty hash and "#/" open the dashboard', () => {
  assert.equal(findRoute('').id, 'dashboard');
  assert.equal(findRoute('#').id, 'dashboard');
  assert.equal(findRoute('#/').id, 'dashboard');
});

test('a known path finds its page', () => {
  assert.equal(findRoute('#/typing').id, 'typing');
  assert.equal(findRoute('#/mistakes').id, 'mistakes');
});

test('capital letters and a trailing slash are accepted', () => {
  assert.equal(findRoute('#/TYPING').id, 'typing');
  assert.equal(findRoute('#/typing/').id, 'typing');
});

test('an unknown path returns null (page not found)', () => {
  assert.equal(findRoute('#/unknown'), null);
  assert.equal(findRoute('#/typing/extra'), null);
});

test('missing input does not crash', () => {
  assert.equal(findRoute(undefined).id, 'dashboard');
  assert.equal(findRoute(null).id, 'dashboard');
});

test('every route has a unique id and a unique path', () => {
  const ids = routes.map((r) => r.id);
  const paths = routes.map((r) => r.path);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(paths).size, paths.length);
});
