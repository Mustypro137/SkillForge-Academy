// All lessons of all modules, and a way to find one exercise.
// When a new module is added (writing, reading, ...), add its lessons here.

import { grammarLessons } from './grammar/index.js';
import { linkedinLessons } from './linkedin/index.js';
import { freelanceLessons } from './freelance/index.js';

export const allLessons = [...grammarLessons, ...linkedinLessons, ...freelanceLessons];

// Returns { lesson, exercise }, or null if the exercise does not exist (any more).
export function findExercise(lessonId, exerciseId) {
  const lesson = allLessons.find((l) => l.id === lessonId);
  const exercise = lesson?.exercises.find((e) => e.id === exerciseId);
  return lesson && exercise ? { lesson, exercise } : null;
}
