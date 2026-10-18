import { renderPlaceholder } from './placeholder.js';

export function render(container) {
  renderPlaceholder(container, {
    title: 'Mistake notebook',
    text: 'Here your mistakes will be saved, explained and brought back for practice.',
    note: 'The mistake notebook is built in Milestone 5.',
  });
}
