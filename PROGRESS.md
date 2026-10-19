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

"Done" here means built, tested by Claude, and committed. Only you can confirm the items in the checklists below.

## Checked by Claude (what was really run)

| Check | Result |
|---|---|
| `npm test` (208 tests: router, storage, state, answer checking, progress, review schedule, dashboard, lesson content, writing checks, writing content, roleplay engine, roleplay content, LinkedIn content (50 exercises), academy progress, color contrast) | all pass |
| Color contrast of every text/background and control-border pair, light and dark theme (also part of `npm test`) | all meet WCAG AA |
| Page audit in Edge: 12 pages + lesson, 4 exercise types, feedback, results, notebook, review, settings preview, dashboard, at 360 / 768 / 1366 px (`tools/browser-audit.html`) | 143 of 143 clean (includes the Writing, Roleplay and LinkedIn screens): one h1, one main/nav/header, every control named, no duplicate ids, tap targets at least 44 px on phone, no sideways scrolling |
| Dark mode + 22 px text on all pages at 360 px | no sideways scrolling |
| Keyboard-only run with real key presses (`tools/keyboard-check.mjs`): skip link, menu, open lesson, number keys, Enter to check/next, hint, typing an answer, word-order exercise, phone menu with Escape, Settings | 33 of 33 pass |
| Writing page with real typing and key presses (`tools/writing-check.mjs`): old version-1 data still loads, open a task, empty check, weak text, model text passes all 8 checks, rating needed, save, history, copy button, draft kept after refresh and after leaving at once, dashboard card, phone width, no errors | 25 of 25 pass |
| Roleplay page with real key presses (`tools/roleplay-check.mjs`): version 2 data still loads, open and start with the keyboard, choose a reply, feedback for all 3 replies, the order changes between games, a whole conversation with only Best replies (100%), a whole conversation with weak replies and a bad free reply (To improve list), best result kept, leaving in the middle does not save, dashboard card, export and import, phone width, no errors | 30 of 30 pass |
| LinkedIn academy with real key presses and typing (`tools/linkedin-check.mjs`): the topic list, open a lesson with the keyboard, answer all 10 exercises (100%, Mastered), a wrong answer lands in the mistake notebook, the writing task and the roleplay open from the hub and are played, the topic shows "All 3 steps done", dashboard card, backup round trip, the 200-character limit, phone width, no errors | 28 of 28 pass |
| Edge cases (`tools/edge-cases-check.mjs`): browser blocks storage, storage full, app code not running (double-click) shows a helpful message, no uncaught errors | all pass |
| Console errors during the audit | none from the app |

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

## Known limits and bugs

- Wrong answers given before Milestone 5 are not in the Mistake notebook (they are only in the attempt history). New wrong answers are saved automatically.
- Answers are accepted only if they match the wording listed in the lesson (after ignoring capitals, spaces, commas, the final full stop and short forms). A correct answer in different words may be rejected. Report it and the exercise gets a new accepted answer.
- Free writing cannot be graded by the app (no AI service). Writing practice uses automatic checks, a checklist, model answers and your own rating.
- No sync between devices. Use Export and Import.
- LinkedIn advice changes over time. The lessons keep the advice general, and the 200-character limit for connection notes is the one rule that may differ on your account. The app never connects to LinkedIn.
- Roleplay is a fixed script: the other person does not react to your free reply, and a conversation left in the middle is not saved (only finished conversations count).
- Writing checks look at words and shape only. They can be fooled (a long text of nonsense can pass), and they do not check grammar or spelling. Your own reading and rating are the real test.
- Not tested: Firefox, Safari, a real phone, screen readers, and long-term use (the 16-day review gaps were tested with changed dates, not real waiting).
- Typing practice was removed, so the typing items in `project-plan.md` are no longer part of the project.

## After version 1 (not started)

M11 Freelance communication, M12 Technical English, M13 Reading comprehension, M14 Progress reports, M15 Offline install. Each one is planned in detail before it starts. See `project-plan.md`.
