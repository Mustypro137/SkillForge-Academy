import { renderPlaceholder } from './placeholder.js';

export function render(container) {
  renderPlaceholder(container, {
    title: 'Dashboard',
    text: 'Welcome to SkillForge Academy. This is your private place to practise English and professional messages.',
    note: 'The dashboard with your progress and next step is built in Milestone 6.',
  });
}
