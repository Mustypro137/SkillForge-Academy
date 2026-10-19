// Technical English academy page. The screens are in academy.js; the content is in content/technical/.

import { renderAcademy } from './academy.js';
import { technicalLessons, technicalTopics } from '../../content/technical/index.js';

export function render(container) {
  renderAcademy(container, {
    title: 'Technical English',
    intro: 'Learn to write clear technical text in English: bug reports, commit messages, README sections, decision notes, and status updates. Do one topic at a time.',
    topics: technicalTopics,
    lessons: technicalLessons,
  });
}
