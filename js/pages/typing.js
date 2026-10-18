import { renderPlaceholder } from './placeholder.js';

export function render(container) {
  renderPlaceholder(container, {
    title: 'Typing practice',
    text: 'Here you will practise typing and see your speed (WPM) and accuracy.',
    note: 'Typing practice is built in Milestone 2.',
  });
}
