// Writing tasks 35-39: clarifying questions about a text you read. Only data, no logic.
// Task ids must never change after you start using the app (your drafts and history are saved by id).
// How the "checks" fields work: see js/logic/writing-check.js.

const casual = {
  label: 'Uses a professional style',
  tip: 'Use a professional style. Avoid casual words and slang.',
  words: ['hey', 'dude', 'gonna', 'wanna', 'asap', 'yo'],
};

export const readingWriteTasks = [
  {
    id: 'wr-35', module: 'writing', order: 35, level: 2,
    title: 'Ask about a job post',
    area: 'Reading',
    situation: 'You read a job post for a frontend developer. It describes the role, the salary, and how to apply. It also says: "The start date is not fixed yet." You want to apply, but you need to plan your notice period at your current job.',
    task: 'Write one short clarifying question to the company about the start date. Be polite and ask only about the information you need.',
    phrases: ['Could you tell me ...?', 'When will ... be decided?', 'I would like to plan ...', 'Thank you for your help.'],
    targetWords: { min: 8, max: 30 },
    checks: {
      required: [
        { label: 'Asks about the start date', tip: 'Use the words "start date" so the reader knows what you mean.', any: ['start date', 'start'] },
        { label: 'Asks when it will be decided', tip: 'Ask a clear when-question, for example "When will the start date be decided?"', any: ['when', 'what date', 'how soon'] },
      ],
      request: true,
      avoid: [casual],
    },
    checklist: [
      'Is it one clear question?',
      'Does it ask about the start date?',
      'Is the tone polite?',
    ],
    modelAnswers: [{
      text: 'Could you tell me when the start date will be decided?',
      why: 'One short, polite question about the only missing information. The reader can answer it directly.',
    }],
    skillTags: ['clarifying-questions', 'reading-job-posts'],
  },
  {
    id: 'wr-36', module: 'writing', order: 36, level: 2,
    title: 'Ask about a client brief',
    area: 'Reading',
    situation: 'A bakery owner sends you a brief for a new website. She wants online orders, but she writes: "I am not sure if we need an online shop or just a form." You need an answer before you can send a plan and a price.',
    task: 'Write one short clarifying question to the client about the online shop or the form. Be polite and explain why you are asking.',
    phrases: ['Could you tell me ...?', 'Do you need ... or ...?', 'This will help me ...', 'Thank you.'],
    targetWords: { min: 12, max: 40 },
    checks: {
      required: [
        { label: 'Mentions the online shop', tip: 'Use the words "online shop" so the choice is clear.', any: ['shop', 'store'] },
        { label: 'Mentions the simple form', tip: 'Use the words "order form" or "simple form".', any: ['form'] },
        { label: 'Explains why you ask', tip: 'Say that the answer helps you plan or send a price.', any: ['plan', 'price', 'quote', 'help'] },
      ],
      request: true,
      avoid: [casual],
    },
    checklist: [
      'Does it ask about the shop or the form?',
      'Does it explain why you need the answer?',
      'Is it short and polite?',
    ],
    modelAnswers: [{
      text: 'Could you tell me whether you need a full online shop or a simple order form? Your answer will help me send an accurate plan and price.',
      why: 'It repeats the two choices from the brief and explains why the answer matters. The client can reply with one word.',
    }],
    skillTags: ['clarifying-questions', 'reading-client-briefs'],
  },
  {
    id: 'wr-37', module: 'writing', order: 37, level: 3,
    title: 'Ask about an API change',
    area: 'Reading',
    situation: 'You read a notice about version 2 of a payments API. It gives the test key date and the deadline for the old endpoint. It also says: "We do not yet have a date for the production key." You need that date to plan your release.',
    task: 'Write one short clarifying question to the API team about the production key. Be direct and professional.',
    phrases: ['Could you tell me ...?', 'When will ... be available?', 'We need this date to ...', 'Thanks.'],
    targetWords: { min: 10, max: 35 },
    checks: {
      required: [
        { label: 'Mentions the production key', tip: 'Use the words "production key" so the team knows which key you mean.', any: ['production key', 'production'] },
        { label: 'Asks when it will be available', tip: 'Ask a clear when-question.', any: ['when', 'what date', 'how soon'] },
        { label: 'Says why you need it', tip: 'Say that you need the date to plan your release.', any: ['plan', 'release', 'schedule', 'need'] },
      ],
      request: true,
      avoid: [casual],
    },
    checklist: [
      'Does it name the production key?',
      'Does it ask for a date?',
      'Does it say why the date matters?',
    ],
    modelAnswers: [{
      text: 'Could you tell me when the production key will be available? We need the date to plan our release.',
      why: 'It names the missing item, asks for the date, and gives a short reason. The team can answer with a date.',
    }],
    skillTags: ['clarifying-questions', 'reading-specs'],
  },
  {
    id: 'wr-38', module: 'writing', order: 38, level: 3,
    title: 'Ask about a status report',
    area: 'Reading',
    situation: 'You read a weekly report about a bakery website. The About page is blocked because the client has not sent the text. The report says: "If the text arrives after November 20, we may miss the December 1 launch." You are the client, and you want to avoid a delay.',
    task: 'Write one short clarifying question to the project manager about the text and the November 20 date. Be polite and show that you want to help.',
    phrases: ['Could you confirm ...?', 'Do you need ... before ...?', 'I want to avoid ...', 'Please let me know.'],
    targetWords: { min: 12, max: 40 },
    checks: {
      required: [
        { label: 'Mentions the About page text', tip: 'Use the words "About page" and "text".', any: ['about page', 'text'] },
        { label: 'Mentions November 20', tip: 'Use the date "November 20" so the deadline is clear.', any: ['november 20', 'nov 20'] },
        { label: 'Asks a clear question', tip: 'Ask whether the team needs the text before that date.', any: ['need', 'before', 'confirm', 'send'] },
      ],
      request: true,
      avoid: [casual],
    },
    checklist: [
      'Does it name the About page text?',
      'Does it mention November 20?',
      'Is the tone helpful, not blaming?',
    ],
    modelAnswers: [{
      text: 'Could you confirm that you need the About page text before November 20? I want to send it in time and avoid a delay.',
      why: 'It checks the deadline, names the missing text, and shows that the client wants to help. It does not blame the team.',
    }],
    skillTags: ['clarifying-questions', 'reading-status-reports'],
  },
  {
    id: 'wr-39', module: 'writing', order: 39, level: 2,
    title: 'Ask about meeting notes',
    area: 'Reading',
    situation: 'You read the notes from a mobile app kickoff meeting. Two questions are still open: "Should users be able to cancel a booking?" and "How many classes can one person book per week?" The client, Dana, will answer by October 10.',
    task: 'Write one short clarifying question to Dana about the booking limit. Be friendly and make the question easy to answer.',
    phrases: ['Could you confirm ...?', 'How many ... can ...?', 'per week', 'Thank you.'],
    targetWords: { min: 10, max: 35 },
    checks: {
      required: [
        { label: 'Asks about the booking limit', tip: 'Use the words "how many" and "book".', any: ['how many', 'book'] },
        { label: 'Mentions the time period', tip: 'Ask about the limit per week.', any: ['week', 'per week', 'each week'] },
        { label: 'Is easy to answer', tip: 'Ask for a number, for example "one, two, or three classes".', any: ['one', 'two', 'three', 'number', 'limit'] },
      ],
      request: true,
      avoid: [casual],
    },
    checklist: [
      'Does it ask about the booking limit?',
      'Does it say "per week"?',
      'Could Dana answer it with a number?',
    ],
    modelAnswers: [{
      text: 'Could you confirm how many classes one person can book per week? A number such as two or three is enough.',
      why: 'It asks one clear question about the open item and shows the kind of answer needed. Dana can reply with a number.',
    }],
    skillTags: ['clarifying-questions', 'reading-meeting-notes'],
  },
];
