# Progress

## Milestones

- [x] M1 Foundation and app shell
- [x] M2 Typing practice - REMOVED at the owner's request (code kept in git commit 65305ca)
- [x] M3 Storage, settings, backup
- [x] M4 Question engine and grammar
- [x] M5 Mistake notebook
- [x] M6 Dashboard
- [x] M7 Polish and full check - done. **Version 1 is tagged `v1.0`** (owner finished the final check)
- [x] M8 Writing practice - built and tested by Claude; **waits for your check (see "Milestone 8: your check" below)**
- [x] M9 Roleplay - built and tested by Claude; **waits for your check (see "Milestone 9: your check" below)**
- [x] M10 LinkedIn academy - built and tested by Claude; **waits for your check (see "Milestone 10: your check" below)**
- [~] M11 Freelance academy - **all 3 batches done** (18 topics); **waits for your checks (see "Milestone 11, batch 1", "batch 2" and "batch 3" below)**
- [x] M12 Technical English - built and tested by Claude; **waits for your check (see "Milestone 12" below)**
- [x] M13 Reading comprehension - built and tested by Claude; **waits for your check (see "Milestone 13" below)**
- [x] M14 Progress reports - built and tested by Claude; **waits for your check (see "Milestone 14" below)**
- [x] M15 Offline install - built and tested by Claude; **waits for your check (see "Milestone 15" below)**

"Done" here means built, tested by Claude, and committed. Only you can confirm the items in the checklists below.

## Checked by Claude (what was really run)

| Check | Result |
|---|---|
| `npm test` (230 tests: router, storage, state, answer checking, progress, review schedule, dashboard, report numbers and calendars, lesson content, writing checks, writing content, roleplay engine, roleplay content, LinkedIn, Freelance, Technical and Reading content (366 quiz exercises), academy progress, color contrast, the manifest, icons and service worker file list) | all pass |
| Color contrast of every text/background and control-border pair, light and dark theme (also part of `npm test`) | all meet WCAG AA |
| Page audit in Edge: 11 pages + lesson, 4 exercise types, feedback, results, notebook, review, settings preview, dashboard and the Progress reports screens, at 360 / 768 / 1366 px (`tools/browser-audit.html`) | 152 of 152 clean (includes the Writing, Roleplay, LinkedIn, Freelance and Progress reports screens): one h1, one main/nav/header, every control named, no duplicate ids, tap targets at least 44 px on phone, no sideways scrolling |
| Dark mode + 22 px text on all pages at 360 px | no sideways scrolling |
| Keyboard-only run with real key presses (`tools/keyboard-check.mjs`): skip link, menu, open lesson, number keys, Enter to check/next, hint, typing an answer, word-order exercise, phone menu with Escape, Settings | 33 of 33 pass |
| Writing page with real typing and key presses (`tools/writing-check.mjs`): old version-1 data still loads, open a task, empty check, weak text, model text passes all 8 checks, rating needed, save, history, copy button, draft kept after refresh and after leaving at once, dashboard card, phone width, no errors | 25 of 25 pass |
| Roleplay page with real key presses (`tools/roleplay-check.mjs`): version 2 data still loads, open and start with the keyboard, choose a reply, feedback for all 3 replies, the order changes between games, a whole conversation with only Best replies (100%), a whole conversation with weak replies and a bad free reply (To improve list), best result kept, leaving in the middle does not save, dashboard card, export and import, phone width, no errors | 30 of 30 pass |
| LinkedIn academy with real key presses and typing (`tools/linkedin-check.mjs`): the topic list, open a lesson with the keyboard, answer all 10 exercises (100%, Mastered), a wrong answer lands in the mistake notebook, the writing task and the roleplay open from the hub and are played, the topic shows "All 3 steps done", dashboard card, backup round trip, the 200-character limit, phone width, no errors | 28 of 28 pass |
| Every one of the 18 Freelance topics in a real browser (`tools/freelance-check.mjs`, part 9): the quiz with all correct answers (10 of 10), the writing task with its model text (all automatic checks OK, saved), and the roleplay with all Best replies (100%); then all topics say "All 3 steps done" and the dashboard shows all 18 | 79 of 79 pass (the whole Freelance test) |
| Progress reports with seeded data (`tools/reports-check.mjs`): the friendly empty state with no charts, the stat cards, the mistakes card, the practice calendar and its day labels, the 14-day activity chart, accuracy by week, review answers right per week, accuracy by skill (lowest first), phone width, no NaN and no errors | 31 of 31 pass |
| Offline and install in Edge (`tools/pwa-check.mjs`): the manifest parses with no errors, the service worker activates at the site root and claims the page, the cache holds all 105 files, then a real offline reload opens the app and the Grammar lesson and Progress reports pages from the cache with the saved progress still there, and normal use continues online | 28 of 28 pass |
| Edge cases (`tools/edge-cases-check.mjs`): browser blocks storage, storage full, app code not running (double-click) shows a helpful message, no uncaught errors | all pass |
| Console errors during the audit | none from the app |

