// Writing tasks 14-16: freelance messages. Only data, no logic.
// (The freelance topics also use wr-03 and wr-04 from emails.js.)
// Task ids must never change after you start using the app (your drafts and history are saved by id).
// How the "checks" fields work: see js/logic/writing-check.js. The prices are made up.

const casual = {
  label: 'Uses a professional style',
  tip: 'Use a professional style. Avoid casual words.',
  words: ['hey', 'dude', 'gonna', 'wanna', 'asap'],
};

export const freelanceTasks = [
  {
    id: 'wr-14', module: 'writing', order: 14, level: 2,
    title: 'Ask a new client questions about the job',
    area: 'Freelance',
    situation: 'A new client, Mr. Adams, writes: "I need a website for my bakery. Can you do it?" The message is short. You need more information before you can give a price.',
    task: 'Reply to Mr. Adams. Say you can help, then ask four clear questions in a numbered list: the goal, the deadline, the budget, and what he already has (for example a logo, photos and text).',
    phrases: ['I would be happy to help with ...', 'I have a few questions:', 'When do you need ... ?', 'Do you already have ... ?'],
    targetWords: { min: 50, max: 110 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [
        { label: 'Uses a numbered list', tip: 'Write your questions as a numbered list: 1. ... 2. ...', any: ['1.', '1)'] },
        { label: 'Asks about the deadline', tip: 'Ask when he needs it, for example "When do you need the website?"', any: ['deadline', 'when'] },
        { label: 'Asks about the budget', tip: 'Ask about the budget.', any: ['budget'] },
        { label: 'Asks what he already has', tip: 'Ask what he already has, for example "Do you already have a logo, photos and text?"', any: ['logo', 'photos', 'text', 'already'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Are the questions in one message, in a numbered list?',
      'Is each question short and about one thing?',
      'Do you say what happens next (for example, "then I will send you a quote")?',
      'Is the tone friendly and professional?',
    ],
    modelAnswers: [{
      text: 'Hello Mr. Adams,\n\nThank you for your message. I would be happy to help with a website for your bakery. To give you a good quote, I have a few questions:\n\n1. What should the website do (for example, show products or take orders)?\n2. When do you need it?\n3. What is your budget?\n4. Do you already have a logo, photos and text?\n\nBest regards,\nSam',
      why: 'The questions are in one message, numbered and short. The client can answer each one in a few words, and you will have the facts for a quote.',
    }],
    skillTags: ['client-briefs'],
  },
  {
    id: 'wr-15', module: 'writing', order: 15, level: 2,
    title: 'Write a quote email',
    area: 'Freelance',
    situation: 'A client, Ms. Green, wants a five-page website. You need three weeks. Your price is $1,200, and it includes design, testing and two rounds of changes. Hosting is not included.',
    task: 'Write a short quote email. Give the price, say what is included and what is not included, say how long the work takes, and say how long the quote is valid.',
    phrases: ['Here is my quote for ...', 'The price is ... It includes ...', 'It does not include ...', 'This quote is valid for ... days.'],
    targetWords: { min: 50, max: 100 },
    checks: {
      greeting: true, closing: true,
      required: [
        { label: 'Gives the price', tip: 'Write the price, for example "The price is $1,200."', any: ['$1,200', '1,200'] },
        { label: 'Says what is included', tip: 'Say what is included, for example "It includes design, testing and two rounds of changes."', any: ['includes', 'included'] },
        { label: 'Says what is not included', tip: 'Say what is not included, for example "It does not include hosting."', any: ['not include', 'not included'] },
        { label: 'Says how long the work takes', tip: 'Say the time, for example "about three weeks".', any: ['weeks'] },
        { label: 'Says how long the quote is valid', tip: 'Say how long the quote is valid, for example "valid for 14 days".', any: ['valid'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Can the client find the price in five seconds?',
      'Is it clear what is included and what is not?',
      'Do you give the time and how long the quote is valid?',
      'Is the tone friendly and professional?',
    ],
    modelAnswers: [{
      text: 'Hello Ms. Green,\n\nThank you for your interest. Here is my quote for your five-page website.\n\nThe price is $1,200. It includes design, testing and two rounds of changes. It does not include hosting. I need about three weeks to finish the work.\n\nThis quote is valid for 14 days. Please tell me if you have any questions.\n\nBest regards,\nChris',
      why: 'The price, the content, the exclusion, the time and the validity are all easy to find. A client can decide without asking more questions.',
    }],
    skillTags: ['quotes'],
  },
  {
    id: 'wr-16', module: 'writing', order: 16, level: 2,
    title: 'Write a polite payment reminder',
    area: 'Freelance',
    situation: 'You sent invoice 014 for $750 to your client, Mr. Evans. The due date was 30 March. Today is 8 April, and he has not paid.',
    task: 'Write a polite payment reminder. Say the invoice number, the amount and the due date, and ask when you can expect the payment.',
    phrases: ['I hope you are well.', 'I am writing to remind you about ...', 'Could you tell me when I can expect ... ?', 'If you already paid, please ignore this message.'],
    targetWords: { min: 40, max: 90 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [
        { label: 'Names the invoice', tip: 'Write the invoice number: 014.', any: ['014'] },
        { label: 'Gives the amount', tip: 'Write the amount: $750.', any: ['$750', '750'] },
        { label: 'Gives the due date', tip: 'Say the due date, for example "which was due on 30 March".', any: ['30 march', 'due'] },
        { label: 'Asks when to expect the payment', tip: 'Ask when you can expect the payment, for example "Could you tell me when I can expect the payment?"', any: ['when'] },
      ],
      avoid: [
        { label: 'Stays polite', tip: 'Stay polite in a first reminder. Avoid angry words.', words: ['finally', 'unacceptable', 'immediately', 'again and again'] },
        casual,
      ],
    },
    checklist: [
      'Is the tone polite, like a reminder and not a threat?',
      'Does the client have all the facts (number, amount, date)?',
      'Do you ask one clear question?',
      'Do you give the client an easy way out ("if you already paid, ...")?',
    ],
    modelAnswers: [{
      text: 'Hello Mr. Evans,\n\nI hope you are well. I am writing to remind you about invoice 014 for $750, which was due on 30 March.\n\nCould you tell me when I can expect the payment? If you already paid, please ignore this message and let me know.\n\nThank you,\nChris',
      why: 'It is polite and gives all the facts. It asks one clear question and leaves an easy way out if the client already paid.',
    }],
    skillTags: ['payments'],
  },
];
