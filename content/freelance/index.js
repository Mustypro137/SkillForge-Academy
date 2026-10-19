// The Freelance academy (batch 1: 5 topics, batch 2: 6 topics). Each topic has a lesson with a quiz (this folder), a writing task
// (content/writing/) and a roleplay (content/roleplay/). A topic can use a writing task or a
// roleplay that is also shown on the Writing and Roleplay pages.
//
// "stage" groups the topics on the page, in the order the topics appear here.
// Lesson orders (21-38) are planned for all topics, so new topics fit in their stage later.

import { findingClients } from './finding-clients.js';
import { proposal } from './proposal.js';
import { portfolio } from './portfolio.js';
import { firstCall } from './first-call.js';
import { brief } from './brief.js';
import { pricing } from './pricing.js';
import { deadlines } from './deadlines.js';
import { changes } from './changes.js';
import { contracts } from './contracts.js';
import { sayingNo } from './saying-no.js';
import { payment } from './payment.js';
import { timeZones } from './time-zones.js';
import { workingWithTeam } from './working-with-team.js';
import { progressUpdates } from './progress-updates.js';
import { difficultClients } from './difficult-clients.js';
import { feedback } from './feedback.js';
import { delivery } from './delivery.js';
import { afterTheJob } from './after-the-job.js';

export const freelanceLessons = [findingClients, proposal, portfolio, firstCall, brief, pricing, contracts, sayingNo, deadlines, changes, payment, timeZones, workingWithTeam, progressUpdates, difficultClients, feedback, delivery, afterTheJob]
  .sort((a, b) => a.order - b.order);

export const freelanceTopics = [
  { id: 'fr-finding', stage: 'Get clients', title: 'Finding clients', summary: 'Write a short first message that does not sound like spam.', lessonId: 'freelance-finding', taskId: 'wr-17', scenarioId: 'rp-15' },
  { id: 'fr-proposal', stage: 'Get clients', title: 'Writing a proposal', summary: 'Show the problem, your plan, the price and a next step.', lessonId: 'freelance-proposal', taskId: 'wr-18', scenarioId: 'rp-16' },
  { id: 'fr-portfolio', stage: 'Get clients', title: 'Your portfolio and profile', summary: 'Describe a project with the problem, your action and the result.', lessonId: 'freelance-portfolio', taskId: 'wr-19', scenarioId: 'rp-17' },
  { id: 'fr-call', stage: 'Get clients', title: 'The first call', summary: 'Introduce yourself, check what you heard, and agree the next step.', lessonId: 'freelance-call', taskId: 'wr-20', scenarioId: 'rp-18' },
  { id: 'fr-brief', stage: 'Start the job', title: 'Understand the brief', summary: 'Ask clear questions when the request is vague.', lessonId: 'freelance-brief', taskId: 'wr-14', scenarioId: 'rp-12' },
  { id: 'fr-pricing', stage: 'Start the job', title: 'Pricing and quotes', summary: 'Give a clear quote and answer "your price is too high".', lessonId: 'freelance-pricing', taskId: 'wr-15', scenarioId: 'rp-05' },
  { id: 'fr-contracts', stage: 'Start the job', title: 'Contracts and terms', summary: 'Put the scope, fee and payment terms in simple words. (Not legal advice.)', lessonId: 'freelance-contracts', taskId: 'wr-21', scenarioId: 'rp-19' },
  { id: 'fr-no', stage: 'Start the job', title: 'Saying no politely', summary: 'Say no to a project that does not fit, and keep the door open.', lessonId: 'freelance-saying-no', taskId: 'wr-22', scenarioId: 'rp-20' },
  { id: 'fr-deadlines', stage: 'Do the job', title: 'Deadlines and delays', summary: 'Promise a real date, and tell a client about a delay.', lessonId: 'freelance-deadlines', taskId: 'wr-03', scenarioId: 'rp-01' },
  { id: 'fr-changes', stage: 'Do the job', title: 'Revisions and scope changes', summary: 'Say what is included, and answer "can you also add ... ?"', lessonId: 'freelance-changes', taskId: 'wr-04', scenarioId: 'rp-13' },
  { id: 'fr-timezones', stage: 'Start the job', title: 'Time zones and meeting times', summary: 'Suggest call slots with the time zone named.', lessonId: 'freelance-time-zones', taskId: 'wr-23', scenarioId: 'rp-21' },
  { id: 'fr-team', stage: 'Start the job', title: 'Working with a team', summary: 'Introduce a teammate and say who does what.', lessonId: 'freelance-working-with-team', taskId: 'wr-24', scenarioId: 'rp-22' },
  { id: 'fr-progress', stage: 'Do the job', title: 'Progress updates', summary: 'Send a short update: done, in progress, blockers, next.', lessonId: 'freelance-progress-updates', taskId: 'wr-25', scenarioId: 'rp-23' },
  { id: 'fr-payment', stage: 'Finish the job', title: 'Payment and invoices', summary: 'Send an invoice and remind a client politely.', lessonId: 'freelance-payment', taskId: 'wr-16', scenarioId: 'rp-14' },
  { id: 'fr-difficult', stage: 'Do the job', title: 'Difficult clients', summary: 'Stay calm and polite with an upset client.', lessonId: 'freelance-difficult-clients', taskId: 'wr-26', scenarioId: 'rp-24' },
  { id: 'fr-feedback', stage: 'Do the job', title: 'Feedback and testimonials', summary: 'Ask for feedback and a testimonial or referral.', lessonId: 'freelance-feedback', taskId: 'wr-27', scenarioId: 'rp-25' },
  { id: 'fr-delivery', stage: 'Finish the job', title: 'Delivering the finished work', summary: 'Send final files with clear names and next steps.', lessonId: 'freelance-delivery', taskId: 'wr-28', scenarioId: 'rp-26' },
  { id: 'fr-after', stage: 'Finish the job', title: 'After the job ends', summary: 'Send a thank-you and ask for a referral.', lessonId: 'freelance-after-the-job', taskId: 'wr-29', scenarioId: 'rp-27' },
];
