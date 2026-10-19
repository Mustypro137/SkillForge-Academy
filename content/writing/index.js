// All writing tasks, in the order they are shown.
// To add a task: put it in one of the files here (or a new file), and list the file below.

import { emailTasks } from './emails.js';
import { updateTasks } from './updates-and-help.js';
import { linkedinTasks } from './linkedin.js';

export const writingTasks = [...emailTasks, ...updateTasks, ...linkedinTasks].sort((a, b) => a.order - b.order);

export function findTask(id) {
  return writingTasks.find((task) => task.id === id) ?? null;
}
