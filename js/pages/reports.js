// Progress reports: simple charts and a practice calendar.
// The numbers come from js/logic/reports.js and js/logic/dashboard.js. This file only builds the screen.

import { el } from '../ui/dom.js';
import { setPage } from '../ui/page.js';
import { getData } from '../state.js';
import { allLessons, findExercise } from '../../content/index.js';
import { lessonOverview, skillStats } from '../logic/dashboard.js';
import { listMistakes } from '../logic/review-schedule.js';
import { activityByDay, calendarWeeks, weeklyStats, overallStats } from '../logic/reports.js';
import { skillTagLabel } from '../../content/skill-tags.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const percent = (fraction) => (fraction === null ? 'No data' : `${Math.round(fraction * 100)}%`);
const shortDate = (date) => {
  const [, month, day] = String(date).split('-').map(Number);
  return `${month}/${day}`;
};

function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    node.setAttribute(name, value === true ? '' : value);
  }
  for (const child of children) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  return node;
}

function statCard(title, big, lines) {
  return el('li', { class: 'card stat' },
    el('h2', {}, title),
    el('p', { class: 'stat-number' }, big),
    ...lines.filter(Boolean).map((line) => el('p', {}, line)));
}

// A simple SVG bar chart. Every bar has a <title>, so the value is available to a mouse
// and the whole chart has a title and description for screen readers.
function barChart(id, title, description, bars, { format = (value) => String(value), max = null } = {}) {
  const width = 640;
  const height = 200;
  const left = 38;
  const right = 8;
  const top = 18;
  const bottom = 36;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(1, max ?? 0, ...bars.map((bar) => bar.value));
  const step = plotWidth / Math.max(1, bars.length);
  const barWidth = Math.max(6, step * 0.62);
  const baseline = top + plotHeight;

  const children = [
    svg('title', { id: `${id}-title` }, title),
    svg('desc', { id: `${id}-desc` }, description),
    svg('text', { x: 0, y: top + 4, class: 'chart-axis-label' }, format(maxValue)),
    svg('text', { x: 0, y: baseline + 4, class: 'chart-axis-label' }, '0'),
    svg('line', { x1: left, y1: baseline, x2: width - right, y2: baseline, class: 'chart-axis' }),
  ];

  bars.forEach((bar, index) => {
    const value = Math.max(0, Number(bar.value) || 0);
    const barHeight = (value / maxValue) * plotHeight;
    const x = left + index * step + (step - barWidth) / 2;
    const y = baseline - barHeight;
    children.push(svg('rect', {
      x, y, width: barWidth, height: barHeight,
      class: value > 0 ? 'chart-bar' : 'chart-bar chart-bar-empty',
      rx: 3,
    }, svg('title', {}, bar.title)));
    if (bars.length <= 10 && value > 0) {
      children.push(svg('text', {
        x: x + barWidth / 2, y: Math.max(10, y - 4), class: 'chart-value', 'text-anchor': 'middle',
      }, bar.short ?? format(value)));
    }
  });

  const labelEvery = bars.length <= 10 ? 1 : 2;
  bars.forEach((bar, index) => {
    if ((bars.length - 1 - index) % labelEvery !== 0) return;
    children.push(svg('text', {
      x: left + index * step + step / 2,
      y: height - 12,
      class: 'chart-label',
      'text-anchor': 'middle',
    }, bar.label));
  });

  return svg('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'report-chart',
    role: 'img',
    'aria-labelledby': `${id}-title ${id}-desc`,
  }, ...children);
}

function activityChart(data, now) {
  const days = activityByDay(data, 14, now);
  const bars = days.map((day) => ({
    label: shortDate(day.date),
    value: day.total,
    short: String(day.total),
    title: `${day.date}: ${day.answers} answers, ${day.writings} writings, ${day.roleplays} conversations`,
  }));
  return barChart('activity-chart', 'Practice in the last 14 days',
    'Each bar shows answers, saved writings and finished conversations added together for one day.', bars);
}

function accuracyChart(attempts, now) {
  const weeks = weeklyStats(attempts, 8, now);
  const bars = weeks.map((week) => ({
    label: shortDate(week.start),
    value: week.accuracy ?? 0,
    short: week.accuracy === null ? '' : percent(week.accuracy),
    title: week.accuracy === null
      ? `Week of ${week.start}: no answers`
      : `Week of ${week.start}: ${week.correct} of ${week.answers} right on the first try (${percent(week.accuracy)})`,
  }));
  return barChart('accuracy-chart', 'Accuracy by week',
    'Each bar is one week. It shows the share of answers that were right on the first try. Empty weeks have no bar.', bars,
    { max: 1, format: percent });
}

function reviewChart(attempts, now) {
  const weeks = weeklyStats(attempts, 8, now);
  const bars = weeks.map((week) => ({
    label: shortDate(week.start),
    value: week.reviewCorrect,
    short: String(week.reviewCorrect),
    title: `Week of ${week.start}: ${week.reviewCorrect} right out of ${week.reviewTotal} review answers`,
  }));
  return barChart('review-chart', 'Review answers right by week',
    'Each bar counts review answers from the mistake notebook that were right on the first try.', bars);
}

