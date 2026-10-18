# Progress

## Milestones

- [ ] M1 Foundation and app shell (code written; waiting for manual checks and your approval)
- [x] M2 Typing practice - REMOVED at owner's request (code kept in git commit 65305ca)
- [ ] M3 Storage, settings, backup (code written; waiting for manual checks and your approval)
- [ ] M4 Question engine and grammar (code written; waiting for manual checks and your approval)
- [ ] M5 Mistake notebook
- [ ] M6 Dashboard
- [ ] M7 MVP polish and full check

## M1 manual checklist (you do these)

Run `python -m http.server 8000` and open http://localhost:8000.

- [ ] Every menu link opens a page; the current link is highlighted
- [ ] Browser Back and Forward buttons work
- [ ] Refreshing the page keeps you on the same page
- [ ] `#/something-wrong` shows "Page not found"
- [ ] Tab key: focus ring is always visible; the "Skip to main content" link appears first
- [ ] Narrow the window to about 360px: no sideways scrolling, Menu button opens and closes the menu (also with Escape)
- [ ] Dark mode looks fine (change your system theme)
- [ ] No red errors in the browser console (F12)
- [ ] Works in Chrome, Edge and Firefox

## M3 manual checklist (you do these)

- [ ] Settings: change theme to Dark, text size to 22 px; refresh the page; the settings are still there
- [ ] Turn off "Show pages that are coming soon"; the menu shows only 4 pages; turn it on again
- [ ] Export backup: a file `skillforge-backup-YYYY-MM-DD.json` downloads; "Last backup" shows today
- [ ] Reset (type RESET): settings go back to default and a backup downloads first
- [ ] Import the backup you exported: the preview shows counts, then your settings come back
- [ ] Import a wrong file (for example a photo or a .txt file): you get a clear error and nothing changes
- [ ] In DevTools (F12) > Application > Local Storage, change `skillforge-data` to `{abc`, refresh: a red warning appears and the app still works
- [ ] Works on phone: the Settings page is readable and the file chooser opens
- [ ] No console errors

## M4 manual checklist (you do these)

- [ ] Grammar page shows 3 lessons; open one and read the explanation (is the English clear and correct?)
- [ ] Do a whole lesson. Try a wrong answer first on purpose: you see feedback, can use a hint, and after 2 wrong tries you see the solution and a "Why" explanation
- [ ] A small typo in a one-word answer (for example `wantss`) says "Almost! Check your spelling." and does not use a try
- [ ] Capital letters and the final full stop do not matter in normal exercises (`he does not like long emails` is accepted, with a tip)
- [ ] `don't` and `do not` are both accepted
- [ ] In the capital-letters lesson, `i work with a client in london.` is NOT accepted (capitals matter there)
- [ ] Word-order exercise: tap words, Undo and Clear work, Tab and Enter work without a mouse
- [ ] Multiple choice: keys 1 to 4 choose an option; Enter checks
- [ ] Lesson results: score, list of questions to review, "Practice the ones I missed"
- [ ] Refresh the page in the middle of a lesson: "Continue" starts at the next unanswered question
- [ ] 80% or more first-try correct = "Mastered"
- [ ] On your phone: buttons are easy to tap and the keyboard does not hide the answer box
- [ ] Please tell me any exercise where a correct answer was rejected, or the English sounds wrong

## Automated tests

- Last run by Claude: 81 tests, all passed (router, storage, state, answer checking, progress, lesson content). Run `npm test` yourself to check.
- A headless Edge smoke test played through a whole grammar lesson once (wrong answers, hints, solutions, all 4 types, results, saving, reload, extra practice).
- A headless Edge smoke test of the Settings page ran once (theme and size saved across reload, hide coming-soon pages, export, bad and good import, reset, corrupt-data banner).

## Known bugs

- Mistakes are not saved to the Mistake notebook yet. Wrong answers are recorded in the attempt history, and Milestone 5 will use it.
- Free-form answers: only listed wording is accepted. If a correct answer is rejected, tell Claude and the exercise will get a new accepted answer.
