// Writing tasks 5-8: status updates and asking for help. Only data, no logic.
// Task ids must never change after you start using the app (your drafts and history are saved by id).
// How the "checks" fields work: see js/logic/writing-check.js.

const casual = {
  label: 'Uses a professional style',
  tip: 'Use a professional style. Avoid casual words.',
  words: ['hey', 'dude', 'gonna', 'wanna', 'asap'],
};
const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const updateTasks = [
  {
    id: 'wr-05', module: 'writing', order: 5, level: 2,
    title: 'Write a weekly update for your manager',
    area: 'Status update',
    situation: 'It is Friday. You write your weekly update for your manager, Dana. This week you finished the login page. You are working on the search page now. You are waiting for the design from another team.',
    task: 'Write a short update with three parts: what you finished, what you are doing now, and what you need.',
    phrases: ['I completed ...', 'I am working on ...', 'I expect to finish ... on ...', 'I am waiting for ...'],
    targetWords: { min: 40, max: 100 },
    checks: {
      greeting: true, closing: true,
      required: [
        { label: 'Says what you finished', tip: 'Say what you finished, for example "I completed the login page."', any: ['finished', 'completed', 'done'] },
        { label: 'Says what you are doing now', tip: 'Say what you are doing now, for example "I am working on ...".', any: ['working on', 'currently', 'now', 'next'] },
        { label: 'Says what you need', tip: 'Say what you need or what is blocking you, for example "I am waiting for ...".', any: ['waiting', 'need', 'blocked', 'help'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Can Dana understand the update in 30 seconds?',
      'Are the three parts easy to see?',
      'Is there a day or date for the next step?',
      'Do you say clearly what you need from Dana?',
    ],
    modelAnswers: [{
      text: 'Hi Dana,\n\nHere is my update for this week.\n\nFinished: I completed the login page, and it is ready for testing.\n\nIn progress: I am working on the search page. I expect to finish it on Wednesday.\n\nNeed: I am waiting for the new design from the design team. Can you ask them to send it on Monday?\n\nThanks,\nLee',
      why: 'Each part has its own short paragraph with a label, so the manager can find the answer fast. There is a day for the next step, and the last part asks for one clear action.',
    }],
    skillTags: ['clear-updates'],
  },
  {
    id: 'wr-06', module: 'writing', order: 6, level: 2,
    title: 'Make a vague update clear',
    area: 'Status update',
    situation: 'You are building an invoice app. The PDF export does not work in one browser. You wrote this update, but Dana cannot tell what is wrong or when it will be ready:',
    given: 'Still working on it. Had some problems. Will try to finish soon.',
    task: 'Rewrite the update for Dana. Say which part of the work, what the problem is, and when you will give her the next news.',
    phrases: ['Here is a short update on ...', 'The problem is that ...', 'I will test ... tomorrow.', 'I will send you a new update by ...'],
    targetWords: { min: 35, max: 90 },
    checks: {
      greeting: true, closing: true,
      required: [
        { label: 'Says which part of the work', tip: 'Name the work, for example "the invoice app" or "the PDF export".', any: ['invoice', 'pdf', 'export'] },
        { label: 'Names the problem', tip: 'Say what is wrong, for example "the PDF export does not work".', any: ['problem', 'issue', 'error', 'bug', 'does not work', 'not working'] },
        { label: 'Gives a day or time', tip: 'Give a day, for example "by Wednesday" or "tomorrow".', any: [...weekdays, 'today', 'tomorrow', 'by ', 'days', 'week'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Could someone who does not know the project understand it?',
      'Did you replace "some problems" with the real problem?',
      'Did you replace "soon" with a real day?',
      'Is the update still short?',
    ],
    modelAnswers: [{
      text: 'Hi Dana,\n\nHere is a short update on the invoice app. The PDF export does not work in one browser, and I am still looking for the cause.\n\nI will test two possible fixes tomorrow. I will send you a new update by Wednesday, even if the problem is not fixed yet.\n\nThanks,\nKim',
      why: 'It names the work and the problem, and it replaces "soon" with real days. Even without a solution, Dana knows what will happen next.',
    }],
    skillTags: ['clear-updates'],
  },
  {
    id: 'wr-07', module: 'writing', order: 7, level: 2,
    title: 'Ask a teammate for help with an error',
    area: 'Asking for help',
    situation: 'Your code shows the error "Cannot read property name of undefined". You tried to fix it for two hours. Your teammate Ben knows this part of the project.',
    task: 'Write a message to Ben. Say what the problem is, say what you already tried, and ask for 15 minutes of his time.',
    phrases: ['I have an error in ...', 'I have already tried ...', 'I checked ... and ...', 'Could you give me 15 minutes?'],
    targetWords: { min: 40, max: 90 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [
        { label: 'Describes the problem', tip: 'Say what is wrong, for example "I have an error in the user page".', any: ['error', 'problem', 'bug', 'issue'] },
        { label: 'Says what you already tried', tip: 'Say what you tried, for example "I checked the API response".', any: ['tried', 'checked', 'tested', 'already'] },
        { label: 'Asks for a clear amount of time', tip: 'Ask for a clear time, for example "15 minutes".', any: ['minutes', '15', 'call'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Can Ben understand the problem without opening your code first?',
      'Did you show that you already tried to solve it?',
      'Is the amount of time small and clear?',
      'Is the tone polite (Could you ... ?)?',
    ],
    modelAnswers: [{
      text: 'Hi Ben,\n\nI have an error in the user page: Cannot read property name of undefined. I have tried to fix it for two hours.\n\nI checked the API response, and the data looks correct. I also tested the page with a different user, but the error is still there.\n\nCould you give me 15 minutes today to look at it together? I can share my screen.\n\nThanks,\nAlex',
      why: 'Ben learns the problem, what you already tried, and exactly what you need. A small, clear request (15 minutes) is easy to say yes to.',
    }],
    skillTags: ['asking-for-help'],
  },
  {
    id: 'wr-08', module: 'writing', order: 8, level: 2,
    title: 'Ask your manager which task comes first',
    area: 'Asking for help',
    situation: 'Two tasks are both due on Thursday: a bug fix for a customer and the new report for the team. You cannot finish both in time.',
    task: 'Write to your manager, Dana. Explain the problem and ask which task is more important.',
    phrases: ['I have two tasks that are both due on ...', 'I cannot finish both in time.', 'Which one is more important?', 'I will start with ...'],
    targetWords: { min: 40, max: 90 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [
        { label: 'Says there are two tasks', tip: 'Say that there are two tasks, for example "I have two tasks".', any: ['both', 'two tasks', 'two '] },
        { label: 'Mentions the day', tip: 'Say the day, for example "Thursday".', any: ['thursday'] },
        { label: 'Asks which one is more important', tip: 'Ask which one is more important, for example "Which one is more important?"', any: ['which', 'priority', 'important'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Does Dana understand the problem in the first two sentences?',
      'Do you ask one clear question?',
      'Do you say what you will do after her answer?',
      'Is the tone calm and professional (no complaining)?',
    ],
    modelAnswers: [{
      text: 'Hi Dana,\n\nI have two tasks that are both due on Thursday: the bug fix for the customer and the new report for the team. I cannot finish both in time.\n\nWhich one is more important? If you tell me the priority, I will start with that task and give you a plan for the other one.\n\nThank you,\nPat',
      why: 'It states the problem without complaining and asks one clear question. It also says what you will do next, so Dana can answer with one word.',
    }],
    skillTags: ['asking-for-help'],
  },
];