Found and fixed in M15: nothing in the app. The manifest, the service worker, the cache and a real offline reload all worked the first time in headless Edge.

Found and fixed in M14: the reports page wrote "1 writings" and "1 conversations" when a count was one (now "1 writing" and "1 conversation", in the stat card, the chart tooltips and the calendar day labels). Nothing else.

Found and fixed in M11 batch 2: nothing in the app. The new content passed all the content tests the first time.

Found and fixed in M11 batch 1: nothing in the app. The new content passed all the content tests and the browser tests the first time.

Found and fixed in M10: the "started" count on the dashboard card ignored a lesson in progress (now counted). Grammar was moved to a shared lesson player; the keyboard test (33 of 33) and the page audit prove that Grammar still works the same.

Found and fixed in M9: the browser tools sometimes started before the app had finished loading (fixed in the tools by waiting for the page). Nothing was wrong in the app.

Found and fixed in M8: the checkboxes and radio buttons of the writing checklist were only 29 px high on a phone (now 44 px), and 3-letter words in capitals such as NOW were not counted as shouting.

Bugs found and fixed in M7: the skip link broke the router (it showed "Page not found"), the first page load took keyboard focus away from the skip link and menu, faint borders on inputs and buttons (contrast 1.3:1), unreadable text on the red Reset button in dark mode, sideways scrolling of the dashboard at 768 px, a too-small file chooser on phones, and a wrong instruction in lesson exercise `ps-04` ("write two words" for a three-word answer).

## Version 1 final check (finished by the owner on 2026-10-19)

Run `python -m http.server 8000` and open http://localhost:8000.

**1. Read the lessons (most important)**
- [ ] Read the 3 lesson explanations. Is the English clear and correct?
- [ ] Do each lesson. Did any correct answer get rejected? Does any explanation sound wrong? (Tell Claude the exercise number, for example `ps-07`.)
- [ ] The hints help without giving the answer away

**2. Learning flow**
- [ ] Wrong answers: feedback, hint, retry, then the solution and "Why" after 2 wrong tries
- [ ] A typo in a one-word answer says "Almost!" and does not use a try
- [ ] Capitals and the final full stop do not matter in normal exercises; they DO matter in the capital-letters lesson
- [ ] Refresh in the middle of a lesson, then "Continue" starts at the next question
- [ ] 80% or more right on the first try = "Mastered"
- [ ] A mistake appears in the Mistake notebook; notes save; Delete asks first
- [ ] To test a review today: DevTools (F12) > Application > Local Storage > `skillforge-data`, set a mistake's `dueDate` to `2020-01-01`, refresh. Review it: it moves up a box. Wrong: back to box 1. Right in box 5: mastered
- [ ] Does the review timing (1, 2, 4, 8, 16 days) feel right?

**3. Dashboard**
- [ ] The next-step button opens the right place
- [ ] Numbers look right after a few lessons; weak areas appear after 5+ answers on a skill under 80%
- [ ] The backup card says "No backup yet", then "Last backup today" after an export

**4. Backup and safety**
- [ ] Export a backup file; Reset; Import it: everything comes back
- [ ] Import a wrong file (for example a .txt file): clear error, nothing changes
- [ ] Change `skillforge-data` to `{abc` in DevTools and refresh: a red warning appears and the app still works

**5. Phone and other browsers**
- [ ] On your phone: the pages are readable, buttons are easy to tap, the on-screen keyboard does not hide the answer box, the menu opens and closes
- [ ] Chrome (should be the same as Edge) and Firefox, if you have them: all pages open and a lesson works
- [ ] Windows Narrator (optional): the page heading and the "Correct" / "Not quite" feedback are read aloud

When everything is ticked, tell Claude. Then the version can be tagged:

