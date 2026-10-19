import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roleplayScenarios, findScenario } from '../content/roleplay/index.js';
import {
  analyzeScenario, createRun, currentStep, choose, submitWrite, isFinished, summarize, stepKind, bestOption,
} from '../js/logic/roleplay.js';
import { checkWriting } from '../js/logic/writing-check.js';

const writeSteps = roleplayScenarios.flatMap((s) => Object.values(s.steps).filter((st) => st.write).map((st) => ({ scenario: s, step: st })));

// Plays a scenario by always taking the option picked by "pick(step)".
function play(scenario, pick) {
  let run = createRun(scenario);
  for (let guard = 0; guard < 50 && !isFinished(scenario, run); guard += 1) {
    const step = currentStep(scenario, run);
    run = stepKind(step) === 'write' ? submitWrite(scenario, run, 'good') : choose(scenario, run, pick(step).id).run;
  }
  assert.equal(isFinished(scenario, run), true);
  return summarize(scenario, run);
}

test('scenario ids and orders are unique, and findScenario works', () => {
  assert.equal(new Set(roleplayScenarios.map((s) => s.id)).size, roleplayScenarios.length);
  assert.equal(new Set(roleplayScenarios.map((s) => s.order)).size, roleplayScenarios.length);
  for (const s of roleplayScenarios) assert.equal(findScenario(s.id), s);
  assert.equal(findScenario('nope'), null);
  assert.ok(roleplayScenarios.length >= 6);
});

test('every scenario has a title, a partner and a situation', () => {
  for (const s of roleplayScenarios) {
    assert.ok(s.title.length > 0 && s.situation.length > 0, s.id);
    assert.ok(s.partner.name && s.partner.role, s.id);
  }
});

test('every path of every scenario is sound: no dead ends, loops, missing feedback or unreachable steps', () => {
  for (const s of roleplayScenarios) {
    const result = analyzeScenario(s);
    assert.deepEqual(result.problems, [], s.id);
    assert.ok(result.paths >= 2, `${s.id} should branch`);
    assert.ok(result.minChoices >= 3, `${s.id} needs at least 3 choices on every path`);
  }
});

test('every scenario has at least one free reply (writing step)', () => {
  for (const s of roleplayScenarios) assert.ok(Object.values(s.steps).some((st) => st.write), s.id);
});

test('always choosing Best gives 100%, and always choosing the weakest gives less than 50%', () => {
  for (const s of roleplayScenarios) {
    assert.equal(play(s, bestOption).percent, 100, `${s.id} best path`);
    const worst = play(s, (step) => step.options.find((o) => o.rating === 'weak') ?? step.options[0]);
    assert.ok(worst.percent < 50, `${s.id} worst path is ${worst.percent}%`);
  }
});

test('each model reply passes every automatic check of its own writing step', () => {
  for (const { scenario, step } of writeSteps) {
    const result = checkWriting({ targetWords: step.write.targetWords, checks: step.write.checks }, step.write.model.text);
    const failed = result.results.filter((r) => !r.ok).map((r) => `${r.id}: ${r.message}`);
    assert.deepEqual(failed, [], `${scenario.id}/${step.id} model reply fails its own checks`);
  }
});

test('texts are in simple, American English: short messages, no British spelling', () => {
  const british = /\b(apologise|organise|colour|favour|behaviour|centre|programme|cheque|analyse|realise|whilst)\b/i;
  assert.doesNotMatch(JSON.stringify(roleplayScenarios), british);
  for (const s of roleplayScenarios) {
    for (const step of Object.values(s.steps)) {
      for (const line of step.say) assert.ok(line.split(/\s+/).length <= 30, `${s.id}/${step.id}: a message is too long`);
      for (const o of step.options ?? []) {
        assert.ok(o.text.split(/\s+/).length <= 45, `${s.id}/${step.id}/${o.id}: a reply is too long`);
        if (o.reaction) assert.ok(o.reaction.split(/\s+/).length <= 30, `${s.id}/${step.id}/${o.id}: a reaction is too long`);
      }
    }
  }
});
