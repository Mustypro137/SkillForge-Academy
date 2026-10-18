# SkillForge Academy — Project Plan

**Private English, Typing & Professional Communication Academy**

- Status: PLANNING ONLY. No application code has been written yet.
- Plan date: 2026-10-19
- Owner: you (single private user)

This document is written in simple English. Words in `code style` are file names, function names, or commands.

> **Change (after Milestone 2):** The typing module was removed at the owner's request (a typing project already exists elsewhere). Typing practice, WPM/accuracy (section 6.5) and typing results are no longer part of the plan. The roadmap continues with Milestone 3 (storage, settings, backup) without typing data. The removed code is in git commit `65305ca`.

---

## 1. Project Audit

### 1.1 What I inspected

| Item | Finding |
|---|---|
| Project folder `SkillForge-Academy/` | **Empty.** No files, no hidden files. |
| Git repository | **None.** The folder is not a git repository yet. |
| Package configuration (`package.json`) | None. |
| Framework / dependencies | None installed. |
| Documentation | None. |
| Environment files / secrets | None found. Nothing to protect. |
| Tools installed on your computer | Node.js v22.17.1, npm 11.6.1, Git 2.56, Python 3.12.10 |

### 1.2 Conclusions

- We start from zero. There is no old code to keep, fix, or delete.
- There are no technical problems, no extra complexity, and no secrets.
- **Node.js 22** has a built-in test runner (`node --test`). We can write automated tests **without installing any package**.
- **Python 3.12** has a built-in web server (`python -m http.server`). We can run the website locally **without installing any package**.
- Result: the whole MVP can be built with **zero dependencies and zero cost**.

---

## 2. Product Requirements

### 2.1 Who the user is

- One person (you), learning privately.
- An English learner who wants simple, clear explanations.
- Prefers reading and writing. No voice, no video, no teachers, no public profile.
- A self-taught programmer who wants to learn by building this project.
- Goal: write professionally to LinkedIn connections, employers, and freelance clients.

### 2.2 User needs

1. Practise typing every day and see real improvement (speed and accuracy).
2. Learn grammar in small steps, with instant and kind feedback.
3. Always try first, then get a hint, then see the solution and explanation.
4. Have correct answers accepted even when worded differently.
5. Remember mistakes and practise them again later.
6. See progress, weak areas, and a clear "what to do next".
7. Keep all data private, on your own computer, with a way to back it up.
8. Later: practise real professional messages (LinkedIn, freelance, technical).

### 2.3 Features (all 10 modules, full vision)

1. Typing practice
2. English grammar
3. Writing practice
4. Communication roleplay
5. LinkedIn academy
6. Freelance communication
7. Technical English
8. Reading comprehension
9. Mistake notebook
10. Progress dashboard

### 2.4 Non-goals (things we will NOT build)

- No user accounts, login, or passwords.
- No server, no database server, no cloud sync.
- No paid APIs and no AI service inside the app.
- No social features: no leaderboards, sharing, comments, or public profiles.
- No voice or speech exercises.
- No analytics, tracking, ads, or external fonts/CDNs.
- No mobile app store app (the website works on mobile browsers).
- No "streak pressure" or punishment for missed days.

### 2.5 A very important honest limit

Without an AI service, the app **cannot truly understand free writing** (for example, a full LinkedIn message you write yourself). For those exercises the plan uses:

- automatic checks that a computer *can* do reliably (length, greeting present, a question is asked, no ALL CAPS, very long sentences),
- a **self-review checklist** you tick,
- one or more **model answers** to compare with,
- optionally, you can copy your text into Claude yourself outside the app for detailed feedback.

Short-answer exercises (grammar, sentence correction) **can** be checked automatically and fairly. See Section 7.

---

## 3. MVP Scope

### 3.1 Key insight: "engines" and "content"

Most modules are the same few exercise types with different content:

| Engine (code) | Used by modules |
|---|---|
| **Typing engine** | Typing, spelling and punctuation drills, typing professional phrases |
| **Question engine** (multiple choice, fill-in, correct-the-sentence, reorder words) | Grammar, Reading comprehension, LinkedIn/Freelance/Technical quizzes |
| **Writing engine** (free text + automatic checks + checklist + model answer) | Writing, LinkedIn messages, freelance messages, bug reports, commit messages |
| **Roleplay engine** (scripted conversation with choices and replies) | Communication roleplay, client and employer conversations |

So we build **engines once** and then add modules mostly as **content files**. This is how future modules come without a rewrite.

### 3.2 Version 1 (MVP): what is included

| Feature | Why it is essential |
|---|---|
| App shell + navigation | Everything else lives inside it. |
| Typing practice (timed + untimed, WPM, accuracy) | Useful from day one; daily habit. |
| Grammar practice (question engine + 3 starter lessons) | Core English learning; proves the content system. |
| Beginner sentence exercises (correct-the-sentence, reorder words) | Part of the question engine; builds writing basics. |
| Mistake notebook with scheduled retries | Turns mistakes into learning; needs the question engine. |
| Simple dashboard (progress + "next step") | Gives direction every day. |
| Settings + data export/import (backup) | Local data can be lost; backup is required for safety. |
| Local data saving (localStorage) | Progress must survive a page refresh. |

Starter grammar lessons (suggested, for professional writing):
1. Capital letters and end punctuation
2. Present simple (I work / she works)
3. Articles (a / an / the)

### 3.3 Postponed (and why)

