// One exercise on screen: the question, hints, feedback and the solution.
// Used by the grammar lessons now, and by the mistake notebook later.
//
// Flow: try an answer -> Check -> right: explanation / wrong: feedback, try again
// (a hint can be shown any time) -> after 2 wrong tries the solution is shown.
// The checking itself is in js/logic/answer-check.js.

import { el } from '../ui/dom.js';
import { checkAnswer, solutionText } from '../logic/answer-check.js';

const MAX_WRONG_TRIES = 2;

// ---------- Answer areas, one builder for each exercise type ----------
// Each builder returns:
//   node        the part of the screen where the learner answers
//   getResponse()      the answer for checkAnswer()
//   answerText(resp)   the answer as text (saved in the history)
//   onWrong(resp)      called after a wrong try
//   lock()             called when the exercise is finished
//   focus()            put the cursor in the right place

function buildChoices(exercise) {
  const name = `choice-${exercise.id}`;
  const rows = exercise.choices.map((text, i) => {
    const input = el('input', { type: 'radio', name, id: `${name}-${i}`, value: String(i) });
    const label = el('label', { for: input.id }, el('span', { class: 'choice-key', 'aria-hidden': 'true' }, String(i + 1)), text);
    return { input, label, row: el('div', { class: 'choice' }, input, label) };
  });
  const node = el('fieldset', { class: 'choices' },
    el('legend', { class: 'prompt' }, exercise.prompt),
    ...rows.map((r) => r.row));

  // Keys 1-4 choose an option while the focus is on the options.
  node.addEventListener('keydown', (event) => {
    const number = Number(event.key);
    const row = rows[number - 1];
    if (Number.isInteger(number) && row && !row.input.disabled) {
      row.input.checked = true;
      row.input.focus();
    }
  });

  const firstEnabled = () => rows.find((r) => !r.input.disabled);
  return {
    node,
    getResponse() {
      const index = rows.findIndex((r) => r.input.checked);
      return index === -1 ? null : index;
    },
    answerText: (response) => exercise.choices[response] ?? '',
    onWrong(response) {
      const wrong = rows[response];
      wrong.input.checked = false;
      wrong.input.disabled = true;
      wrong.label.classList.add('is-wrong');
      wrong.label.append(' (not correct)');
      firstEnabled()?.input.focus();
    },
    lock() {
      rows.forEach((r) => { r.input.disabled = true; });
      rows[exercise.correct].label.classList.add('is-right');
    },
    focus: () => firstEnabled()?.input.focus(),
  };
}

function buildText(exercise) {
  const inputId = `answer-${exercise.id}`;
  const input = el('input', {
    type: 'text', id: inputId, class: 'answer-input', value: exercise.given ?? '',
    autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false',
  });
  const parts = [el('p', { class: 'prompt' }, exercise.prompt)];
  if (exercise.given) parts.push(el('blockquote', { class: 'quote' }, exercise.given));
  const node = el('div', {}, ...parts,
    el('div', { class: 'field' }, el('label', { for: inputId }, 'Your answer'), input));

  return {
    node,
    getResponse: () => input.value,
    answerText: (response) => response.trim(),
    onWrong() { input.focus(); input.select(); },
    lock() { input.disabled = true; },
    focus() { input.focus(); input.setSelectionRange(input.value.length, input.value.length); },
  };
}

function buildReorder(exercise) {
  const chosen = []; // positions in exercise.words, in the order the learner tapped them
  const line = el('p', { class: 'answer-line', 'aria-live': 'polite' });
  const buttons = exercise.words.map((word, i) => {
    const button = el('button', { type: 'button', class: 'word-button' }, word);
    button.addEventListener('click', () => {
      chosen.push(i);
      refresh();
      (buttons.slice(i + 1).find((b) => !b.disabled) ?? buttons.find((b) => !b.disabled) ?? undo).focus();
    });
    return button;
  });
  const undo = el('button', { type: 'button', class: 'button button-secondary' }, 'Undo');
  const clear = el('button', { type: 'button', class: 'button button-secondary' }, 'Clear');

  function refresh() {
    const text = chosen.map((i) => exercise.words[i]).join(' ');
    line.textContent = text || 'Tap the words below, in the correct order.';
    line.classList.toggle('is-empty', !text);
    buttons.forEach((b, i) => { b.disabled = chosen.includes(i); });
    undo.disabled = clear.disabled = chosen.length === 0;
  }
  undo.addEventListener('click', () => {
    const removed = chosen.pop();
    refresh();
    buttons[removed]?.focus();
  });
  clear.addEventListener('click', () => {
    chosen.length = 0;
    refresh();
    buttons[0].focus();
  });
  refresh();

  const node = el('div', {},
    el('p', { class: 'prompt' }, exercise.prompt),
    line,
    el('div', { class: 'word-bank', role: 'group', 'aria-label': 'Words' }, ...buttons),
    el('div', { class: 'button-row' }, undo, clear));

  const text = () => chosen.map((i) => exercise.words[i]).join(' ');
  return {
    node,
    getResponse: text,
    answerText: (response) => response,
    onWrong() { (buttons.find((b) => !b.disabled) ?? undo).focus(); },
    lock() { [...buttons, undo, clear].forEach((b) => { b.disabled = true; }); },
    focus: () => buttons[0].focus(),
  };
}