```
git tag v1.0
```

## Milestone 8: your check (only you can do these)

Run `python -m http.server 8000` and open http://localhost:8000/#/writing

- [ ] **Read the 8 tasks and the 8 model answers.** Is the English clear, natural and correct (American spelling)? Is any situation unclear? Tell Claude the task number, for example `wr-03`.
- [ ] Write your own text for 2 or 3 tasks. Do the automatic checks feel fair? If a check says "Look at this" for good writing (or says OK for bad writing), tell Claude the task number and your text.
- [ ] The model answer appears only after you press "Check my text"
- [ ] Tick the checklist, choose a rating, add a note, save: the attempt appears under "Your saved attempts"
- [ ] Refresh in the middle of writing: your text is still there
- [ ] The dashboard shows the Writing card and "writings saved" in Last 7 days
- [ ] Settings: export a backup, reset, import it: your writing comes back. Import an old backup file from before M8 (if you have one): it still works
- [ ] On your phone: the writing box is easy to use and the on-screen keyboard does not hide the buttons
- [ ] "Copy my text" copies your text (paste it somewhere to check)

## Milestone 9: your check (only you can do these)

Run `python -m http.server 8000` and open http://localhost:8000/#/roleplay

- [ ] **Read the 6 conversations** (what the other person says, the 3 replies on each step, the feedback, the free-reply prompts and the model replies). Is the English natural and correct (American spelling)? Is every Best reply really the best? Is any Weak reply actually fine? Tell Claude the scenario and step, for example `rp-04`, step `s2`.
- [ ] Play 2 conversations. Does the other person's reaction fit the reply you chose?
- [ ] The feedback after a reply helps you understand why (not only "wrong")
- [ ] Write your own free reply. Do the automatic checks feel fair?
- [ ] The summary and the "To improve" list are clear
- [ ] Play the same conversation again: the replies are in a new order
- [ ] Dashboard: the Roleplay card and "conversations finished" in Last 7 days
- [ ] Settings: export, reset, import: your roleplay results come back
- [ ] On your phone: the chat is easy to read and the reply buttons are easy to tap

## Milestone 10: your check (only you can do these)

Run `python -m http.server 8000` and open http://localhost:8000/#/linkedin

- [ ] **Read the 5 lessons and the 50 quiz exercises.** Is the English clear, natural and correct (American spelling)? Did any correct answer get rejected? Tell Claude the exercise number, for example `lr-04`.
- [ ] **Is the LinkedIn advice right for you?** For example: the 200-character limit for connection notes (your account may allow 200 or 300), no empty words like "passionate", asking for small things. Tell Claude if something is wrong or out of date.
- [ ] Read the 5 writing tasks (`wr-09` to `wr-13`) and the 5 roleplays (`rp-07` to `rp-11`) with their model answers
- [ ] Do one whole topic: lesson and quiz, then Write, then Talk. Does the page show your progress and the next step correctly?
- [ ] A wrong quiz answer appears in the Mistake notebook (under All mistakes, because new mistakes are due tomorrow)
- [ ] Settings: export, reset, import: your LinkedIn progress comes back
- [ ] On your phone: the topic list, the buttons and the quiz are easy to use

## Milestone 11, batch 1: your check (only you can do these)

Run `python -m http.server 8000` and open http://localhost:8000/#/freelance

- [ ] **Read the 5 lessons and the 50 quiz exercises** (`fb-`, `fp-`, `fd-`, `fc-`, `fy-`). Is the English clear and correct (American spelling)? Did any correct answer get rejected? Tell Claude the exercise number, for example `fp-03`.
- [ ] **Is the freelance advice right for you?** For example: put prices and scope in writing, tell clients about delays early, a polite first payment reminder. Tell Claude if something does not match how you work. The prices in the examples are made up.
- [ ] Read the 3 new writing tasks (`wr-14`, `wr-15`, `wr-16`) and the 3 new roleplays (`rp-12`, `rp-13`, `rp-14`) with their model answers. The topics also use `wr-03`, `wr-04`, `rp-01`, `rp-05`, which you read in earlier checks.
- [ ] Do one whole topic: lesson and quiz, Write, Talk. Does the page show your progress and the next step correctly? Are the three stage headings easy to use?
- [ ] On your phone: the topic list, the buttons and the quiz are easy to use

When this is done, check batch 2 as well.

