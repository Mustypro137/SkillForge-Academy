// The Technical English academy: 5 topics. Each topic has a lesson with a quiz (this folder), a writing task
// (content/writing/technical.js) and a roleplay (content/roleplay/technical.js).

import { bugReports } from './bug-reports.js';
import { commitMessages } from './commit-messages.js';
import { readmeSections } from './readme-sections.js';
import { technicalDecisions } from './technical-decisions.js';
import { technicalUpdates } from './technical-updates.js';

export const technicalLessons = [bugReports, commitMessages, readmeSections, technicalDecisions, technicalUpdates]
  .sort((a, b) => a.order - b.order);

export const technicalTopics = [
  { id: 'tech-bug', title: 'Writing a bug report', summary: 'Write a clear bug report: title, steps, expected vs actual, device.', lessonId: 'technical-bug-reports', taskId: 'wr-30', scenarioId: 'rp-28' },
  { id: 'tech-commit', title: 'Writing a commit message', summary: 'Write a short commit message: type, subject, blank line, body.', lessonId: 'technical-commit-messages', taskId: 'wr-31', scenarioId: 'rp-29' },
  { id: 'tech-readme', title: 'Writing a README section', summary: 'Write a short README: what it does, setup, usage.', lessonId: 'technical-readme-sections', taskId: 'wr-32', scenarioId: 'rp-30' },
  { id: 'tech-decision', title: 'Explaining a technical decision', summary: 'Write a decision note: decision, options, reason, trade-off.', lessonId: 'technical-decisions', taskId: 'wr-33', scenarioId: 'rp-31' },
  { id: 'tech-update', title: 'Writing a technical status update', summary: 'Write a status update: done, in progress, blocked, next.', lessonId: 'technical-updates', taskId: 'wr-34', scenarioId: 'rp-32' },
];
