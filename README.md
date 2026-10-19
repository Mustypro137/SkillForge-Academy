# SkillForge Academy

A private website to practice English for work: grammar lessons, a mistake notebook that brings mistakes back at the right time, and a dashboard that tells you what to do next.

- Everything stays in your browser on your device. No account, no server, no tracking, no cost.
- No packages to install. Plain HTML, CSS and JavaScript.

Version 1 (MVP, tag `v1.0`) is built, and all planned milestones are added: 8 (Writing practice), 9 (Roleplay), 10 (LinkedIn academy), 11 (Freelance academy), 12 (Technical English), 13 (Reading comprehension), 14 (Progress reports) and 15 (Offline install). See `PROGRESS.md` for what is done and what you still need to check, and `project-plan.md` for the full plan.

## What you can do

- **Dashboard:** your next step, lessons done, mistakes due, practice in the last 7 days, weak skills, backup reminder.
- **Grammar:** 3 lessons (capital letters and punctuation, present simple, articles), 12 exercises each. Four exercise types: multiple choice, fill in the blank, correct the sentence, word order. Try first, then use hints, then see the solution and the reason.
- **Writing:** 39 work-writing tasks (emails to coworkers and clients, status updates, asking for help, LinkedIn texts, freelance messages, technical texts, and clarifying questions). You write in a box, the app runs automatic checks (length, greeting, closing, request, tone, long sentences, task words), then you tick a self-review checklist, compare with a model answer, and rate yourself. Drafts and attempts are saved. A button copies your text, for example to paste it into Claude for detailed feedback.
- **Roleplay:** 32 work conversations (an angry client, a status update in a meeting, taking over a task, a recruiter, a discount request, saying no politely, and more for LinkedIn, freelance, and technical work). The other person writes to you. You choose a reply from 3 options (in a new order each time) and see why each one is Best, OK or Weak. In each conversation you also write one free reply, which gets the same automatic checks as Writing, a model reply, and your own rating. At the end you see a summary and a "To improve" list. A weak reply never ends the conversation.
- **LinkedIn academy:** 5 topics (headline and About, connection requests, messages to recruiters, asking for advice, posts and follow-ups). Each topic has 3 steps: a lesson with a 10-exercise quiz, a writing task, and a roleplay conversation. The quiz uses the same exercises as Grammar, so wrong answers go to the mistake notebook. The writing tasks and roleplays also appear on the Writing and Roleplay pages. The connection note task checks a character limit (200).
- **Freelance academy:** 18 topics in four stages: Get clients (finding clients, writing a proposal, your portfolio and profile, the first call), Start the job (understand the brief, pricing and quotes, contracts and terms in simple English, saying no politely, time zones, working with a team), Do the job (deadlines and delays, revisions and scope changes, progress updates, difficult clients, feedback) and Finish the job (payment and invoices, delivery, after the job). It works like the LinkedIn academy: a lesson with a 10-exercise quiz, a writing task and a roleplay for each topic. Some topics reuse tasks and roleplays that were already on the Writing and Roleplay pages.
- **Technical English:** 5 topics (bug reports, commit messages, README sections, technical decisions, status updates). It works like the other academies: a lesson with a 10-exercise quiz, a writing task, and a roleplay for each topic.
- **Reading comprehension:** 5 work texts (a job post, a client brief, an API change notice, a status report, meeting notes). The whole text stays on the screen while you answer 10 questions about the main idea, the details, and what is unclear. Then you write one short clarifying question about the text. Each text has a link to its writing task.
- **Mistake notebook:** wrong answers are saved and come back after 1, 2, 4, 8 and 16 days. Add notes, review, master them.
- **Progress reports:** answers and first-try accuracy, lessons done, mistakes mastered, a five-week practice calendar, 14-day practice chart, accuracy by week, review answers right per week, and accuracy by skill tag. Simple SVG charts with text descriptions for screen readers.
- **Settings and backup:** color theme, text size, export and import your progress as a file, reset.
- **Offline and install:** after the first load, a service worker saves the app so it opens with no internet. You can install it as an app from Chrome or Edge. Your data still stays in this browser.

All pages in the menu are built now, so nothing shows "Soon".

## Run the website

Browsers do not allow this kind of app from a double-clicked file, so use a small local server. In the project folder:

```
python -m http.server 8000
```

Then open <http://localhost:8000>. Stop the server with `Ctrl+C`.

After the first full load from localhost, the app works offline: the service worker saves every file it needs. Open the same `http://localhost:8000` address again with no internet and it should still start. In Chrome or Edge, use the install button in the address bar (or the browser menu) to install it as an app. On Android, use "Install app"; on iPhone or iPad, use Share > Add to Home Screen.

Service workers need `localhost` or HTTPS. That means the phone-on-Wi-Fi address below loads the app but does not install it or keep it offline. For offline use on a phone, put the site on an HTTPS address (for example GitHub Pages) or use a local HTTPS server.

To use it on your phone at home, run `python -m http.server 8000 --bind 0.0.0.0` and open `http://<your PC address>:8000` on a phone on the same Wi-Fi. Stop the server when you are done. Your progress is stored separately in each browser, so the phone and the PC do not share progress. Use Export and Import in Settings to move it.

## Your data and backups