| Feature | Wait until | Reason |
|---|---|---|
| Writing practice | After MVP (Milestone 8) | Needs the writing engine; harder to evaluate. |
| Communication roleplay | Milestone 9 | Needs a new engine (branching conversations). |
| LinkedIn academy | Milestone 10 | Mostly content; needs writing + roleplay engines first. |
| Freelance academy | Milestone 11 | Same as above. |
| Technical English | Milestone 12 | Same as above. |
| Reading comprehension | Milestone 13 | Uses question engine + longer texts; content-heavy. |
| Progress reports with charts | Milestone 14 | Needs weeks of real data to be useful. |
| Offline install (PWA) | Milestone 15 | Nice to have; adds caching complexity. |
| IndexedDB | Only if needed | localStorage is enough for MVP data size. |

### 3.4 Feature dependencies

```
App shell & router
   ├── Storage (save/load/export/import)
   │      ├── Settings page
   │      ├── Typing practice ──────────────┐
   │      ├── Question engine → Grammar ────┤
   │      │        └── Mistake notebook ────┤
   │      └────────────────────────────────→ Dashboard (reads everything)
   └── Later: Writing engine → Roleplay engine → LinkedIn / Freelance / Technical
                Question engine → Reading comprehension
```

- The **dashboard is built last** in the MVP because it only *reads* data the other features create.
- The **mistake notebook** depends on the question engine (it re-uses the same exercises).

---

## 4. Architecture Plan

### 4.1 Recommended stack

| Choice | Recommendation |
|---|---|
| Language | Plain **HTML, CSS, JavaScript** |
| Modules | Native **ES modules** (`import` / `export`), no build step |
| Framework | **None** |
| Routing | **Hash routing** (`#/typing`, `#/grammar`) |
| Storage | **localStorage** through one `storage.js` module |
| Backup | **JSON file export/import** |
| Tests | **Node built-in test runner** (`node --test`) |
| Local server | `python -m http.server` (or VS Code "Live Server" extension) |
| Version control | Git (local), optional **private** GitHub repo |

### 4.2 Decision details

**Plain JavaScript instead of React/Vue**
- Benefits: nothing to install, no build tool, you already know the basics, you learn how the browser really works, easy to debug.
- Disadvantages: more manual DOM updates; a large app can become messy without discipline.
- Why: the app has ~12 pages and simple state. A framework would add more to learn than it saves. We reduce the mess with a clear folder structure (logic separate from pages). If the app grows a lot, React can be added later because logic and content are already separate.

**ES modules, no bundler (no Vite/Webpack)**
- Benefits: zero setup; each file is small and has one job.
- Disadvantages: modules do **not** work when you double-click `index.html` (`file://`). You must use a small local server.
- Why: one command (`python -m http.server 8000`) solves it and costs nothing.

**Hash routing**
- Benefits: works on any static server; Back/Forward buttons work; very simple (~30 lines).
- Disadvantages: URLs contain `#`. Not important for a private app.

**localStorage vs IndexedDB**
- localStorage benefits: very simple (`getItem`/`setItem`), synchronous, easy to understand.
- localStorage disadvantages: ~5 MB limit, strings only, browser can clear it.
- IndexedDB benefits: much larger storage, better for big data.
- IndexedDB disadvantages: complex asynchronous API, harder for beginners.
- Why localStorage: estimated data use after one year is well under 1 MB (an attempt record is ~150 bytes). All storage code lives in **one file**, so switching to IndexedDB later only changes that file.

**Content as JavaScript data files**
- Benefits: content is separate from logic; files can be imported in the browser **and** in Node tests; comments allowed.
- Disadvantages: a syntax mistake (missing comma) breaks loading. A content-validation test catches this.
- Why not JSON: importing JSON in browsers needs newer features or `fetch`, and is harder to test. JS data files are simpler here.

**Node built-in test runner**
- Benefits: no install; standard; fast.
- Disadvantages: tests logic only, not the visual page. UI is checked manually with a checklist.
- Why: the most important correctness rules (WPM, answer checking, retry scheduling, saving) are pure functions, so they are easy to test.

### 4.3 Application design (layers)

```
content/   →  data only (lessons, exercises, typing texts)
js/logic/  →  pure functions: calculations and rules, NO DOM, NO storage  (fully tested)
js/storage.js → the only file that touches localStorage                   (tested with a fake)
js/pages/  →  build the screen, handle clicks/keys, call logic + storage   (manual tests)
js/router.js → chooses which page to show from the URL hash
```

Rule: **pages may call logic and storage; logic never calls pages or storage.** This keeps logic testable.

### 4.4 Privacy and security

- All data stays in your browser. No network requests at all (no CDN, no Google Fonts, no analytics).
- Use system fonts (privacy + works offline).
- Show user-entered text and imported data with `textContent`, **never `innerHTML`**. This prevents code injection from a bad import file.
- Validate every import file before saving it; show a preview ("This backup has 120 attempts, 15 mistakes. Replace current data?").
- Before import replaces data, automatically download a backup of the current data.
- Warn in Settings: "Clearing browser data deletes your progress. Export a backup regularly." Show the last backup date on the dashboard.
- The git repository contains only code and content, never your personal progress data.

### 4.5 Responsive, accessible, offline

- Responsive: one column on phones, sidebar navigation on desktop (breakpoint ~768px).
- Accessibility: keyboard-only use, visible focus, labels on all inputs, feedback announced to screen readers (`aria-live`), never colour-only feedback.
- Offline: after first load from the local server it already works without internet. A full offline "install" (PWA) is postponed.

---

## 5. UX/UI Plan

