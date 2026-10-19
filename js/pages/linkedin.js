// LinkedIn academy page. The screens are in academy.js; the content is in content/linkedin/.

import { renderAcademy } from './academy.js';
import { linkedinLessons, linkedinTopics } from '../../content/linkedin/index.js';

export function render(container) {
  renderAcademy(container, {
    title: 'LinkedIn academy',
    intro: 'Learn to write professional LinkedIn text in English: your headline and About section, connection notes, messages to recruiters, asking for advice, and posts. Do one topic at a time.',
    topics: linkedinTopics,
    lessons: linkedinLessons,
  });
}
