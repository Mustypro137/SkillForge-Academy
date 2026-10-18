import { renderPlaceholder } from './placeholder.js';

export function render(container) {
  renderPlaceholder(container, {
    title: 'Grammar practice',
    text: 'Here you will learn grammar in small steps, with hints and clear explanations.',
    note: 'Grammar lessons are built in Milestone 4.',
  });
}
