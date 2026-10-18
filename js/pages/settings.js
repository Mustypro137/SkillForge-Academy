import { renderPlaceholder } from './placeholder.js';

export function render(container) {
  renderPlaceholder(container, {
    title: 'Settings and backup',
    text: 'Here you will change settings and save a backup of your progress.',
    note: 'Settings and backup are built in Milestone 3.',
  });
}
