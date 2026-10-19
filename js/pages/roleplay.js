// Roleplay page: scenario list -> intro -> conversation -> summary.
// The rules (steps, scoring) are in js/logic/roleplay.js. The scenarios are in content/roleplay/.
// The other person's messages are written in advance. The app does not understand what you write:
// choices have a fixed rating, and free replies get the automatic writing checks and your own rating.

import { el } from '../ui/dom.js';
import { button, setPage } from '../ui/page.js';
import { checkResults } from '../ui/check-list.js';
import { roleplayScenarios } from '../../content/roleplay/index.js';
import {
  createRun, currentStep, stepKind, choose, submitWrite, shuffle, summarize, RATING_LABELS,
} from '../logic/roleplay.js';
import { scenarioStatus, bestPercent } from '../logic/roleplay-progress.js';
import { RATINGS as SELF_RATINGS, RATING_LABELS as SELF_LABELS, MAX_TEXT } from '../logic/writing-progress.js';
import { checkWriting, countWords } from '../logic/writing-check.js';
import { getData, getSaveError, recordRoleplay } from '../state.js';
import { takeIntent } from '../intent.js';

const STATUS_LABELS = { 'not-started': 'Not started', done: 'Done' };

export function render(container) {
  // The LinkedIn academy can ask for a specific scenario.
  const intent = takeIntent();
  const scenario = intent?.scenarioId ? roleplayScenarios.find((s) => s.id === intent.scenarioId) : null;
  if (scenario) showIntro(container, scenario);
  else showList(container);
}

// ---------- Scenario list ----------

function scenarioCard(container, scenario) {
  const roleplay = getData().roleplay;
  const status = scenarioStatus(roleplay, scenario.id);
  const details = [`With ${scenario.partner.name} (${scenario.partner.role})`, STATUS_LABELS[status]];
  const best = bestPercent(roleplay, scenario.id);
  if (best !== null) details.push(`Best result: ${best}%`);
  const label = status === 'done' ? 'Play again' : 'Open scenario';
  const open = button(label, () => showIntro(container, scenario));
  open.setAttribute('aria-label', `${label}: ${scenario.title}`);
  return el('li', { class: 'card' }, el('h2', {}, scenario.title), el('p', { class: 'meta' }, details.join(' · ')), open);
}

function showList(container) {
  setPage(container,
    el('h1', { tabindex: '-1' }, 'Roleplay: work conversations'),
    el('p', {}, 'Practice a short conversation with a client, a manager or a coworker. The other person writes to you. You choose a reply, and sometimes you write your own. After each choice you see why it is Best, OK or Weak.'),
    el('p', { class: 'note' }, 'A weak reply never ends the conversation. The other person is a fixed script, not a real person or an AI. The choices change their order each time you play.'),
    el('ul', { class: 'lesson-list' }, ...roleplayScenarios.map((scenario) => scenarioCard(container, scenario))));
}

// ---------- Intro ----------

function showIntro(container, scenario) {
  const best = bestPercent(getData().roleplay, scenario.id);
  const nodes = [
    el('h1', { tabindex: '-1' }, scenario.title),
    el('p', { class: 'meta' }, `With ${scenario.partner.name} (${scenario.partner.role}) · Level ${scenario.level}`),
    el('h2', {}, 'The situation'),
    el('p', {}, scenario.situation),
    el('p', {}, 'Read each message, then choose the reply you think is best. You will see feedback on every reply, and a summary at the end.'),
  ];
  if (best !== null) nodes.push(el('p', {}, `Your best result so far: ${best}%.`));
  nodes.push(el('div', { class: 'button-row' },
    button('Start the conversation', () => startConversation(container, scenario)),
    button('All scenarios', () => showList(container), true)));
  setPage(container, ...nodes);
}

// ---------- The conversation ----------

