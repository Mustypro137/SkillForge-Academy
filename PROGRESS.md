# Progress

## Milestones

- [ ] M1 Foundation and app shell (code written; waiting for manual checks and your approval)
- [x] M2 Typing practice - REMOVED at owner's request (code kept in git commit 65305ca)
- [ ] M3 Storage, settings, backup (code written; waiting for manual checks and your approval)
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

## Automated tests

- Last run by Claude: 27 tests, all passed (router, storage, state). Run `npm test` yourself to check.
- A headless Edge smoke test of the Settings page ran once (theme and size saved across reload, hide coming-soon pages, export, bad and good import, reset, corrupt-data banner).

## Known bugs

- None known yet.