## Milestone 11, batch 2: your check (only you can do these)

Run `python -m http.server 8000` and open http://localhost:8000/#/freelance

- [ ] **Read the 6 new lessons and the 60 quiz exercises** (`ff-` finding clients, `fq-` proposal, `fo-` portfolio, `fl-` first call, `fk-` contracts, `fn-` saying no). Is the English clear and correct (American spelling)? Did any correct answer get rejected? Tell Claude the exercise number, for example `fk-07`.
- [ ] **Is the advice right for you?** For example: a short, specific first message (no copying), the proposal parts (problem, plan, price, next step), a portfolio with a number as the result, asking to repeat on a call, a deposit, a polite no with an option. The contracts lesson says "not legal advice": is it clear enough? Tell Claude if something does not match how you work.
- [ ] Read the 6 new writing tasks (`wr-17` to `wr-22`) and the 6 new roleplays (`rp-15` to `rp-20`) with their model answers.
- [ ] Do one whole topic from the "Get clients" stage. Are the four stage headings easy to use?
- [ ] On your phone: the longer topic list is still easy to use

When this is done, tell Claude to start batch 3.

## Milestone 11, batch 3: your check (only you can do these)

Run `python -m http.server 8000` and open http://localhost:8000/#/freelance

- [ ] **Read the 7 new lessons and the 70 quiz exercises** (`fa-` time zones, `ft-` working with a team, `fu-` progress updates, `fw-` difficult clients, `fx-` feedback, `fv-` delivery, `fz-` after the job). Is the English clear and correct (American spelling)? Did any correct answer get rejected? Tell Claude the exercise number, for example `fw-06`.
- [ ] **Is the advice right for you?** For example: agree on time zones in writing, give a short update before the client asks, separate the person from the problem, ask for specific feedback, send a delivery checklist, ask for a testimonial after a good result. Tell Claude if something does not match how you work.
- [ ] Read the 7 new writing tasks (`wr-23` to `wr-29`) and the 7 new roleplays (`rp-21` to `rp-27`) with their model answers.
- [ ] Do one whole topic from the "Do the job" or "Finish the job" stage. Does the page show your progress and the next step correctly?
- [ ] On your phone: the longer topic list is still easy to use

## Milestone 12: your check (only you can do these)

Run `python -m http.server 8000` and open http://localhost:8000/#/technical

- [ ] **Read the 5 lessons and the 50 quiz exercises** (`tb-` bug reports, `tc-` commit messages, `tr-` README sections, `td-` technical decisions, `tu-` status updates). Is the English clear and correct (American spelling)? Did any correct answer get rejected? Tell Claude the exercise number, for example `tc-04`.
- [ ] **Is the technical advice right for you?** For example: a bug report with exact steps and device, a commit subject under 50 characters, a README with setup and usage, a decision note with options and a trade-off, a status update with blocked and next. Tell Claude if something does not match your tools or team.
- [ ] Read the 5 writing tasks (`wr-30` to `wr-34`) and the 5 roleplays (`rp-28` to `rp-32`) with their model answers.
- [ ] Do one whole topic: lesson and quiz, Write, Talk. Does the page show your progress and the next step correctly?
- [ ] On your phone: code examples and lists are easy to read

## Milestone 13: your check (only you can do these)

Run `python -m http.server 8000` and open http://localhost:8000/#/reading

- [ ] **Read the 5 texts and the 50 questions** (`rj-` job post, `rc-` client brief, `ra-` API change, `rs-` status report, `rm-` meeting notes). Is the English clear, natural and correct (American spelling)? Did any correct answer get rejected? Tell Claude the exercise number, for example `ra-05`.
- [ ] **Is each question fair?** Does the text really contain the answer? Is the "unclear" part really unclear, and is the best clarifying question the one you would ask? Tell Claude if a question has two good answers or feels like a trick.
- [ ] **Is the text long enough and still easy to read?** The whole text stays above the questions while you answer. Is that helpful on your phone, or does it take too much space?
- [ ] Read the 5 writing tasks (`wr-35` to `wr-39`) with their model answers. Do the checks accept your own question? The tasks ask for one short question, not a full email.
- [ ] Do one whole text: read and answer the quiz, then click "Ask a clarifying question". Does the Writing page open the right task?
- [ ] On your phone: the text, the question and the buttons are easy to use

## Milestone 14: your check (only you can do these)

