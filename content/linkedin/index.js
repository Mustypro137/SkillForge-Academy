// The LinkedIn academy: 5 topics. Each topic has a lesson with a quiz (this folder), a writing task
// (content/writing/linkedin.js) and a roleplay (content/roleplay/linkedin.js).

import { headlineAbout } from './headline-about.js';
import { connectionRequests } from './connection-requests.js';
import { recruiters } from './recruiters.js';
import { askingHelp } from './asking-help.js';
import { postsFollowups } from './posts-followups.js';

export const linkedinLessons = [headlineAbout, connectionRequests, recruiters, askingHelp, postsFollowups]
  .sort((a, b) => a.order - b.order);

export const linkedinTopics = [
  { id: 'li-headline', title: 'Headline and About', summary: 'Say what you do, with facts and no empty words.', lessonId: 'linkedin-headline-about', taskId: 'wr-09', scenarioId: 'rp-07' },
  { id: 'li-connect', title: 'Connection requests', summary: 'A short, specific, polite note.', lessonId: 'linkedin-connection-requests', taskId: 'wr-10', scenarioId: 'rp-08' },
  { id: 'li-recruiters', title: 'Messages to recruiters', summary: 'Reply clearly and politely to a job offer.', lessonId: 'linkedin-recruiters', taskId: 'wr-11', scenarioId: 'rp-09' },
  { id: 'li-help', title: 'Asking for advice', summary: 'Make a small request that is easy to say yes to.', lessonId: 'linkedin-asking-help', taskId: 'wr-12', scenarioId: 'rp-10' },
  { id: 'li-posts', title: 'Posts and follow-ups', summary: 'Share your work, and remind people politely.', lessonId: 'linkedin-posts-followups', taskId: 'wr-13', scenarioId: 'rp-11' },
];
