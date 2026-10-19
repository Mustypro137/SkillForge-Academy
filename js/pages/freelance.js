// Freelance academy page. The screens are in academy.js; the content is in content/freelance/.

import { renderAcademy } from './academy.js';
import { freelanceLessons, freelanceTopics } from '../../content/freelance/index.js';

export function render(container) {
  renderAcademy(container, {
    title: 'Freelance academy',
    intro: 'Learn the English you need to win and keep freelance clients: understanding a brief, pricing, deadlines, changes and payment. Do one topic at a time.',
    topics: freelanceTopics,
    lessons: freelanceLessons,
  });
}