Run `python -m http.server 8000` and open http://localhost:8000/#/reports

- [ ] **Do the numbers match what you did?** Compare the answer total and first-try accuracy with the Dashboard. Check the lessons done, mistakes mastered, writings and conversations.
- [ ] **Read the charts.** Does the practice calendar fill the right days? Does the 14-day chart match your recent practice? Does "Accuracy by week" use the right weeks?
- [ ] **Is "Mistakes fixed per week" the right idea?** It counts review answers from the notebook that were right on the first try. It does not count a mistake as "fixed" when it moves to the next box. Tell Claude if you want different wording or numbers.
- [ ] **Check "Accuracy by skill".** Does it show the skills you expect? Is the lowest-first order useful? A skill with one or two answers can jump around; is that clear?
- [ ] With no data (use a private window or reset a copy), the page should show friendly empty text, not zero-height bars or "NaN".
- [ ] On your phone: the calendar and charts are easy to read and do not need sideways scrolling (except the calendar wrapper if the screen is very narrow)

## Milestone 15: your check (only you can do these)

Run `python -m http.server 8000` and open http://localhost:8000

- [ ] **Check the install:** in Chrome or Edge, the address bar or menu shows an install button. Install the app, open it from the new icon, and check that it starts at the Dashboard.
- [ ] **Check the manifest:** open DevTools > Application > Manifest. The name, icons, theme color and start URL should be correct, with no errors.
- [ ] **Check the service worker:** DevTools > Application > Service Workers shows `service-worker.js` as activated. The Cache Storage list shows `skillforge-v1`.
- [ ] **Check offline:** in DevTools > Network, choose Offline, then reload. The app should open and all pages, lessons, writing tasks and roleplays should still work. Your saved progress should still be there.
- [ ] **Check an update:** change a text in a lesson, reload twice, and check that the new text appears. If it does not, the cache name needs a new version. (In normal use, this only matters when the app files change.)
- [ ] **On a phone:** install it from an HTTPS address. The plain `http://<PC>:8000` Wi-Fi address loads the app but cannot install it or work offline, because service workers need HTTPS or localhost. Is that explained clearly in the README?
- [ ] Clear the site data and check that the app still starts and creates fresh data (nothing should break).

## Known limits and bugs

- Wrong answers given before Milestone 5 are not in the Mistake notebook (they are only in the attempt history). New wrong answers are saved automatically.
- Answers are accepted only if they match the wording listed in the lesson (after ignoring capitals, spaces, commas, the final full stop and short forms). A correct answer in different words may be rejected. Report it and the exercise gets a new accepted answer.
- Free writing cannot be graded by the app (no AI service). Writing practice uses automatic checks, a checklist, model answers and your own rating.
- No sync between devices. Use Export and Import.
- Freelance advice depends on the country and the client. The lessons keep it general (be clear, be polite, put things in writing), give no legal advice, and use made-up prices.
- LinkedIn advice changes over time. The lessons keep the advice general, and the 200-character limit for connection notes is the one rule that may differ on your account. The app never connects to LinkedIn.
- Roleplay is a fixed script: the other person does not react to your free reply, and a conversation left in the middle is not saved (only finished conversations count).
- Writing checks look at words and shape only. They can be fooled (a long text of nonsense can pass), and they do not check grammar or spelling. Your own reading and rating are the real test.
- Progress reports use your local days and the last 5 or 8 weeks. "Mistakes fixed per week" counts review answers that were right on the first try; it is not the same as the number of mistakes that reached box 5.
- Offline install needs one full online load first. Service workers need `localhost` or HTTPS, so the plain phone-on-Wi-Fi address cannot install or work offline. When app files change, the cache name in `service-worker.js` must be updated, and the browser may need two reloads to show the new version.
- Not tested: Firefox, Safari, a real phone, screen readers, and long-term use (the 16-day review gaps were tested with changed dates, not real waiting). Offline mode and install were tested in headless Edge, not on a real phone.
- Typing practice was removed, so the typing items in `project-plan.md` are no longer part of the project.

## After version 1 (complete)

Done: M8 Writing practice, M9 Roleplay, M10 LinkedIn academy, M11 Freelance academy (batches 1 to 3), M12 Technical English, M13 Reading comprehension, M14 Progress reports, M15 Offline install.

All planned milestones are built. Your manual checks above are still the real test. See `project-plan.md` for the original plan and optional ideas.