const BUILDERS = {
  'multiple-choice': buildChoices,
  'fill-blank': buildText,
  'correct-sentence': buildText,
  reorder: buildReorder,
};

// ---------- The exercise screen ----------

// options:
//   exercise, position, total   what to show, and "Question 3 of 12"
//   nextLabel                   text of the button after the exercise
//   onFinish({ outcome, answer, tries, hintsUsed })   called once, when the exercise ends
//   onNext()                    called when the learner presses the next button
// outcome: 'correct' (first try, no hint), 'correct-with-help' or 'incorrect'
export function renderExercise(container, options) {
  const { exercise, position, total, onFinish, onNext } = options;
  const nextLabel = options.nextLabel ?? 'Next question';
  const builder = BUILDERS[exercise.type](exercise);

  let tries = 0;
  let hintsUsed = 0;
  let finished = false;
  let lastAnswer = '';

  const feedback = el('div', { class: 'feedback', role: 'status' });
  const hintList = el('ul', { class: 'hint-list', 'aria-live': 'polite' });
  const after = el('div', { class: 'after' });
  const checkButton = el('button', { class: 'button', type: 'submit' }, 'Check');
  const hintButton = el('button', { class: 'button button-secondary', type: 'button' });
  const solutionButton = el('button', { class: 'button button-secondary', type: 'button', hidden: true }, 'Show solution');
  const buttonRow = el('div', { class: 'button-row' }, checkButton, hintButton, solutionButton);
  const form = el('form', { class: 'exercise', novalidate: true },
    builder.node, hintList, feedback, buttonRow, after);

  function updateHintButton() {
    const left = exercise.hints.length - hintsUsed;
    hintButton.disabled = left === 0;
    hintButton.textContent = left === 0 ? 'No more hints' : `Show hint (${hintsUsed + 1} of ${exercise.hints.length})`;
  }

  function showFeedback(kind, headline, ...details) {
    feedback.className = `feedback feedback-${kind}`;
    feedback.replaceChildren(
      el('strong', {}, headline),
      ...details.filter(Boolean).map((text) => el('p', {}, text)));
  }

  function finish(outcome, showSolution) {
    finished = true;
    builder.lock();
    checkButton.hidden = true;
    hintButton.hidden = true;
    solutionButton.hidden = true;

    const parts = [];
    if (showSolution) {
      parts.push(el('p', { class: 'solution' }, el('strong', {}, 'Correct answer: '), solutionText(exercise)));
    }
    parts.push(el('p', { class: 'explanation' }, el('strong', {}, 'Why: '), exercise.explanation));
    const next = el('button', { class: 'button', type: 'button' }, nextLabel);
    next.addEventListener('click', onNext);
    after.replaceChildren(...parts, el('div', { class: 'button-row' }, next));
    next.focus();

    onFinish({ outcome, answer: lastAnswer, tries, hintsUsed });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (finished) return;

    const response = builder.getResponse();
    const check = checkAnswer(exercise, response);

    if (check.result === 'empty') {
      showFeedback('warn', check.feedback);
      return;
    }
    lastAnswer = builder.answerText(response);

    if (check.result === 'correct') {
      showFeedback('good', '✓ Correct!', check.tip);
      finish(tries === 0 && hintsUsed === 0 ? 'correct' : 'correct-with-help', false);
    } else if (check.result === 'close') {
      showFeedback('warn', `! ${check.feedback}`); // a small typo does not use a try
      builder.onWrong(response);
    } else {
      tries += 1;
      if (tries >= MAX_WRONG_TRIES) {
        showFeedback('bad', '✗ Not quite.', check.feedback, 'Here is the correct answer, with an explanation.');
        finish('incorrect', true);
      } else {
        showFeedback('bad', '✗ Not quite.', check.feedback, 'Try again. You can use a hint.');
        solutionButton.hidden = false;
        builder.onWrong(response);
      }
    }
  });

  hintButton.addEventListener('click', () => {
    if (finished || hintsUsed >= exercise.hints.length) return;
    hintList.append(el('li', {}, exercise.hints[hintsUsed]));
    hintsUsed += 1;
    updateHintButton();
  });

  solutionButton.addEventListener('click', () => {
    if (finished) return;
    showFeedback('bad', 'Here is the correct answer, with an explanation.');
    finish('incorrect', true);
  });

  updateHintButton();
  container.replaceChildren(
    el('p', { class: 'progress-label' }, `Question ${position} of ${total}`),
    el('progress', { max: String(total), value: String(position - 1), 'aria-hidden': 'true' }),
    form);
  builder.focus();
}
