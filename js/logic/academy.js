// Progress inside an academy (LinkedIn now; Freelance and Technical English later).
// An academy has topics. Each topic has three steps:
//   lesson - a lesson with a quiz (done when completed or mastered)
//   write  - a writing task (done when you saved at least one attempt)
//   talk   - a roleplay conversation (done when you finished it once)
// Pure functions: they only read data.

import { lessonSummary } from './progress.js';
import { taskStatus } from './writing-progress.js';
import { scenarioStatus } from './roleplay-progress.js';

export const STEPS = ['lesson', 'write', 'talk'];

// topic: { lessonId, taskId, scenarioId };  lessons: all lessons that can contain topic.lessonId
// Returns { lesson, write, talk }: the status text of each step,
//         { done }: how many of the 3 steps are done, and { next }: the first step not done (or null).
export function topicProgress(data, topic, lessons) {
  const lesson = lessons.find((l) => l.id === topic.lessonId);
  const lessonStatus = lesson
    ? lessonSummary(data.progress?.[lesson.id], lesson.exercises.map((e) => e.id)).status
    : 'not-started';
  const status = {
    lesson: lessonStatus,
    write: taskStatus(data.writing, topic.taskId),
    talk: scenarioStatus(data.roleplay, topic.scenarioId),
  };
  const done = {
    lesson: lessonStatus === 'completed' || lessonStatus === 'mastered',
    write: status.write === 'done',
    talk: status.talk === 'done',
  };
  return {
    ...status,
    isDone: done,
    done: STEPS.filter((step) => done[step]).length,
    next: STEPS.find((step) => !done[step]) ?? null,
  };
}

// total: topics;  complete: topics with all 3 steps done;  started: topics where you did something
// (a step done, a lesson in progress, or a draft)
export function academySummary(data, topics, lessons) {
  const progress = topics.map((topic) => topicProgress(data, topic, lessons));
  return {
    total: topics.length,
    complete: progress.filter((p) => p.done === STEPS.length).length,
    started: progress.filter((p) => p.done > 0 || [p.lesson, p.write, p.talk].some((s) => s !== 'not-started')).length,
  };
}
