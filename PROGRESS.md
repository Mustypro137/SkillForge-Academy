# Progress

## Milestones

- [ ] M1 Foundation and app shell (code written; waiting for manual checks and your approval)
- [ ] M2 Typing practice (code written; waiting for manual checks and your approval)
- [ ] M3 Storage, settings, backup
- [ ] M4 Question engine and grammar
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

## M2 manual checklist (you do these)

- [ ] Typing page: choose Timed 30 seconds + Sentences, press Start, the timer starts only after your first key
- [ ] Correct letters turn green, wrong letters are red with a wavy underline, the current letter is highlighted
- [ ] Backspace fixes a mistake; the WPM and accuracy numbers change as you type
- [ ] Time runs out: the result screen appears (heading says your WPM and accuracy)
- [ ] Untimed mode: finishing the text shows results
- [ ] Paste (Ctrl+V) does nothing in the typing box; Enter does nothing
- [ ] Compare with a stopwatch: type a known text slowly and check the WPM is about right
- [ ] Try again keeps the same text; New text gives a different one; Cancel returns to setup
- [ ] Keyboard only: Tab to every control, Enter on Start, finish a test, use the result buttons
- [ ] 360px width and dark mode look fine; no console errors

## Automated tests

- Last run by Claude: 27 tests, all passed (router, typing stats, text builder, typing content). Run `npm test` yourself to check.
- A headless Edge smoke test of the typing page also ran once (setup, paste blocked, results, Try again).

## Known bugs

- None known yet.