### 5.1 Navigation (information architecture)

```
SkillForge Academy
├── Dashboard            (home)
├── Practice
│   ├── Typing
│   ├── Grammar
│   ├── Writing          (later)
│   └── Reading          (later)
├── Professional
│   ├── Roleplay         (later)
│   ├── LinkedIn         (later)
│   ├── Freelance        (later)
│   └── Technical English (later)
├── Mistake notebook
├── Progress reports     (later; MVP shows progress on dashboard)
└── Settings & backup
```

- Desktop: left sidebar. Mobile: top bar with a "Menu" button that opens the list.
- "Later" pages appear in the menu with a "Coming soon" label (or are hidden — your choice in Settings).
- The current page is highlighted (`aria-current="page"`).

### 5.2 Visual style

- Clean, calm, lots of white space. Light and dark theme (follows your system by default).
- Body text 18px by default, adjustable (16–22px). Line length max ~70 characters.
- One accent colour. Green/red feedback always includes an icon and a word ("Correct", "Not quite").
- Respects "reduce motion" system setting.

### 5.3 Pages and user journeys

**Dashboard (MVP)**
- Top: greeting + "Next step" card (one big button). Rules:
  1. If mistakes are due for review → "Review 4 mistakes".
  2. Else if no typing today → "Do a 1-minute typing test".
  3. Else → "Continue: Present simple, exercise 6".
- Cards: Typing (last WPM, best WPM, 7-day average accuracy), Lessons (completed / total), Mistakes (due today / total), Weak areas (top 3 skill tags), Last backup date.
- Journey: open app → click Next step → practise → return to dashboard.

**Typing practice (MVP)**
- Choose mode: Timed (30s / 60s / 2min) or Untimed (finish a text). Choose text type: Common words, Sentences, Punctuation, Professional phrases.
- Screen: target text shown large in a monospace font; correct characters turn green-ish, wrong ones are underlined red; the current letter is marked.
- Live: timer (can be hidden in Settings), WPM, accuracy.
- Timer starts on your **first key press**, not when the page opens.
- End screen: WPM, net WPM, accuracy, errors, "keys you missed most", comparison with your average. Buttons: "Try again" (same text), "New text".
- Paste is blocked. Spell-check, autocorrect, and auto-capitalize are turned off in the typing box.
- Mobile: works, but results are tagged "mobile" and kept separate, because on-screen keyboards are slower.

**Grammar practice (MVP)**
- Lesson list: title, level, status (Not started / In progress / Completed / Mastered), score.
- Lesson page: short explanation (3–6 sentences) + examples → "Start exercises".
- Exercise flow (same for every exercise):
  1. Read question → type or choose an answer → press **Enter** or "Check".
  2. Correct → green message + short explanation → **Enter** for next.
  3. Close (small typo) → "Almost! Check your spelling." → try again.
  4. Wrong → targeted feedback if known ("With *she*, add -s: *works*") → "Show hint" / "Try again".
  5. After 2 wrong tries → "Show solution" with explanation → saved to the Mistake notebook automatically.
- Empty answers are not accepted ("Please type an answer first.") and are not counted.
- End of lesson: score, list of mistakes, "Retry wrong answers", "Next lesson".

**Mistake notebook (MVP)**
- Tabs: "Due today" / "All mistakes" / "Mastered".
- Each item: the question, your wrong answer, the correct answer, explanation, times wrong, next review date.
- "Start review" runs due items through the normal exercise flow.
- You can add a personal note to a mistake, or delete it.

**Settings & backup (MVP)**
- Theme, font size, show/hide live timer, default typing duration, show/hide "coming soon" pages.
- Export backup (downloads `skillforge-backup-2026-10-19.json`).
- Import backup (validate → preview → confirm).
- Reset all data (needs typing "RESET" to confirm; offers a backup first).
- Storage usage shown ("Using 42 KB").

**Writing practice (later)**
- Task card (e.g. "Rewrite this message to be polite and clear") → text box with live word count → "Check" runs automatic checks → self-review checklist → compare with model answer(s) → rate yourself (Needs work / Good / Great) → save to history.

**Communication roleplay (later)**
- Chat-style screen. The "other person" (client, employer, recruiter) sends a message. You pick a reply from options or write your own.
- Each choice gets feedback (best / acceptable / weak, and why). The conversation branches.
- Ends with a summary: tone, clarity, what to improve.

**LinkedIn / Freelance / Technical English (later)**
- Each academy = topic list → mini-lesson → question exercises → writing tasks → roleplay scenarios.
- LinkedIn: profile headline/about, connection requests, DMs, posts, follow-ups.
- Freelance: briefs, requirements, pricing, deadlines, revisions, payment, delivery.
- Technical: bug reports, README sections, commit messages, project explanations, status updates.

**Reading comprehension (later)**
- A client request or job post → questions: "What are the requirements?", "What is unclear?", "Write one clarifying question".

**Progress reports (later)**
- WPM and accuracy over time (simple chart), accuracy by skill tag, practice calendar, mistakes fixed per week.

### 5.4 Keyboard and mobile behaviour

- **Tab / Shift+Tab** moves through everything; focus is always visible.
- **Enter**: check answer; Enter again: next question.
- Multiple choice: arrow keys inside the option group (standard radio buttons), or keys **1–4** when focus is not in a text box.
- **Alt+H** (or a button): show hint.
- "Skip to main content" link at the top.
- After moving to a new question, focus goes to the answer box automatically.
- Mobile: large buttons (min 44px), answer box never hidden by the on-screen keyboard, no hover-only features.
- Timed challenges are **optional** everywhere; untimed is the default for grammar.

