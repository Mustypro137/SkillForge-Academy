// The Freelance academy. Each topic has a lesson with a quiz (this folder), a writing task
// (content/writing/) and a roleplay (content/roleplay/). A topic can use a writing task or a
// roleplay that is also shown on the Writing and Roleplay pages.
//
// "stage" groups the topics on the page, in the order the topics appear here.
// Lesson orders (21-38) are planned for all topics, so new topics fit in their stage later.

import { brief } from './brief.js';
import { pricing } from './pricing.js';
import { deadlines } from './deadlines.js';
import { changes } from './changes.js';
import { payment } from './payment.js';

export const freelanceLessons = [brief, pricing, deadlines, changes, payment]
  .sort((a, b) => a.order - b.order);

export const freelanceTopics = [
  { id: 'fr-brief', stage: 'Start the job', title: 'Understand the brief', summary: 'Ask clear questions when the request is vague.', lessonId: 'freelance-brief', taskId: 'wr-14', scenarioId: 'rp-12' },
  { id: 'fr-pricing', stage: 'Start the job', title: 'Pricing and quotes', summary: 'Give a clear quote and answer "your price is too high".', lessonId: 'freelance-pricing', taskId: 'wr-15', scenarioId: 'rp-05' },
  { id: 'fr-deadlines', stage: 'Do the job', title: 'Deadlines and delays', summary: 'Promise a real date, and tell a client about a delay.', lessonId: 'freelance-deadlines', taskId: 'wr-03', scenarioId: 'rp-01' },
  { id: 'fr-changes', stage: 'Do the job', title: 'Revisions and scope changes', summary: 'Say what is included, and answer "can you also add ... ?"', lessonId: 'freelance-changes', taskId: 'wr-04', scenarioId: 'rp-13' },
  { id: 'fr-payment', stage: 'Finish the job', title: 'Payment and invoices', summary: 'Send an invoice and remind a client politely.', lessonId: 'freelance-payment', taskId: 'wr-16', scenarioId: 'rp-14' },
];
