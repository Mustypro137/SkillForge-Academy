// The list of all grammar lessons. To add a lesson: create a file in this folder
// and add it to the list below.

import { capitalsPunctuation } from './capitals-punctuation.js';
import { presentSimple } from './present-simple.js';
import { articles } from './articles.js';

export const grammarLessons = [capitalsPunctuation, presentSimple, articles]
  .sort((a, b) => a.order - b.order);

export function findLesson(id) {
  return grammarLessons.find((lesson) => lesson.id === id) ?? null;
}
