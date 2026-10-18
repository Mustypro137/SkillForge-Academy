// Settings and backup page: appearance, export/import, reset, storage size.

import { el } from '../ui/dom.js';
import { downloadTextFile } from '../ui/download.js';
import { getData, updateData, replaceData, resetData, getSaveError } from '../state.js';
import {
  THEMES, FONT_SIZES, MAX_IMPORT_BYTES, exportData, parseImport, dataSizeKb,
} from '../storage.js';

const THEME_LABELS = { system: 'Same as my device', light: 'Light', dark: 'Dark' };

export function render(container) {
  build(container, '');
}

function option(value, label, selected) {
  return el('option', { value: String(value), selected }, label);
}

function count(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

function formatDate(isoText) {
  return new Date(isoText).toLocaleString();
}

function lastBackupText(data) {
  if (!data.lastBackupAt) return 'You have not made a backup yet. Please export one.';
  const days = Math.floor((Date.now() - Date.parse(data.lastBackupAt)) / 86400000);
  const ago = days <= 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`;
  return `Last backup: ${formatDate(data.lastBackupAt)} (${ago}).`;
}

function build(container, firstMessage) {
  const data = getData();

  // A message area that screen readers announce when its text changes.
  const status = el('p', { class: 'status', role: 'status' }, firstMessage);
  function say(text, isError = false) {
    status.textContent = text;
    status.classList.toggle('status-error', isError);
  }
  const sayAfterSave = (text) => {
    const problem = getSaveError();
    if (problem) say(problem, true);
    else say(text);
  };

  // ----- Appearance -----
  const theme = el('select', { id: 'set-theme' },
    ...THEMES.map((t) => option(t, THEME_LABELS[t], data.settings.theme === t)));
  const fontSize = el('select', { id: 'set-font' },
    ...FONT_SIZES.map((s) => option(s, `${s} px`, data.settings.fontSize === s)));
  const soon = el('input', { type: 'checkbox', id: 'set-soon', checked: data.settings.showComingSoon });

  theme.addEventListener('change', () => {
    updateData((d) => { d.settings.theme = theme.value; });
    sayAfterSave('Saved.');
  });
  fontSize.addEventListener('change', () => {
    updateData((d) => { d.settings.fontSize = Number(fontSize.value); });
    sayAfterSave('Saved.');
  });
  soon.addEventListener('change', () => {
    updateData((d) => { d.settings.showComingSoon = soon.checked; });
    sayAfterSave('Saved.');
  });

  // ----- Backup: export -----
  const lastBackup = el('p', {}, lastBackupText(data));
  const exportButton = el('button', { class: 'button', type: 'button' }, 'Export backup');
  exportButton.addEventListener('click', () => {
    const out = exportData(getData());
    downloadTextFile(out.filename, out.json);
    updateData((d) => { d.lastBackupAt = out.data.lastBackupAt; });
    lastBackup.textContent = lastBackupText(getData());
    sayAfterSave(`Backup file "${out.filename}" was downloaded. Keep it in a safe place.`);
  });

  // ----- Backup: import -----
  const fileInput = el('input', { type: 'file', id: 'set-import', accept: '.json,application/json' });
  const preview = el('div', { class: 'panel', hidden: true });

  function hidePreview() {
    preview.hidden = true;
    preview.replaceChildren();
  }

  function showPreview(result) {
    const { summary } = result;
    const confirm = el('button', { class: 'button', type: 'button' }, 'Replace my data with this backup');
    const cancel = el('button', { class: 'button button-secondary', type: 'button' }, 'Cancel');
    cancel.addEventListener('click', () => { hidePreview(); fileInput.value = ''; say('Import cancelled. Nothing was changed.'); });
    confirm.addEventListener('click', () => {
      const safety = exportData(getData());
      downloadTextFile(`before-import-${safety.filename}`, safety.json); // safety copy of current data
      replaceData(result.data);
      build(container, 'Backup imported. A copy of your previous data was downloaded first.');
    });
    preview.replaceChildren(
      el('h3', {}, 'This backup contains'),
      el('ul', {},
        el('li', {}, `${count(summary.lessons, 'lesson', 'lessons')} with progress`),
        el('li', {}, count(summary.attempts, 'answer', 'answers')),
        el('li', {}, count(summary.mistakes, 'saved mistake', 'saved mistakes')),
        el('li', {}, `Created: ${formatDate(summary.createdAt)}`)),
      el('p', {}, 'Importing replaces everything you have now. A copy of your current data is downloaded first.'),
      el('div', { class: 'button-row' }, confirm, cancel));
    preview.hidden = false;
  }

  fileInput.addEventListener('change', async () => {
    hidePreview();
    const file = fileInput.files[0];
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      say('This file is too large to be a SkillForge backup.', true);
      return;
    }
    let text;
    try {
      text = await file.text();
    } catch {
      say('The file could not be read.', true);
      return;
    }
    const result = parseImport(text);
    if (!result.ok) {
      say(`${result.error} Nothing was changed.`, true);
      return;
    }
    say('Backup file is valid. Check the details below, then confirm.');
    showPreview(result);
  });

  // ----- Reset -----
  const resetInput = el('input', { type: 'text', id: 'set-reset', autocomplete: 'off', spellcheck: 'false' });
  const resetButton = el('button', { class: 'button button-danger', type: 'button', disabled: true }, 'Reset all data');
  resetInput.addEventListener('input', () => { resetButton.disabled = resetInput.value !== 'RESET'; });
  resetButton.addEventListener('click', () => {
    const safety = exportData(getData());
    downloadTextFile(`before-reset-${safety.filename}`, safety.json);
    resetData();
    build(container, 'All data was reset. A backup of the old data was downloaded first.');
  });

  const heading = el('h1', { tabindex: '-1' }, 'Settings and backup');
  container.replaceChildren(
    heading,
    status,

    el('h2', {}, 'Appearance'),
    el('div', { class: 'field' }, el('label', { for: 'set-theme' }, 'Color theme'), theme),
    el('div', { class: 'field' }, el('label', { for: 'set-font' }, 'Text size'), fontSize),
    el('div', { class: 'field-check' }, soon, el('label', { for: 'set-soon' }, 'Show pages that are coming soon in the menu')),

    el('h2', {}, 'Backup'),
    el('p', {}, 'Your progress is saved only in this browser, on this device. If you clear your browser data, it is lost. Export a backup file now and then, and keep it safe.'),
    lastBackup,
    el('div', { class: 'button-row' }, exportButton),
    el('div', { class: 'field' },
      el('label', { for: 'set-import' }, 'Import a backup file'),
      fileInput),
    preview,

    el('h2', {}, 'Storage'),
    el('p', {}, `Your data uses about ${dataSizeKb(data)} KB. Browsers usually allow about 5000 KB.`),

    el('h2', {}, 'Reset'),
    el('p', {}, 'This deletes all your progress and settings. A backup file is downloaded first. Type RESET in capital letters to turn on the button.'),
    el('div', { class: 'field' }, el('label', { for: 'set-reset' }, 'Type RESET to confirm'), resetInput),
    el('div', { class: 'button-row' }, resetButton));

  if (firstMessage) heading.focus();
}
