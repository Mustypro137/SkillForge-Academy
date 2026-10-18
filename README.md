# SkillForge Academy

A private website to practise English, typing and professional communication.
All data stays in your browser. No account, no server, no cost.

Status: Milestone 2 (typing practice). See `project-plan.md` for the full plan and `PROGRESS.md` for progress.

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
- `js/` - code: `main.js` starts the app, `router.js` picks the page, `routes.js` lists the pages
- `js/pages/` - one file per page
- `tests/` - automated tests
