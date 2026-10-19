// All roleplay scenarios, in the order they are shown.
// To add a scenario: put it in one of the files here (or a new file), and list the file below.

import { clientAndJobScenarios } from './clients-and-jobs.js';
import { workplaceScenarios } from './workplace.js';
import { linkedinScenarios } from './linkedin.js';
import { freelanceScenarios } from './freelance.js';
import { freelanceStartScenarios } from './freelance-start.js';

export const roleplayScenarios = [...clientAndJobScenarios, ...workplaceScenarios, ...linkedinScenarios, ...freelanceScenarios, ...freelanceStartScenarios].sort((a, b) => a.order - b.order);

export function findScenario(id) {
  return roleplayScenarios.find((scenario) => scenario.id === id) ?? null;
}