function startConversation(container, scenario) {
  let run = createRun(scenario);
  let ratingCounter = 0;

  const heading = el('h1', { tabindex: '-1' }, scenario.title);
  const chat = el('ol', { class: 'chat', role: 'log', 'aria-label': 'Conversation' });
  const turn = el('div', { class: 'turn' });
  const leave = button('Leave the conversation', () => showIntro(container, scenario), true);

  function addBubble(who, text, mine = false) {
    chat.append(el('li', { class: `bubble ${mine ? 'bubble-you' : 'bubble-them'}` },
      el('span', { class: 'who' }, mine ? 'You' : who),
      el('p', {}, text)));
  }

  function showTurn(...nodes) {
    turn.replaceChildren(...nodes);
    const first = turn.querySelector('h2');
    first?.focus();
    turn.scrollIntoView?.({ block: 'nearest' });
  }

  function enterStep() {
    const step = currentStep(scenario, run);
    for (const line of step.say) addBubble(scenario.partner.name, line);
    const kind = stepKind(step);
    if (kind === 'choice') showChoice(step);
    else if (kind === 'write') showWrite(step);
    else showEnd();
  }

  // --- Choose a reply
  function showChoice(step) {
    const shown = shuffle(step.options);
    const buttons = shown.map((option) => {
      const b = el('button', { class: 'reply-option', type: 'button' }, option.text);
      b.addEventListener('click', () => pick(step, shown, option));
      return el('li', {}, b);
    });
    showTurn(el('h2', { tabindex: '-1' }, 'Choose your reply'), el('ul', { class: 'reply-options' }, ...buttons));
  }

  function pick(step, shown, option) {
    run = choose(scenario, run, option.id).run;
    addBubble('', option.text, true);
    const feedback = shown.map((o) => el('li', { class: `rating-${o.rating}${o === option ? ' is-chosen' : ''}` },
      el('span', { class: 'rating-label' }, `${RATING_LABELS[o.rating]}${o === option ? ' (your reply)' : ''}: `),
      o.text,
      el('p', {}, o.feedback)));
    if (option.reaction) addBubble(scenario.partner.name, option.reaction);
    showTurn(
      el('h2', { tabindex: '-1' }, `Your reply was ${RATING_LABELS[option.rating]}`),
      el('p', {}, option.feedback),
      el('h3', {}, 'All the replies'),
      el('ul', { class: 'reply-feedback' }, ...feedback),
      el('div', { class: 'button-row' }, button('Continue', enterStep)));
  }

  // --- Write your own reply
  function showWrite(step) {
    const w = step.write;
    const textarea = el('textarea', { id: 'rp-text', class: 'writing-input', rows: '8', maxlength: String(MAX_TEXT), 'aria-describedby': 'rp-count' });
    const count = el('p', { id: 'rp-count', class: 'meta' });
    const updateCount = () => {
      const n = countWords(textarea.value);
      count.textContent = `${n} ${n === 1 ? 'word' : 'words'}. Aim for ${w.targetWords.min} to ${w.targetWords.max}.`;
    };
    updateCount();
    textarea.addEventListener('input', updateCount);

    const status = el('p', { class: 'status', role: 'status' });
    const results = el('div', { class: 'writing-results' });
    const after = el('div', { class: 'writing-after' });
    let afterBuilt = false;

    const check = button('Check my reply', () => {
      const result = checkWriting({ targetWords: w.targetWords, checks: w.checks }, textarea.value);
      if (result.empty) { status.textContent = 'Write something first, then check it.'; return; }
      status.textContent = '';
      results.replaceChildren(...checkResults(result, 'rp-results-heading'));
      if (!afterBuilt) { buildAfter(); afterBuilt = true; }
      results.querySelector('h2').focus();
    });

    function buildAfter() {
      ratingCounter += 1;
      const group = `rp-rating-${ratingCounter}`;
      const inputs = SELF_RATINGS.map((rating) => ({ rating, id: `${group}-${rating}`, input: el('input', { type: 'radio', name: group, id: `${group}-${rating}` }) }));
      const saveStatus = el('p', { class: 'status status-error', role: 'status' });
      const next = button('Send my reply and continue', () => {
        const chosen = inputs.find(({ input }) => input.checked);
        if (!chosen) { saveStatus.textContent = 'Choose how you rate your reply first.'; return; }
        addBubble('', textarea.value, true);
        run = submitWrite(scenario, run, chosen.rating);
        enterStep();
      });
      after.replaceChildren(
        el('h3', {}, 'A model reply'),
        el('pre', { class: 'model-text' }, w.model.text),
        el('p', {}, el('strong', {}, 'Why it works: '), w.model.why),
        el('p', { class: 'note' }, 'There is more than one good reply. Compare the ideas, not every word.'),
        el('fieldset', { class: 'plain-fieldset' },
          el('legend', {}, 'How do you rate your reply?'),
          ...inputs.map(({ rating, id, input }) => el('div', { class: 'field-check' }, input, el('label', { for: id }, SELF_LABELS[rating])))),
        el('div', { class: 'button-row' }, next),
        saveStatus);
    }

    showTurn(
      el('h2', { tabindex: '-1' }, 'Write your reply'),
      el('p', {}, w.prompt),
      el('div', { class: 'field' }, el('label', { for: 'rp-text' }, 'Your reply'), textarea, count),
      el('div', { class: 'button-row' }, check),
      status, results, after);
  }

  // --- The end
  function showEnd() {
    const summary = summarize(scenario, run);
    const before = bestPercent(getData().roleplay, scenario.id);
    recordRoleplay(scenario.id, summary);
    const error = getSaveError();

    let message = 'Read the "To improve" list below, then play again. The replies will be in a new order.';
    if (summary.percent >= 80) message = 'Strong result! Play again to see the other replies, or try another scenario.';
    else if (summary.percent >= 50) message = 'A good start. Read the "To improve" list, then play again to get more Best replies.';

    const nodes = [
      el('h2', { tabindex: '-1' }, 'Conversation finished'),
      el('p', { class: 'score' }, `${summary.percent}% of the points`),
      el('p', {}, `You chose ${summary.best} Best, ${summary.ok} OK and ${summary.weak} Weak ${summary.choices === 1 ? 'reply' : 'replies'}.`),
      el('p', {}, message),
    ];
    if (before !== null) nodes.push(el('p', {}, `Your best result before this game: ${before}%.`));
    if (summary.writes.length > 0) {
      nodes.push(el('p', {}, `Your own rating of your free ${summary.writes.length === 1 ? 'reply' : 'replies'}: ${summary.writes.map((x) => SELF_LABELS[x.rating]).join(', ')}.`));
    }
    if (error) nodes.push(el('p', { class: 'status status-error', role: 'status' }, error));
    if (summary.toImprove.length > 0) {
      nodes.push(
        el('h3', {}, 'To improve'),
        el('ol', { class: 'improve-list' }, ...summary.toImprove.map((item) => el('li', {},
          el('div', {}, el('strong', {}, 'They said: '), `“${item.heard}”`),
          el('div', {}, el('strong', {}, `You said (${RATING_LABELS[item.rating]}): `), item.chosen),
          el('div', {}, el('strong', {}, 'Why: '), item.why),
          el('div', {}, el('strong', {}, 'Better: '), item.better)))));
    }
    nodes.push(el('div', { class: 'button-row' },
      button('Play again', () => startConversation(container, scenario)),
      button('All scenarios', () => showList(container), true)));
    showTurn(...nodes);
  }

  container.replaceChildren(heading, el('p', { class: 'meta' }, scenario.situation), chat, turn, el('div', { class: 'button-row' }, leave));
  window.scrollTo(0, 0);
  enterStep();
}