function calendarTable(rows) {
  const head = el('thead', {},
    el('tr', {}, el('th', { scope: 'col' }, 'Week'), ...WEEKDAYS.map((day) => el('th', { scope: 'col' }, day))));
  const body = el('tbody', {}, ...rows.map((row) => el('tr', {},
    el('th', { scope: 'row' }, shortDate(row.start)),
    ...row.days.map((day) => {
      const classes = ['calendar-day'];
      if (day.total > 0) classes.push('active');
      if (day.future) classes.push('future');
      const label = day.future
        ? `${day.date}: future`
        : `${day.date}: ${day.total === 0 ? 'no practice' : `${day.answers} answers, ${day.writings} writings, ${day.roleplays} conversations`}`;
      const cell = el('td', { class: classes.join(' '), 'aria-label': label, title: label },
        el('span', { class: 'calendar-number' }, day.dayOfMonth));
      return cell;
    }))));
  return el('div', { class: 'calendar-wrap' },
    el('table', { class: 'practice-calendar' },
      el('caption', {}, 'Practice calendar: the last 5 weeks. A filled day has at least one answer, saved writing or finished conversation.'),
      head, body));
}

function skillList(attempts) {
  const stats = skillStats(attempts, (lessonId, exerciseId) => findExercise(lessonId, exerciseId)?.exercise.skillTags);
  if (stats.length === 0) {
    return el('p', {}, 'No skill data yet. Answer some questions and your accuracy for each skill will appear here.');
  }
  return el('ul', { class: 'skill-report' }, ...stats.map((stat) =>
    el('li', {},
      el('div', { class: 'skill-report-head' },
        el('strong', {}, skillTagLabel(stat.tag)),
        el('span', { class: 'meta' }, `${percent(stat.accuracy)} (${stat.correct} of ${stat.attempts})`)),
      el('div', {
        class: 'skill-bar',
        role: 'img',
        'aria-label': `${skillTagLabel(stat.tag)}: ${percent(stat.accuracy)} right on the first try, ${stat.attempts} answers`,
      }, el('span', { class: 'skill-bar-fill', style: `width: ${Math.round(stat.accuracy * 100)}%` })))));
}

function section(title, description, ...nodes) {
  const children = [el('h2', {}, title)];
  if (description) children.push(el('p', { class: 'meta' }, description));
  children.push(...nodes);
  return el('section', { class: 'report-section' }, ...children);
}

export function render(container) {
  const data = getData();
  const now = new Date();
  const totals = overallStats(data, now);
  const overview = lessonOverview(data, allLessons);
  const mistakes = listMistakes(data.mistakes, now);
  const calendar = calendarWeeks(data, 5, now);
  const noData = totals.answers === 0 && totals.writings === 0 && totals.roleplays === 0;

  const cards = el('ul', { class: 'stat-grid' },
    statCard('Answers (all time)', String(totals.answers), [
      totals.accuracy === null ? 'No answers yet.' : `${percent(totals.accuracy)} right on the first try`,
      `${totals.practiceDays} ${totals.practiceDays === 1 ? 'day' : 'days'} of practice`,
    ]),
    statCard('Lessons', `${overview.completed} of ${overview.total} done`, [
      `${overview.mastered} mastered`,
      `${overview.started - overview.completed} in progress`,
    ]),
    statCard('Mistakes', `${mistakes.mastered.length} mastered`, [
      `${mistakes.active.length} still active`,
      `${mistakes.due.length} due today`,
    ]),
    statCard('Writing and roleplay', `${totals.writings} writings`, [
      `${totals.roleplays} ${totals.roleplays === 1 ? 'conversation' : 'conversations'} finished`,
      totals.lastPractice ? `Last practice: ${new Date(totals.lastPractice).toLocaleDateString()}` : 'No practice yet.',
    ]));

  const accuracy = weeklyStats(data.attempts, 8, now);
  const reviewTotal = accuracy.reduce((sum, week) => sum + week.reviewTotal, 0);
  const reviewRight = accuracy.reduce((sum, week) => sum + week.reviewCorrect, 0);
  const intro = [
    el('h1', { tabindex: '-1' }, 'Progress reports'),
    el('p', {}, 'See how much you practice, how accurate you are, and which skills need work. All numbers come from this browser only.'),
  ];
  if (noData) intro.push(el('p', { class: 'note' }, 'No practice data yet. Finish a lesson, save a writing, or complete a roleplay, then come back.'));

  const chartSections = noData
    ? [el('p', { class: 'note' }, 'Charts will appear after your first practice.')]
    : [
      section('Practice in the last 14 days', 'Answers, saved writings and finished conversations added together.', activityChart(data, now)),
      section('Accuracy by week', 'The share of answers that were right on the first try. Empty weeks have no bar.', accuracyChart(data.attempts, now)),
      section('Mistakes fixed per week',
        reviewTotal === 0 ? 'No review answers yet. When you review mistakes, this chart shows your progress.' : `${reviewRight} of ${reviewTotal} review answers were right on the first try.`,
        reviewChart(data.attempts, now)),
      section('Accuracy by skill', 'Lowest accuracy first. A skill with few answers can jump around.', skillList(data.attempts)),
    ];

  setPage(container,
    ...intro,
    cards,
    section('Practice calendar', 'Filled days have at least one answer, saved writing or finished conversation.', calendarTable(calendar)),
    ...chartSections);
}
