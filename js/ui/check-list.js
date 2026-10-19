// The list of automatic writing checks, shared by the Writing page and the Roleplay page.
// "results" is the output of checkWriting() in js/logic/writing-check.js.

import { el } from './dom.js';

export function checkItem(result) {
  return el('li', { class: `check-item ${result.ok ? 'check-ok' : 'check-look'}` },
    el('span', { class: 'check-mark' }, result.ok ? '✓ OK' : '! Look at this'),
    el('strong', {}, result.label),
    el('span', {}, result.message));
}

// A heading, a short summary and the list. The heading can take focus (tabindex -1).
export function checkResults(result, headingId = 'results-heading') {
  const advice = result.passed === result.total
    ? 'Every automatic check is OK. Now read your text once more, then compare it with the model answer below.'
    : 'Read each "Look at this" and decide if you want to change your text. You can edit the text and check again.';
  return [
    el('h2', { tabindex: '-1', id: headingId }, 'Automatic checks'),
    el('p', { class: 'score' }, `${result.passed} of ${result.total} checks are OK.`),
    el('p', {}, advice),
    el('ul', { class: 'check-list' }, ...result.results.map(checkItem)),
  ];
}
