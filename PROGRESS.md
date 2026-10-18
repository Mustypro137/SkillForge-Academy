# Progress

## Milestones

- [x] M1 Foundation and app shell
- [x] M2 Typing practice - REMOVED at the owner's request (code kept in git commit 65305ca)
- [x] M3 Storage, settings, backup
- [x] M4 Question engine and grammar
- [x] M5 Mistake notebook
- [x] M6 Dashboard
- [x] M7 Polish and full check - done by Claude; **version 1 is not tagged `v1.0` until you finish the checklist below**

"Done" here means built, tested by Claude, and committed. Only you can confirm the items in "Your final check".

## Checked by Claude (what was really run)

| Check | Result |
|---|---|
| `npm test` (126 tests: router, storage, state, answer checking, progress, review schedule, dashboard, lesson content, color contrast) | all pass |
| Color contrast of every text/background and control-border pair, light and dark theme (also part of `npm test`) | all meet WCAG AA |
| Page audit in Edge: 12 pages + lesson, 4 exercise types, feedback, results, notebook, review, settings preview, dashboard, at 360 / 768 / 1366 px (`tools/browser-audit.html`) | 98 of 98 clean: one h1, one main/nav/header, every control named, no duplicate ids, tap targets at least 44 px on phone, no sideways scrolling |
| Dark mode + 22 px text on all pages at 360 px | no sideways scrolling |
| Keyboard-only run with real key presses (`tools/keyboard-check.mjs`): skip link, menu, open lesson, number keys, Enter to check/next, hint, typing an answer, word-order exercise, phone menu with Escape, Settings | 33 of 33 pass |
| Edge cases (`tools/edge-cases-check.mjs`): browser blocks storage, storage full, app code not running (double-click) shows a helpful message, no uncaught errors | all pass |
| Console errors during the audit | none from the app |

Bugs found and fixed in M7: the skip link broke the router (it showed "Page not found"), the first page load took keyboard focus away from the skip link and menu, faint borders on inputs and buttons (contrast 1.3:1), unreadable text on the red Reset button in dark mode, sideways scrolling of the dashboard at 768 px, a too-small file chooser on phones, and a wrong instruction in lesson exercise `ps-04` ("write two words" for a three-word answer).

## Your final check (only you can do these)

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

## Known limits and bugs

- Wrong answers given before Milestone 5 are not in the Mistake notebook (they are only in the attempt history). New wrong answers are saved automatically.
- Answers are accepted only if they match the wording listed in the lesson (after ignoring capitals, spaces, commas, the final full stop and short forms). A correct answer in different words may be rejected. Report it and the exercise gets a new accepted answer.
- Free writing cannot be graded by the app (no AI service). Writing practice is planned with checklists and model answers.
- No sync between devices. Use Export and Import.
- Not tested: Firefox, Safari, a real phone, screen readers, and long-term use (the 16-day review gaps were tested with changed dates, not real waiting).
- Typing practice was removed, so the typing items in `project-plan.md` are no longer part of the project.

## After version 1 (not started)

M8 Writing practice, M9 Communication roleplay, M10 LinkedIn academy, M11 Freelance communication, M12 Technical English, M13 Reading comprehension, M14 Progress reports, M15 Offline install. Each one is planned in detail before it starts. See `project-plan.md`.
