// Numbers for the Progress reports page. Pure functions: they only read data.
// "data" is the saved app data: { attempts, writing, roleplay }.
// Dates are local days, so a late evening answer belongs to your day, not to UTC.

import { localDateString } from '../storage.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

function dayIndex(dateString, startString) {
  const [y, m, d] = dateString.split('-').map(Number);
  const [sy, sm, sd] = startString.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(sy, sm - 1, sd)) / DAY_MS);
}

function emptyDay(date) {
  return { date: localDateString(date), answers: 0, correct: 0, writings: 0, roleplays: 0, total: 0 };
}

// Counts every answer, saved writing and finished roleplay in a range of local days.
function collectActivity(data, startDate, days) {
  const byDate = new Map();
  for (let i = 0; i < days; i += 1) {
    const day = emptyDay(addDays(startDate, i));
    byDate.set(day.date, day);
  }
  const bump = (at, field) => {
    const time = Date.parse(at);
    if (!Number.isFinite(time)) return;
    const day = byDate.get(localDateString(new Date(time)));
    if (day) day[field] += 1;
  };
  for (const attempt of data?.attempts ?? []) {
    bump(attempt?.at, 'answers');
    if (attempt?.firstTry === true) {
      const day = byDate.get(localDateString(new Date(Date.parse(attempt.at))));
      if (day) day.correct += 1;
    }
  }
  for (const entry of data?.writing?.history ?? []) bump(entry?.at, 'writings');
  for (const entry of data?.roleplay?.log ?? []) bump(entry?.at, 'roleplays');
  for (const day of byDate.values()) day.total = day.answers + day.writings + day.roleplays;
  return byDate;
}

// The last N local days, oldest first. Each day has answers, correct, writings, roleplays, total.
export function activityByDay(data, days = 14, now = new Date()) {
  const count = Math.max(1, Math.min(365, Math.floor(Number(days)) || 14));
  const start = addDays(startOfDay(now), -(count - 1));
  return [...collectActivity(data, start, count).values()];
}

// Five weeks on a Monday-to-Sunday grid, ending with the current week.
// Future days are included so the table always has complete rows.
export function calendarWeeks(data, weeks = 5, now = new Date()) {
  const count = Math.max(1, Math.min(26, Math.floor(Number(weeks)) || 5));
  const today = startOfDay(now);
  const monday = addDays(today, -((today.getDay() + 6) % 7));
  const start = addDays(monday, -(count - 1) * 7);
  const activity = collectActivity(data, start, count * 7);
  const todayKey = localDateString(today);

  const rows = [];
  for (let w = 0; w < count; w += 1) {
    const days = [];
    for (let d = 0; d < 7; d += 1) {
      const date = addDays(start, w * 7 + d);
      const key = localDateString(date);
      const day = activity.get(key);
      days.push({
        ...day,
        dayOfMonth: date.getDate(),
        future: key > todayKey,
      });
    }
    rows.push({ start: localDateString(addDays(start, w * 7)), days });
  }
  return rows;
}

// The last N weeks (each 7 local days, oldest first).
// accuracy is null for a week with no answers.
// reviewCorrect counts review answers that were right on the first try.
export function weeklyStats(attempts, weeks = 8, now = new Date()) {
  const count = Math.max(1, Math.min(52, Math.floor(Number(weeks)) || 8));
  const end = startOfDay(now);
  const start = addDays(end, -(count * 7 - 1));
  const startKey = localDateString(start);
  const buckets = [];
  for (let i = 0; i < count; i += 1) {
    buckets.push({
      start: localDateString(addDays(start, i * 7)),
      answers: 0,
      correct: 0,
      reviewTotal: 0,
      reviewCorrect: 0,
      accuracy: null,
    });
  }

  for (const attempt of attempts ?? []) {
    const time = Date.parse(attempt?.at);
    if (!Number.isFinite(time)) continue;
    const index = dayIndex(localDateString(new Date(time)), startKey);
    if (index < 0 || index >= count * 7) continue;
    const bucket = buckets[Math.floor(index / 7)];
    bucket.answers += 1;
    if (attempt.firstTry === true) bucket.correct += 1;
    if (attempt.review === true) {
      bucket.reviewTotal += 1;
      if (attempt.firstTry === true) bucket.reviewCorrect += 1;
    }
  }

  for (const bucket of buckets) {
    bucket.accuracy = bucket.answers > 0 ? bucket.correct / bucket.answers : null;
  }
  return buckets;
}

// All-time totals, plus the number of different days with any practice.
export function overallStats(data, now = new Date()) {
  const attempts = (data?.attempts ?? []).filter((a) => Number.isFinite(Date.parse(a?.at)));
  const writings = (data?.writing?.history ?? []).filter((e) => Number.isFinite(Date.parse(e?.at)));
  const roleplays = (data?.roleplay?.log ?? []).filter((e) => Number.isFinite(Date.parse(e?.at)));
  const correct = attempts.filter((a) => a?.firstTry === true).length;
  const days = new Set([
    ...attempts.map((a) => localDateString(new Date(Date.parse(a.at)))),
    ...writings.map((e) => localDateString(new Date(Date.parse(e.at)))),
    ...roleplays.map((e) => localDateString(new Date(Date.parse(e.at)))),
  ]);
  const times = [
    ...attempts.map((a) => Date.parse(a.at)),
    ...writings.map((e) => Date.parse(e.at)),
    ...roleplays.map((e) => Date.parse(e.at)),
  ];
  return {
    answers: attempts.length,
    correct,
    accuracy: attempts.length > 0 ? correct / attempts.length : null,
    writings: writings.length,
    roleplays: roleplays.length,
    practiceDays: days.size,
    lastPractice: times.length > 0 ? new Date(Math.max(...times)).toISOString() : null,
  };
}