- Progress is saved in this browser only (localStorage). If you clear your browser data, it is gone.
- Use **Settings > Export backup** now and then, and keep the file somewhere safe. The dashboard reminds you.
- **Import** checks the file first and shows what it contains. A copy of your current data is downloaded before it is replaced.
- Never put a backup file in this project folder. Backup files are ignored by git for safety.

## Run the tests

```
npm test
```

No `npm install` is needed. The tests cover the calculations and rules: answer checking, writing checks, roleplay engine, academy progress, scoring, review schedule, report numbers and calendars, saving and loading, backup files, dashboard numbers, lesson content, color contrast, the manifest, icons, service worker file list and offline registration.

Optional browser checks (need Microsoft Edge) are in `tools/`. Their instructions are at the top of each file.

## Folders

- `index.html` - the one page of the app
- `css/` - styles (colors and themes, layout, components)
- `js/main.js` - starts the app; `js/pwa.js` - registers the offline service worker; `js/router.js` and `js/routes.js` - which page to show
- `js/storage.js` - the only code that touches localStorage; `js/state.js` - your data in memory
- `js/logic/` - rules without screens: `answer-check.js`, `progress.js`, `review-schedule.js`, `dashboard.js`, `reports.js`, `writing-check.js`, `writing-progress.js`, `roleplay.js`, `roleplay-progress.js`, `academy.js`
- `js/pages/` - one file per page; `exercise-view.js` is the exercise screen shared by lessons and reviews, `lesson-player.js` is the lesson screens shared by Grammar and the academies, `academy.js` is the topic list of an academy
- `js/ui/` - small helpers (safe element builder, theme, file download)
- `content/` - lessons, writing tasks, roleplay scenarios and names (data only, no logic)
- `manifest.webmanifest`, `service-worker.js`, `icons/` - install and offline support
- `tests/` - automated tests (`npm test`)
- `tools/` - optional browser checks

## Add or change a grammar lesson

1. Copy one file in `content/grammar/` and change the text. Keep the same fields.
2. Add it to the list in `content/grammar/index.js`.
3. Give every exercise a new, unique `id`. Never change an `id` after you have used the app, because your progress is saved by `id`.
4. Add any new skill tag to `content/skill-tags.js`.
5. Run `npm test`. It checks that every accepted answer is accepted, and that no listed mistake is accepted.

Accepted answers can use `{a|b}` for alternatives. Example: `'I {have sent|sent} the file.'`

## Add or change a writing task

1. Copy a task in `content/writing/emails.js` (or `updates-and-help.js`) and change the text. Keep the same fields.
2. Give it a new, unique `id` and `order`. Never change an `id` after you have used the app (your drafts and history are saved by `id`).
3. Choose its automatic checks in `checks` (see the top of `js/logic/writing-check.js`). Write a model answer.
4. Run `npm test`. It checks that the model answer passes all the task's own checks.

## Add or change a LinkedIn, Freelance, or Technical English topic

1. A topic is one lesson (`content/linkedin/`, `content/freelance/`, or `content/technical/`, same fields as a grammar lesson, with `module: 'linkedin'`, `'freelance'`, or `'technical'`), one writing task (`content/writing/`) and one roleplay (`content/roleplay/`). A topic can reuse a task or a roleplay that already exists.
2. List the lesson and the topic in the `index.js` of that folder. Freelance topics also have a `stage` (the heading on the page). Use new, unique `id`s and `order`s. Never change an `id` after you have used the app.
3. Add any new skill tag to `content/skill-tags.js`. Run `npm test`: it checks every exercise, every roleplay path, and that each topic points to a real lesson, task and scenario.

## Add or change a reading text

1. Copy a lesson in `content/reading/` and change the text. A reading lesson has the same fields as a grammar lesson (`module: 'reading'`) plus a `passage` with a title and paragraphs. The passage stays on the screen while you answer.
2. List the lesson and the topic in `content/reading/index.js`. A topic points to one lesson and one clarifying-question task in `content/writing/reading.js`.
3. Keep the question types varied: a reading lesson should have multiple-choice, fill-blank, and reorder questions, and its last question should be about the best clarifying question.
4. Add any new skill tag to `content/skill-tags.js`. Run `npm test`: it checks the passage length, the question types, and that every model question passes its own writing checks.

## Add or change a roleplay scenario

1. Copy a scenario in `content/roleplay/` and change the text. A scenario is a set of steps: a step has what the other person says (`say`) and either 3 replies (`options`, each with a rating Best/OK/Weak, feedback, an optional `reaction`, and `next`), or a free reply (`write`), or it is the end (`end: true`).
2. Give it a new, unique `id` and `order`. Never change a scenario `id` after you have used the app (your results are saved by `id`).
3. Run `npm test`. It walks every path: no dead ends or loops, every reply has feedback, each step has a Best reply, always choosing Best gives 100%, and the model free replies pass their own checks.

## Known limits

- Answers are accepted only if they match the wording listed in the lesson (after ignoring capitals, extra spaces, commas, the final full stop, and short forms like don't). If a correct answer is rejected, tell the person maintaining the lessons, and a new accepted answer can be added.
- Free writing cannot be graded by the app without an AI service. Writing practice therefore uses automatic checks, a checklist, model answers and your own rating. A "Look at this" is advice, not a mistake.
- Roleplay is a fixed script. The other person does not react to your free reply, and a conversation left in the middle is not saved.
- One device, one browser: there is no sync.
- Tested in Microsoft Edge (Chromium). Chrome should behave the same. Firefox and Safari have not been tested.
