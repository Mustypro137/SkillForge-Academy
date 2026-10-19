// Writing tasks 1-4: emails to a coworker and to a client. Only data, no logic.
// Task ids must never change after you start using the app (your drafts and history are saved by id).
// How the "checks" fields work: see js/logic/writing-check.js.

const casual = {
  label: 'Uses a professional style',
  tip: 'Use a professional style. Avoid casual words.',
  words: ['hey', 'dude', 'gonna', 'wanna', 'asap'],
};
const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const emailTasks = [
  {
    id: 'wr-01', module: 'writing', order: 1, level: 2,
    title: 'Ask a coworker to review a document',
    area: 'Email to a coworker',
    situation: 'You wrote a project plan. You want your coworker Maria to read it before Friday.',
    task: 'Write a short email to Maria. Ask her to review the plan, and say when you need her answer.',
    phrases: ['Could you review ... ?', 'I would like to know if ...', 'Please tell me if you have any questions.', 'I attached the file.'],
    targetWords: { min: 35, max: 80 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [{ label: 'Says when you need the answer', tip: 'Say the day, for example "before Friday".', any: [...weekdays, 'by ', 'before', 'deadline', 'today', 'tomorrow'] }],
      avoid: [casual],
    },
    checklist: [
      'Does Maria know what you want in the first two sentences?',
      'Is the day clear?',
      'Is the tone polite (Could you ... ? Please ...)?',
      'Did you read the email once to find small mistakes?',
    ],
    modelAnswers: [{
      text: 'Hi Maria,\n\nI finished the first version of the project plan. Could you review it before Friday? I would like to know if the dates are realistic.\n\nI attached the file to this email. Please tell me if you have any questions.\n\nThanks,\nSam',
      why: 'The request is in the second sentence, the day is clear, and the tone is polite. The email is short, so Maria can answer quickly.',
    }],
    skillTags: ['polite-requests'],
  },
  {
    id: 'wr-02', module: 'writing', order: 2, level: 2,
    title: 'Make a rude message polite',
    area: 'Email to a coworker',
    situation: 'Your coworker Tom is late with a report. You wrote this message, but it sounds angry:',
    given: "Send me the report NOW. I don't have time to wait. Why is it always late??",
    task: 'Rewrite it as a polite email to Tom. Ask for the report and say when you need it. Do not blame him.',
    phrases: ['Could you send me ... ?', 'I need it by ...', 'I know you are busy.', 'Thank you for your help.'],
    targetWords: { min: 30, max: 70 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [{ label: 'Says when you need the report', tip: 'Give a time or a day, for example "by 3 p.m." or "today".', any: [...weekdays, 'by ', 'before', 'today', 'tomorrow', 'deadline'] }],
      avoid: [
        { label: 'Does not blame Tom', tip: 'Do not blame the person. Say what you need.', words: ['always', 'your fault', 'why is it', 'why are you'] },
        casual,
      ],
    },
    checklist: [
      'Is there no ALL CAPS word and no angry question?',
      'Do you say what you need and when?',
      'Do you use "Could you" or "Please"?',
      'Would you be happy to receive this email?',
    ],
    modelAnswers: [{
      text: 'Hello Tom,\n\nCould you send me the sales report today? I need it by 3 p.m. for the team meeting.\n\nI know you are busy, so please tell me if you need more time. Thank you for your help.\n\nBest regards,\nAnna',
      why: 'It asks for one clear thing and gives a reason (the team meeting). It does not blame Tom, and it offers a way to talk if there is a problem.',
    }],
    skillTags: ['polite-requests'],
  },
  {
    id: 'wr-03', module: 'writing', order: 3, level: 2,
    title: 'Tell a client the project is late',
    area: 'Reply to a client',
    situation: 'You are a freelance web developer. Your client, Mr. Lee, asks why the website is not ready. You need three more days, because the payment page had a problem.',
    task: 'Reply to Mr. Lee. Say sorry, explain the reason in one sentence, and give the new date.',
    phrases: ['I am sorry for the delay.', 'We found a problem with ...', 'I will finish the work by ...', 'Please write to me if you have questions.'],
    targetWords: { min: 45, max: 90 },
    checks: {
      greeting: true, closing: true,
      required: [
        { label: 'Says sorry', tip: 'Start with a short apology, for example "I am sorry for the delay."', any: ['sorry', 'apologize', 'apologies'] },
        { label: 'Gives the new date', tip: 'Give the new day, for example "by Thursday".', any: [...weekdays, 'by ', 'days', 'date'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Is the apology short and honest (no long excuses)?',
      'Is the reason clear in one sentence?',
      'Is the new date easy to find?',
      'Does the client know what happens next?',
    ],
    modelAnswers: [{
      text: 'Dear Mr. Lee,\n\nI am sorry for the delay with your website. We found a problem with the payment page, and fixing it carefully takes more time than I planned.\n\nI will finish the work by Thursday and send you a link to check everything. If you have any questions before then, please write to me.\n\nKind regards,\nJordan',
      why: 'The apology comes first. The reason is short and the new day is clear. The last sentence tells the client what happens next.',
    }],
    skillTags: ['client-replies'],
  },
  {
    id: 'wr-04', module: 'writing', order: 4, level: 2,
    title: 'Answer a client who wants an extra page',
    area: 'Reply to a client',
    situation: 'Your client, Ms. Park, asks you to add an "About us" page. This was not in the first agreement. It takes about two days and costs $200 extra.',
    task: 'Reply to Ms. Park. Say you can add the page, tell her the extra time and cost, and ask if she wants you to go ahead.',
    phrases: ['Yes, I can add ...', 'It takes about ...', 'The extra cost is ...', 'Would you like me to go ahead?'],
    targetWords: { min: 40, max: 90 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [
        { label: 'Mentions the extra cost', tip: 'Tell the price, for example "the extra cost is $200".', any: ['$', 'dollar', 'cost', 'price'] },
        { label: 'Mentions the extra time', tip: 'Tell how long it takes, for example "about two days".', any: ['day', 'days', 'week', 'hours'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Do you say yes or no in the first sentence?',
      'Are the time and the cost both clear?',
      'Do you end with one clear question?',
      'Is the tone friendly but professional?',
    ],
    modelAnswers: [{
      text: 'Hello Ms. Park,\n\nYes, I can add an About us page. It takes about two extra days, and the extra cost is $200.\n\nThe page was not in our first agreement, so I wanted to tell you the price before I start. Would you like me to go ahead?\n\nBest regards,\nChris',
      why: 'The answer (yes) comes first. Time and cost are easy to find, the reason for the extra cost is short, and the last question tells the client what to do next.',
    }],
    skillTags: ['client-replies'],
  },
];