---

## 6. Data Model

### 6.1 Content (stored in files, read-only)

**Lesson**
```js
{
  id: "grammar-present-simple",          // unique, never changes
  module: "grammar",                      // grammar | typing | writing | linkedin | ...
  title: "Present simple: I work, she works",
  level: 1,                               // 1 = beginner ... 5 = advanced
  order: 2,                               // position in the list
  explanation: ["Use the present simple for habits and facts.", "..."],
  examples: [{ text: "She works from home.", note: "she → works (+s)" }],
  exercises: [ /* Exercise objects */ ]
}
```

**Exercise**
```js
{
  id: "ps-03",                            // unique inside the lesson
  type: "fill-blank",                     // multiple-choice | fill-blank | correct-sentence | reorder
  prompt: "My client ___ (want) the files by Friday.",
  choices: null,                          // array only for multiple-choice
  acceptedAnswers: ["wants"],             // all correct forms
  commonMistakes: [
    { answer: "want", feedback: "With 'my client' (he/she), add -s: wants." }
  ],
  hints: ["Is 'my client' one person or many?"],
  explanation: "'My client' = he/she, so the verb takes -s.",
  skillTags: ["third-person-s", "present-simple"],
  options: { caseSensitive: false, punctuationMatters: false }   // optional
}
```

**TypingText**
```js
{ id: "tt-prof-07", category: "professional", level: 2,
  text: "Thank you for your message. I will send the update by Friday." }
```

### 6.2 User data (stored in localStorage, under one key)

```js
{
  schemaVersion: 1,
  createdAt: "2026-10-19T09:00:00.000Z",
  lastBackupAt: null,
  settings: { theme: "system", fontSize: 18, showLiveTimer: true,
              typingDefaultSeconds: 60, showComingSoon: true },
  progress: {                     // key = lessonId
    "grammar-present-simple": { status: "in-progress", bestScore: 0.8,
      lastExerciseId: "ps-06", completedAt: null }
  },
  attempts: [                     // newest last; capped at 3000 items
    { id: "a_...", lessonId, exerciseId, answer: "want", result: "incorrect",
      firstTry: true, hintsUsed: 0, at: "2026-10-19T09:12:00.000Z" }
  ],
  mistakes: {                     // key = "lessonId/exerciseId"
    "grammar-present-simple/ps-03": { lessonId, exerciseId,
      lastWrongAnswer: "want", timesWrong: 2, box: 1,
      dueDate: "2026-10-20", status: "active", note: "" }
  },
  typingResults: [
    { id: "t_...", textId, mode: "timed", durationSeconds: 60,
      grossWpm: 38, netWpm: 35, accuracy: 94.2, uncorrectedErrors: 3,
      missedKeys: { "e": 2, ",": 3 }, device: "desktop",
      at: "2026-10-19T09:00:00.000Z" }
  ]
}
```

### 6.3 Relationships

- A **Lesson** has many **Exercises**.
- An **Attempt** points to one Exercise (`lessonId` + `exerciseId`).
- A **Mistake** points to one Exercise; there is at most one Mistake per Exercise.
- **Progress** has one entry per Lesson.
- **TypingResult** points to one TypingText.
- IDs in content must **never change** once used, or saved progress loses its link. (A test checks IDs are unique.)

### 6.4 Scoring

- **Exercise result**: `correct`, `correct-with-help` (after hint or retry), `incorrect` (solution shown).
- **Lesson score** = first-try correct answers ÷ total exercises.
- **Lesson status**: `not-started` → `in-progress` → `completed` (all exercises answered) → `mastered` (score ≥ 80%).
- **Skill accuracy** (weak areas) = first-try correct ÷ attempts per skill tag, shown only with at least 5 attempts.
- Simple, clear English is never penalised: capitalisation and final punctuation do not count unless the exercise is *about* them.

### 6.5 WPM and accuracy (exact definitions)

Terms:
- `target` = the text you must type. `typed` = what is in the box at the end.
- A **keystroke** = one character added (Backspace is not a keystroke).
- An **error keystroke** = a character added that does not match the target at that position *at that moment* (it still counts even if you fix it later).
- **Start time** = your first keystroke. **End time** = when `typed` reaches the length of `target` (untimed), or when the time limit ends (timed).
- `minutes` = (end − start) in milliseconds ÷ 60000.

Formulas:
```
grossWPM          = (typed.length / 5) / minutes
uncorrectedErrors = number of positions i where typed[i] !== target[i]
netWPM            = max(0, grossWPM − uncorrectedErrors / minutes)
accuracy (%)      = (keystrokes − errorKeystrokes) / keystrokes × 100
```
- One "word" = 5 characters, including spaces and punctuation (international standard).
- Round WPM to whole numbers, accuracy to 1 decimal.
- If `keystrokes = 0` → accuracy 0, WPM 0 (no division by zero).
- Results under 5 seconds or under 10 characters are shown but **not saved** (too short to be meaningful).

Worked example: 1 minute, typed 250 characters, 5 positions wrong at the end, 260 keystrokes with 13 error keystrokes:
- grossWPM = (250 / 5) / 1 = 50
- netWPM = 50 − 5 / 1 = 45
- accuracy = (260 − 13) / 260 × 100 = 95.0%

### 6.6 Answer checking (accepting valid alternatives)

