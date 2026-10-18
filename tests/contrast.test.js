// Checks the color tokens in css/base.css against WCAG contrast rules (AA),
// so a color change can never silently make the app hard to read.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/base.css', import.meta.url), 'utf8');

function tokensIn(block) {
  const tokens = {};
  for (const m of block.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) tokens[m[1]] = m[2].toLowerCase();
  return tokens;
}

function blockStartingAt(marker) {
  const start = css.indexOf(marker);
  assert.notEqual(start, -1, `base.css has no "${marker}"`);
  return css.slice(start, css.indexOf('}', start));
}

const light = tokensIn(blockStartingAt(':root {'));
const dark = tokensIn(blockStartingAt(':root[data-theme="dark"]'));
const darkFromSystem = tokensIn(blockStartingAt(':root:not([data-theme="light"])'));

function luminance(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

// [text or shape color, background, minimum ratio]
const rules = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text-muted', 'bg', 4.5],
  ['text-muted', 'surface', 4.5],
  ['accent', 'bg', 4.5],              // links
  ['accent', 'surface', 4.5],
  ['accent-text', 'accent', 4.5],     // primary button text
  ['text', 'highlight', 4.5],
  ['error', 'surface', 4.5],
  ['error', 'error-bg', 4.5],
  ['text', 'error-bg', 4.5],
  ['success', 'surface', 4.5],
  ['success', 'bg', 4.5],
  ['on-error', 'error', 4.5],         // text on the red Reset button
  ['control-border', 'bg', 3],        // edges of buttons and inputs (non-text)
  ['control-border', 'surface', 3],
  ['focus', 'bg', 3],                 // keyboard focus ring
  ['focus', 'surface', 3],
];

for (const [themeName, tokens] of [['light', light], ['dark', dark]]) {
  test(`${themeName} theme: colors have enough contrast`, () => {
    for (const [fg, bg, minimum] of rules) {
      assert.ok(tokens[fg] && tokens[bg], `missing token ${fg} or ${bg}`);
      const ratio = contrast(tokens[fg], tokens[bg]);
      assert.ok(ratio >= minimum, `${themeName}: ${fg} on ${bg} is ${ratio.toFixed(2)}, needs ${minimum}`);
    }
  });
}

test('the two dark color blocks (system dark and chosen dark) are identical', () => {
  assert.deepEqual(darkFromSystem, dark);
});

test('light and dark define the same color names', () => {
  assert.deepEqual(Object.keys(dark).sort(), Object.keys(light).sort());
});
