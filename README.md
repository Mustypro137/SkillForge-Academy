# SkillForge Academy

A private website to practise English and professional communication.
All data stays in your browser. No account, no server, no cost.

Status: typing practice was removed (not needed). Milestone 6 (dashboard) is built. See `project-plan.md` for the full plan and `PROGRESS.md` for progress.

## Run the website

Browsers do not allow ES modules from a double-clicked file, so use a small local server:

```
python -m http.server 8000
```

Then open <http://localhost:8000>. Stop the server with `Ctrl+C`.

## Run the tests

```
npm test
```

No `npm install` is needed. There are no dependencies.

## Folders

- `index.html` - the one page of the app
- `css/` - styles (colors, layout, components)
- `js/` - code: `main.js` starts the app, `router.js` picks the page, `routes.js` lists the pages, `storage.js` saves and loads your data, `state.js` keeps it in memory
- `js/logic/` - rules without screens: `answer-check.js` (checks answers), `progress.js` (scores and lesson status), `review-schedule.js` (when to review mistakes), `dashboard.js` (dashboard numbers and next step)
- `content/grammar/` - the grammar lessons (data only). Add a lesson by adding a file and listing it in `index.js`
- `js/pages/` - one file per page
- `tests/` - automated tests
