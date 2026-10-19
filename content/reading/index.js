// All reading comprehension topics, in the order they are shown.
// Each topic = one text with a quiz (lesson) + one clarifying-question writing task.
// To add a topic: put the text in a file here, list it below, and add the task in content/writing/.

import { readingJobPost } from './job-post.js';
import { readingClientBrief } from './client-brief.js';
import { readingApiChange } from './api-change.js';
import { readingStatusReport } from './status-report.js';
import { readingMeetingNotes } from './meeting-notes.js';

export const readingLessons = [
  readingJobPost,
  readingClientBrief,
  readingApiChange,
  readingStatusReport,
  readingMeetingNotes,
].sort((a, b) => a.order - b.order);

// level 2 = everyday work text; level 3 = longer or more technical text.
export const readingTopics = [
  {
    id: 'read-job-post',
    title: 'A job post',
    summary: 'Find the requirements, the offer, and the one thing the company has not decided yet.',
    level: 2,
    lessonId: 'reading-job-post',
    taskId: 'wr-35',
  },
  {
    id: 'read-client-brief',
    title: 'A client brief',
    summary: 'Separate what the client wants from what they already have, and spot the open choice.',
    level: 2,
    lessonId: 'reading-client-brief',
    taskId: 'wr-36',
  },
  {
    id: 'read-api-change',
    title: 'An API change notice',
    summary: 'Read a technical notice: deadlines, changed fields, and the missing date.',
    level: 3,
    lessonId: 'reading-api-change',
    taskId: 'wr-37',
  },
  {
    id: 'read-status-report',
    title: 'A status report',
    summary: 'Tell finished work from work in progress, and find the problem and the risk.',
    level: 3,
    lessonId: 'reading-status-report',
    taskId: 'wr-38',
  },
  {
    id: 'read-meeting-notes',
    title: 'Meeting notes',
    summary: 'Follow who does what, what was decided, and what is still open.',
    level: 2,
    lessonId: 'reading-meeting-notes',
    taskId: 'wr-39',
  },
];