Steps for text answers:
1. **Empty check**: if the trimmed answer is empty → ask to type something; not counted.
2. **Normalise** both your answer and every accepted answer:
   - trim spaces at start/end, turn many spaces into one;
   - curly quotes/apostrophes (’ “ ”) → straight (' ");
   - lowercase (unless `caseSensitive`);
   - remove the final `.`, `!` or `?` (unless `punctuationMatters`);
   - expand contractions (`don't` → `do not`, `I'm` → `I am`, `can't` → `cannot`), so both forms are accepted.
3. **Exact match** with any accepted answer → `correct`. If only capitals/punctuation differ, add a friendly tip but still mark correct.
4. **Common mistake match** → show its specific feedback; `incorrect` for this try.
5. **Close match**: edit distance (Levenshtein) ≤ 1 for short answers, ≤ 2 for answers over 10 characters → "Almost! Check your spelling." Retry allowed.
6. Otherwise → `incorrect` with hint and retry.

Content authors can write alternatives compactly:
`"I {have sent|sent} the file {yesterday|}"` expands to all combinations. A content test checks that every expanded answer is a real sentence.

For **correct-the-sentence** exercises, the checker also accepts any answer in the accepted list, so "Could you send it?" and "Can you send it?" can both be correct if the content lists both.

### 6.7 Mistake review scheduling (Leitner boxes)

A simple, proven system with 5 boxes:

| Box | Review again after |
|---|---|
| 1 | 1 day |
| 2 | 2 days |
| 3 | 4 days |
| 4 | 8 days |
| 5 | 16 days |

- Wrong answer (in a lesson or review) → the mistake goes to **Box 1**, due tomorrow.
- Correct in a review → move up one box.
- Correct in Box 5 → status `mastered` (it leaves the "due" list).
- Wrong again in a review → back to Box 1.
- "Due today" = mistakes with `dueDate` ≤ today (local date).

---

## 7. File and Folder Structure (MVP)

```
SkillForge-Academy/
├── index.html               The single page: header, nav, <main> where pages appear
├── package.json             Only test scripts. No dependencies.
├── README.md                What the app is, how to run it, how to test it
├── PROGRESS.md              Completed work, remaining tasks, known bugs
├── project-plan.md          This plan
├── .gitignore
│
├── css/
│   ├── base.css             Colours, fonts, themes, basic element styles
│   ├── layout.css           Sidebar, header, mobile menu, page width
│   └── components.css       Buttons, cards, inputs, feedback messages
│
├── js/
│   ├── main.js              Starts the app: loads saved data, starts router
│   ├── router.js            Reads #/page from the URL and shows that page
│   ├── storage.js           The ONLY code that uses localStorage; load, save,
│   │                         validate, migrate, export, import
│   ├── state.js             Holds the loaded user data in memory; small
│   │                         functions like recordAttempt(), saveTypingResult()
│   ├── logic/               Pure functions. No DOM. Fully tested.
│   │   ├── typing-stats.js  WPM, accuracy, missed keys
│   │   ├── answer-check.js  normalise, contractions, alternatives, edit distance
│   │   ├── review-schedule.js  Leitner boxes, due dates
│   │   └── progress.js      lesson status, skill accuracy, "next step"
│   ├── ui/
│   │   └── dom.js           Tiny helpers to create elements safely
│   └── pages/               One file per page
│       ├── dashboard.js
│       ├── typing.js
│       ├── grammar.js       Lesson list + lesson + exercise flow
│       ├── exercise-view.js Shared exercise screen (used by grammar AND mistakes)
│       ├── mistakes.js
│       ├── settings.js
│       └── coming-soon.js
│
├── content/
│   ├── typing-texts.js
│   └── grammar/
│       ├── index.js         List of all grammar lessons
│       ├── capitals-punctuation.js
│       ├── present-simple.js
│       └── articles.js
│
└── tests/
    ├── typing-stats.test.js
    ├── answer-check.test.js
    ├── review-schedule.test.js
    ├── progress.test.js
    ├── storage.test.js      Uses a fake localStorage
    └── content.test.js      Checks every lesson/exercise is valid
```

Rules to keep it beginner-friendly:
- One file = one job. Aim for under ~250 lines per file.
- No classes unless clearly helpful; plain functions and objects.
- No design patterns "just in case".

How you will run it:
```
python -m http.server 8000      → open http://localhost:8000
npm test                        → runs node --test (no install needed)
```

---

## 8. Testing Plan

### 8.1 Automated tests (`npm test`)

**Typing stats**
- 250 chars / 60s / 5 uncorrected / 260 keystrokes / 13 errors → gross 50, net 45, accuracy 95.0.
- Perfect typing → accuracy 100, net = gross.
- Zero keystrokes → WPM 0, accuracy 0, no crash.
- Zero or negative time → WPM 0, no `Infinity` or `NaN`.
- Many errors → net WPM never below 0.
- Corrected errors lower accuracy but not net WPM.
- Typed text longer than target → extra characters count as errors.
- Missed keys counted per target character.

**Answer checking**
- Empty / spaces-only answer → `empty`, not counted.
- Exact correct → `correct`.
- Different capitals / missing final full stop → `correct` with tip.
- Curly apostrophe `don’t` = `don't`.
- `do not` accepted when answer is `don't` (and the reverse).
- Extra spaces inside → still correct.
- `{a|b}` alternatives expand correctly, including empty option.
- Second accepted answer works.
- Common mistake → its specific feedback.
- One-letter typo (`recieve`) → `close`.
- Wrong word (`go` vs `goes`) → NOT `close` when it is a listed common mistake.
- Completely wrong → `incorrect`.
- `caseSensitive: true` exercise rejects lowercase start.
- `punctuationMatters: true` exercise rejects missing `?`.
- Multiple choice: right index correct, wrong index incorrect, no selection → `empty`.
- Reorder: correct order correct; wrong order incorrect.

**Review schedule**
- New mistake → box 1, due tomorrow.
- Correct review → box +1 and due date by the table.
- Correct in box 5 → mastered.
- Wrong in box 4 → box 1.
- Due list includes today and overdue, excludes future and mastered.
- Date handling uses local date (no timezone off-by-one).

**Progress**
- Lesson status transitions (not-started → in-progress → completed → mastered at 80%).
- Score uses first-try results only.
- Weak areas hidden under 5 attempts; sorted lowest accuracy first.
- "Next step" rules: due mistakes first, then typing, then next lesson.

**Storage**
- Save then load returns the same data (simulates refresh).
- No saved data → default data created.
- Corrupted JSON (`"{abc"`) → app starts with defaults, raw text kept under a backup key, warning flag set.
- Wrong shape (e.g. `attempts` is a string) → repaired or rejected safely.
- Older `schemaVersion` → migrated.
- Export produces valid JSON with `schemaVersion` and `app: "skillforge"`.
- Import of valid file works; import of invalid JSON, wrong app, newer schema, or missing fields is rejected with a clear message and **does not change** current data.
- Attempts list is capped at 3000 (oldest removed).
- Storage full (`QuotaExceededError`) → error is caught and reported, no crash.

**Content**
- Every lesson and exercise has an `id`; all IDs are unique.
- Every exercise has a prompt, at least one accepted answer, and an explanation.
- Multiple-choice answers point to an existing choice.
- No accepted answer also appears in `commonMistakes`.

### 8.2 Manual tests (you do these, with a checklist in `PROGRESS.md`)

- Progress still there after refresh and after closing the browser.
- Export → reset → import → everything is back.
- Mistake appears in the notebook after 2 wrong tries; disappears from "Due today" after a correct review.
- Keyboard only: complete one typing test, one grammar lesson, one review, and an export without a mouse.
- Focus is always visible; screen reader (Windows Narrator) announces feedback.
- Responsive: 360px phone, 768px tablet, 1366px laptop; no horizontal scroll; mobile menu works.
- Browsers: Chrome, Edge, Firefox (latest). Optional: Safari on iPhone if available.
- Dark mode and font-size setting look correct.
- Paste is blocked in the typing box.
- Corrupt data on purpose (DevTools → edit localStorage) → app shows a warning and still works.

### 8.3 Acceptance criteria (definition of "finished" per MVP feature)

| Feature | Finished when |
|---|---|
| App shell | All menu links work; Back/Forward work; unknown hash shows "Page not found"; works at 360px and keyboard-only. |
| Typing | Timed and untimed modes work; timer starts on first key; results match formula tests; results saved and visible after refresh; paste blocked. |
| Grammar | 3 lessons, ≥ 10 exercises each; all 4 exercise types work; hint → retry → solution flow works; alternatives and contractions accepted; score and status saved. |
| Mistake notebook | Wrong answers are added automatically; due list correct; review moves boxes; mastered items leave due list; notes and delete work. |
| Dashboard | Shows real numbers from saved data; "Next step" follows the rules; empty state is friendly for a new user. |
| Settings & backup | All settings saved; export/import/reset work with confirmation; invalid import never damages data. |
| Overall MVP | `npm test` passes (actually run); manual checklist completed; no console errors; README explains how to run. |

---

## 9. Implementation Roadmap

Each milestone is built, tested, and approved before the next one starts.

### Milestone 1 — Foundation and app shell
1. **Goal:** a running website with navigation and empty pages.
2. **Features:** folder structure, `index.html`, CSS themes, sidebar/mobile menu, hash router, placeholder pages, git repository, `npm test` working with one sample test, `README.md`, `PROGRESS.md`.
3. **Files:** `index.html`, `css/*.css`, `js/main.js`, `js/router.js`, `js/ui/dom.js`, `js/pages/*.js` (placeholders), `package.json`, `.gitignore`, `README.md`, `PROGRESS.md`, `tests/router.test.js`.
4. **Dependencies:** none.
5. **Testing:** `npm test` passes; manual check of links, Back button, mobile menu, keyboard Tab order, dark mode.
6. **Done when:** all pages reachable by mouse and keyboard at 360px and desktop; first git commit made.
7. **You learn:** HTML structure, CSS variables and media queries, ES modules, URL hash and events, running a local server, git init/commit, writing a first test.
8. **Risks:** opening `index.html` by double-click (modules fail) → always use the server; forgetting `type="module"`; wrong relative paths in imports.

### Milestone 2 — Typing practice (logic + screen, no saving yet)
1. **Goal:** a usable typing test.
2. **Features:** `typing-stats.js` with full tests; typing texts; timed and untimed modes; live highlighting; results screen.
3. **Files:** `js/logic/typing-stats.js`, `content/typing-texts.js`, `js/pages/typing.js`, `css/components.css`, `tests/typing-stats.test.js`.
4. **Dependencies:** M1.
5. **Testing:** all typing-stats tests; manual test with known text and stopwatch.
6. **Done when:** formulas match Section 6.5; no NaN/Infinity; paste blocked; works with keyboard only.
7. **You learn:** keyboard/input events, timers (`setInterval`, `performance.now()`), pure functions, test-first thinking.
8. **Risks:** counting Backspace as a keystroke; timer drift; mobile autocorrect changing text; IME/accent input.

### Milestone 3 — Storage, settings, and backup
1. **Goal:** data survives refresh and can be backed up.
2. **Features:** `storage.js` (load/save/validate/migrate/export/import), `state.js`, settings page, saving typing results, corrupted-data recovery.
3. **Files:** `js/storage.js`, `js/state.js`, `js/pages/settings.js`, `js/pages/typing.js` (save results), `tests/storage.test.js`.
4. **Dependencies:** M1, M2.
5. **Testing:** all storage tests; manual export → reset → import.
6. **Done when:** acceptance criteria for Settings & backup pass.
7. **You learn:** JSON, `localStorage`, `try/catch`, data validation, file download (Blob) and file upload (FileReader).
8. **Risks:** saving partial data; import overwriting without backup; trusting imported data.

### Milestone 4 — Question engine and grammar
1. **Goal:** grammar lessons with fair feedback.
2. **Features:** `answer-check.js` with full tests; 4 exercise types; hint/retry/solution flow; 3 lessons; lesson progress saved.
3. **Files:** `js/logic/answer-check.js`, `js/logic/progress.js`, `js/pages/exercise-view.js`, `js/pages/grammar.js`, `content/grammar/*.js`, `tests/answer-check.test.js`, `tests/progress.test.js`, `tests/content.test.js`.
4. **Dependencies:** M3.
5. **Testing:** answer-check and content tests; manually answer every exercise right and wrong once.
6. **Done when:** Grammar acceptance criteria pass.
7. **You learn:** string methods, regular expressions (small), arrays/objects, separating data from code.
8. **Risks:** too strict matching rejects good English; content mistakes (wrong accepted answers); oversized page file.

### Milestone 5 — Mistake notebook
1. **Goal:** mistakes come back for review at the right time.
2. **Features:** auto-save mistakes, Leitner scheduling, due list, review session using `exercise-view.js`, notes, delete.
3. **Files:** `js/logic/review-schedule.js`, `js/pages/mistakes.js`, `js/state.js`, `tests/review-schedule.test.js`.
4. **Dependencies:** M4.
5. **Testing:** schedule tests; manual: make mistakes, change dates in DevTools, review.
6. **Done when:** Mistake notebook acceptance criteria pass.
7. **You learn:** dates in JavaScript, reusing a component, simple algorithms.
8. **Risks:** timezone bugs ("due today" wrong near midnight); duplicate mistakes for the same exercise.

### Milestone 6 — Dashboard
1. **Goal:** one home screen that tells you what to do.
2. **Features:** stats cards, weak areas, next-step card, last backup reminder, friendly empty state.
3. **Files:** `js/pages/dashboard.js`, `js/logic/progress.js`, `tests/progress.test.js`.
4. **Dependencies:** M2–M5.
5. **Testing:** next-step tests; manual with empty data and with real data.
6. **Done when:** Dashboard acceptance criteria pass.
7. **You learn:** calculating summaries from arrays (`filter`, `map`, `reduce`).
8. **Risks:** dashboard doing calculations itself instead of using `progress.js`.

### Milestone 7 — MVP polish and full check
1. **Goal:** a stable version 1 you use daily.
2. **Features:** accessibility fixes, responsive fixes, full manual checklist, README update, known bugs list.
3. **Files:** small changes across CSS/pages; `README.md`, `PROGRESS.md`.
4. **Dependencies:** M1–M6.
5. **Testing:** full Section 8 automated + manual checklist.
6. **Done when:** "Overall MVP" acceptance criteria pass. Tag `v1.0` in git.
7. **You learn:** accessibility testing, debugging with DevTools, releasing a version.
8. **Risks:** adding new features during polish (scope creep).

### After MVP (each one planned in detail before starting)
- **M8 Writing engine + Writing practice** (automatic checks, checklist, model answers, self-rating).
- **M9 Roleplay engine** (branching conversations: choices with feedback + free replies).
- **M10 LinkedIn academy** (content using M4, M8, M9 engines).
- **M11 Freelance academy** (content).
- **M12 Technical English** (content; includes commit-message and bug-report checks).
- **M13 Reading comprehension** (long texts + question engine + clarifying-question tasks).
- **M14 Progress reports** (simple SVG charts, practice calendar).
- **M15 Offline install (PWA)** (service worker + manifest).
- **Optional:** typing drills built from your mistakes; IndexedDB if storage grows.

---

## 10. Risk Register

| # | Risk | Type | Likelihood | Impact | How we reduce it |
|---|---|---|---|---|---|
| 1 | Browser clears localStorage → progress lost | Privacy/data | Medium | High | Export backup; "last backup" reminder on dashboard; auto-backup before import/reset. |
| 2 | Answer checker rejects correct English | Learning quality | High | High | Multiple accepted answers, contractions, normalisation, "close" detection, many tests; a "Report: my answer should be correct" button that saves the case for later review. |
| 3 | Content has English errors (generated by AI) | Content | Medium | High | Content tests for structure; you and Claude review each lesson; mark questionable items. |
| 4 | Free writing cannot be graded well without AI | Scope | Certain | Medium | Be honest in UI; checklist + model answers + self-rating; optional manual Claude review outside app. |
| 5 | Scope creep (building all modules at once) | Scope | High | High | Milestones in order; approval needed for scope changes. |
| 6 | Files become too large and confusing | Maintenance | Medium | Medium | One job per file; ~250-line guideline; refactor at milestone end. |
| 7 | Code injection through import file | Security | Low | Medium | `textContent` only; strict import validation. |
| 8 | Changing content IDs breaks saved progress | Maintenance | Medium | Medium | IDs never change; content test for unique IDs; document the rule. |
| 9 | Timezone/date bugs in review scheduling | Technical | Medium | Low | Use local date strings (YYYY-MM-DD); tests around midnight. |
| 10 | Typing results wrong on mobile (autocorrect) | Technical | Medium | Low | Disable autocorrect/autocapitalize; tag mobile results separately. |
| 11 | Data structure change breaks old saved data | Maintenance | Medium | Medium | `schemaVersion` + migration functions + tests. |
| 12 | Losing motivation from too much building, too little practising | Personal | Medium | High | Usable typing test at Milestone 2; small milestones. |
| 13 | Opening file directly (`file://`) breaks the app | Technical | High (at first) | Low | README explains the server command; friendly error message. |

---

## 11. First Milestone Specification

**Milestone 1 — Foundation and app shell**

### Scope (exactly)
- Create the folder structure for the MVP (only the files listed below).
- A single `index.html` with: skip link, header, navigation, `<main>` area.
- Navigation to all 12 pages. MVP pages show a short placeholder ("Typing practice — coming in Milestone 2"); later pages show "Coming soon".
- Hash router: `#/` → dashboard, `#/typing`, `#/grammar`, `#/mistakes`, `#/settings`, etc.; unknown → "Page not found".
- Light/dark theme following the system setting (manual toggle comes in M3 with Settings).
- Responsive layout: sidebar ≥ 768px; menu button below 768px.
- Accessibility: visible focus, `aria-current` on active link, focus moves to the page heading after navigation.
- `package.json` with `"type": "module"` and `"test": "node --test tests/"`. **No dependencies.**
- One automated test for the router's "find page from hash" function.
- `git init`, `.gitignore`, first commit.
- `README.md` (how to run and test) and `PROGRESS.md` (milestone checklist, known bugs).

### Out of scope for M1
- Any real feature (typing, grammar, saving data, settings controls).

### Tasks (in order)
1. `git init`; create `.gitignore`.
2. Create `package.json` (no install).
3. Write `index.html` with semantic structure.
4. Write `css/base.css` (colour tokens, light/dark, typography) and `css/layout.css` (sidebar, mobile menu).
5. Write `js/ui/dom.js` (small safe element helper).
6. Write `js/router.js` with a pure `findRoute(hash)` function + `startRouter()`.
7. Write `tests/router.test.js`; run `npm test`.
8. Write placeholder page files in `js/pages/`.
9. Write `js/main.js` to start everything.
10. Write `README.md` and `PROGRESS.md`.
11. Manual checks (below); first commit.

### Files to create
```
index.html, package.json, .gitignore, README.md, PROGRESS.md,
css/base.css, css/layout.css, css/components.css,
js/main.js, js/router.js, js/ui/dom.js,
js/pages/dashboard.js, typing.js, grammar.js, mistakes.js, settings.js, coming-soon.js,
tests/router.test.js
```

### Tests
- Automated (`tests/router.test.js`): `""` and `"#/"` → dashboard; `"#/typing"` → typing; `"#/TYPING"` → typing; `"#/unknown"` → not-found; `"#/typing/"` (trailing slash) → typing.
- Manual: every nav link works; Back/Forward work; refresh keeps the page; Tab order logical with visible focus; skip link works; 360px width has no horizontal scroll and menu opens/closes with keyboard; dark mode correct; no console errors in Chrome, Edge, Firefox.

### Definition of done
All tests above actually run and pass, `PROGRESS.md` updated, first git commit created, and you approve before Milestone 2.

### Small exercises for you after M1
1. Add a new placeholder page `#/about` yourself (router + nav + page file).
2. Change the accent colour in one CSS variable and see it update everywhere.
3. Add one more router test case and make it pass.

---

## 12. Approval Checklist

Please confirm (or change) each decision before coding starts:

- [ ] Plain HTML/CSS/JavaScript, no framework, no build tool.
- [ ] Zero npm dependencies; tests with Node's built-in runner.
- [ ] Run locally with `python -m http.server` (or VS Code Live Server).
- [ ] localStorage for data, with JSON export/import backup.
- [ ] No backend, no login, no AI API, no analytics, no external fonts/CDNs.
- [ ] MVP = shell, typing, grammar (3 lessons), mistake notebook, dashboard, settings/backup.
- [ ] Writing, roleplay, LinkedIn, freelance, technical, reading, reports, PWA come after MVP.
- [ ] Free writing is evaluated with automatic checks + checklist + model answers (not true grading).
- [ ] WPM/accuracy formulas in Section 6.5.
- [ ] Answer-checking rules in Section 6.6 (capitals/final punctuation ignored unless the exercise is about them; contractions accepted).
- [ ] Leitner 5-box review schedule (1, 2, 4, 8, 16 days).
- [ ] Starter grammar lessons: capitals & punctuation, present simple, articles.
- [ ] Use git locally; GitHub repo (if any) is **private**.
- [ ] Claude Code writes lesson content; you review it.
- [ ] Milestone order 1 → 7; start with Milestone 1.

### Open questions (they change content or setup)
1. **British or American spelling?** (colour/color, organise/organize). Default if no answer: American spelling, but accept both in answers.
2. **Your current English level?** (e.g. beginner, lower-intermediate, intermediate). This sets the difficulty of the first lessons. Default: lower-intermediate (B1).
3. **GitHub:** keep the project only on your computer, or also in a private GitHub repository? Default: local git only.
