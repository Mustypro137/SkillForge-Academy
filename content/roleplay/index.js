// All roleplay scenarios, in the order they are shown.
// To add a scenario: put it in one of the files here (or a new file), and list the file below.

import { clientAndJobScenarios } from './clients-and-jobs.js';
import { workplaceScenarios } from './workplace.js';

export const roleplayScenarios = [...clientAndJobScenarios, ...workplaceScenarios].sort((a, b) => a.order - b.order);

export function findScenario(id) {
  return roleplayScenarios.find((scenario) => scenario.id === id) ?? null;
}
