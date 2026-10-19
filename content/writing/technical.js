// Writing tasks 30-34: technical English texts. Only data, no logic.
// Task ids must never change after you start using the app (your drafts and history are saved by id).
// How the "checks" fields work: see js/logic/writing-check.js.

const casual = {
  label: 'Uses a professional style',
  tip: 'Use a professional style. Avoid casual words.',
  words: ['hey', 'dude', 'gonna', 'wanna', 'asap'],
};

export const technicalTasks = [
  {
    id: 'wr-30', module: 'writing', order: 30, level: 2,
    title: 'Write a bug report',
    area: 'Technical English',
    situation: 'You are testing a shopping app. The "Add to cart" button does nothing when you click it on an iPhone using Safari. You tried it twice, and the screen does not change. You expected the item to be added to your cart.',
    task: 'Write a bug report. Give it a clear title, list the steps to reproduce in a numbered list, say what you expected and what actually happened, and name your device and browser.',
    phrases: ['Title: ...', 'Steps to reproduce:', '1. ... 2. ... 3. ...', 'Expected:', 'Actual:', 'Device: ...'],
    targetWords: { min: 50, max: 100 },
    checks: {
      required: [
        { label: 'Has a clear title', tip: 'Name the feature and the problem, for example "Add to cart button does nothing on iOS."', any: ['button', 'does not', 'does nothing', 'broken'] },
        { label: 'Lists steps to reproduce', tip: 'Write numbered steps, for example "1. Open the app. 2. Click Add to cart."', any: ['1.', '2.', '3.'] },
        { label: 'Says what you expected', tip: 'Say what you thought would happen.', any: ['expected', 'item', 'cart', 'added'] },
        { label: 'Says what actually happened', tip: 'Say what you saw instead.', any: ['actual', 'screen', 'nothing', 'did not change'] },
        { label: 'Names device and browser', tip: 'Say which phone and browser you use.', any: ['iphone', 'safari', 'device', 'browser'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Does the title name the feature and the problem?',
      'Are the steps in a numbered list?',
      'Do you say what you expected and what happened?',
      'Do you name your device and browser?',
    ],
    modelAnswers: [{
      text: 'Title: Add to cart button does nothing on iOS Safari.\n\nSteps to reproduce:\n1. Open the shopping app on an iPhone.\n2. Tap the Add to cart button.\n3. The screen does not change; the item is not added.\n\nExpected: The item is added to the cart.\nActual: The screen stays the same; nothing is added.\n\nDevice: iPhone 12, iOS 17, Safari.',
      why: 'Clear title, numbered steps, expected vs actual, and device info. A developer can reproduce and fix this.',
    }],
    skillTags: ['bug-reports'],
  },
  {
    id: 'wr-31', module: 'writing', order: 31, level: 2,
    title: 'Write a commit message',
    area: 'Technical English',
    situation: 'You fixed a typo in the header of the company website. The word "adress" was wrong; it should be "address". You want to commit this fix.',
    task: 'Write a commit message. Use a type (fix, feat, docs, style), a short subject line under 50 characters, a blank line, and a body explaining what and why.',
    phrases: ['fix:', 'Correct typo in header.', 'Changed "adress" to "address" in the website header.', 'The header now shows the correct spelling.'],
    targetWords: { min: 30, max: 70 },
    checks: {
      required: [
        { label: 'Has a type', tip: 'Start with a type like fix, feat, docs, or style.', any: ['fix:', 'feat:', 'docs:', 'style:'] },
        { label: 'Has a short subject', tip: 'Keep the subject under 50 characters.', any: ['typo', 'header', 'address', 'fix'] },
        { label: 'Explains what and why', tip: 'Say what changed and why.', any: ['typo', 'adress', 'address', 'correct', 'spelling'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Does the subject start with a type like fix:?',
      'Is the subject under 50 characters?',
      'Is there a blank line between subject and body?',
      'Does the body say what changed and why?',
    ],
    modelAnswers: [{
      text: 'fix: Correct typo in website header\n\nChanged "adress" to "address" in the header of the company website. The header now shows the correct spelling. This fixes the display issue on the contact page.',
      why: 'Good type, short subject, blank line, and the body explains what changed and why.',
    }],
    skillTags: ['commit-messages'],
  },
  {
    id: 'wr-32', module: 'writing', order: 32, level: 2,
    title: 'Write a README section',
    area: 'Technical English',
    situation: 'You built a small weather app with JavaScript. It shows the current temperature and forecast for a city. You want to add a README so others can install and run it.',
    task: 'Write a short README. Give the project a one-sentence description, add a Setup section with install and run commands, and add a Usage section with one example.',
    phrases: ['A small weather app ...', '1. Install Node.js.', '2. Run `npm install`.', '3. Run `npm start`.', 'Open http://localhost:3000.'],
    targetWords: { min: 50, max: 100 },
    checks: {
      required: [
        { label: 'Describes the project', tip: 'Say what the project does in one sentence.', any: ['weather', 'app', 'temperature', 'forecast'] },
        { label: 'Has a Setup section', tip: 'Say what to install and how to run.', any: ['install', 'npm', 'run', 'start'] },
        { label: 'Has a Usage section', tip: 'Say how to use the project.', any: ['usage', 'open', 'browser', 'localhost'] },
        { label: 'Uses code blocks', tip: 'Put commands in backticks.', any: ['`', 'npm'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Does the first sentence say what the project does?',
      'Does the Setup section tell how to install and run?',
      'Does the Usage section show an example?',
      'Are commands in code blocks?',
    ],
    modelAnswers: [{
      text: '# Weather App\n\nA small weather app that shows the current temperature and forecast for any city. It is built with JavaScript and runs in the browser.\n\n## Setup\n\n1. Install Node.js.\n2. Run `npm install`.\n3. Run `npm start`.\n\n## Usage\n\nOpen http://localhost:3000 in your browser to see the weather forecast for your city. Enter a city name and see the current temperature.',
      why: 'One-sentence description, Setup with commands, Usage with an example, and commands in code blocks.',
    }],
    skillTags: ['readme-sections'],
  },
  {
    id: 'wr-33', module: 'writing', order: 33, level: 2,
    title: 'Explain a technical decision',
    area: 'Technical English',
    situation: 'Your team needs to choose a CSS framework for a new project. You chose Tailwind CSS. The options were Tailwind CSS, Bootstrap, and plain CSS. You chose Tailwind because the team knows it best and it has utility classes. The trade-off is a larger learning curve for new team members.',
    task: 'Write a decision note. Include the decision, the options you considered, the reason, and the trade-off.',
    phrases: ['Decision: Use Tailwind CSS.', 'Options: Tailwind CSS, Bootstrap, plain CSS.', 'Reason: ...', 'Trade-off: ...'],
    targetWords: { min: 50, max: 90 },
    checks: {
      required: [
        { label: 'States the decision', tip: 'Say what you decided, for example "Use Tailwind CSS".', any: ['tailwind', 'decision', 'use'] },
        { label: 'Lists options', tip: 'Name the options you considered.', any: ['bootstrap', 'plain css', 'options'] },
        { label: 'Gives a reason', tip: 'Say why you chose it.', any: ['team knows', 'utility', 'classes', 'reason'] },
        { label: 'Mentions a trade-off', tip: 'Say what you give up.', any: ['trade-off', 'learning curve', 'larger'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Does it state the decision clearly?',
      'Are the options named?',
      'Is there a reason for the choice?',
      'Is there a trade-off mentioned?',
    ],
    modelAnswers: [{
      text: 'Decision: Use Tailwind CSS.\nOptions: Tailwind CSS, Bootstrap, plain CSS.\nReason: The team knows Tailwind best, and it has utility classes for fast styling. The team has already used Tailwind on previous projects.\nTrade-off: Larger learning curve for new team members who do not know Tailwind CSS. They will need time to learn the utility classes before they can work efficiently.',
      why: 'Decision, options, reason, and trade-off are all present and short enough to read in one minute.',
    }],
    skillTags: ['technical-decisions'],
  },
  {
    id: 'wr-34', module: 'writing', order: 34, level: 2,
    title: 'Write a technical status update',
    area: 'Technical English',
    situation: 'You are working on a mobile app. You finished fixing the crash on Android. You are working on the dark mode toggle. You are blocked: waiting for the design files from the designer. Next week you will finish the toggle.',
    task: 'Write a status update with four parts: what you finished, what you are working on, what is blocking you, and what happens next with a date.',
    phrases: ['Done: ...', 'In progress: ...', 'Blocked: ...', 'Next: ...'],
    targetWords: { min: 50, max: 90 },
    checks: {
      required: [
        { label: 'Says what is done', tip: 'Say what you finished.', any: ['done', 'fixed', 'crash', 'android'] },
        { label: 'Says what is in progress', tip: 'Say what you are working on now.', any: ['in progress', 'toggle', 'dark mode'] },
        { label: 'Mentions the blocker', tip: 'Say what is blocking you.', any: ['blocked', 'waiting', 'design files'] },
        { label: 'Says what happens next', tip: 'Say what you will do and when.', any: ['next', 'week', 'finish', 'toggle'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Does it say what is finished?',
      'Does it say what is in progress?',
      'Does it say what is blocked and why?',
      'Does it say what happens next and when?',
    ],
    modelAnswers: [{
      text: 'Done: Fixed the crash on Android.\nIn progress: Adding the dark mode toggle.\nBlocked: Waiting for the design files from the designer.\nNext: Finish the toggle by next week.\n\nI will send you the full update by end of day tomorrow. Please let me know if you have any questions.',
      why: 'Four clear parts with a date for the next step. The team can scan it quickly.',
    }],
    skillTags: ['technical-updates'],
  },
];
