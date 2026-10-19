// Writing tasks 17-22: freelance messages for getting clients and starting a job (batch 2). Only data, no logic.
// Task ids must never change after you start using the app (your drafts and history are saved by id).
// How the "checks" fields work: see js/logic/writing-check.js. The prices are made up.

const casual = {
  label: 'Uses a professional style',
  tip: 'Use a professional style. Avoid casual words.',
  words: ['hey', 'dude', 'gonna', 'wanna', 'asap'],
};
const emptyWords = {
  label: 'Avoids empty words',
  tip: 'Show with facts instead of empty words like expert or hard-working.',
  words: ['expert', 'passionate', 'hard-working', 'hardworking', 'guru', 'ninja', 'rockstar'],
};
const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const freelanceStartTasks = [
  {
    id: 'wr-17', module: 'writing', order: 17, level: 2,
    title: 'Write a first message to a possible client',
    area: 'Freelance',
    situation: 'You are a web developer. You found the website of Anna Lopez, who owns a bakery. It has no online shop. You want to offer your help.',
    task: 'Write a short first message. Use her name, say what you noticed, say what you can do for her, and ask one easy question.',
    phrases: ['I saw that ...', 'I build ... for small businesses.', 'Would you like me to send ... ?', 'Thank you for your time.'],
    targetWords: { min: 40, max: 80 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [
        { label: 'Says what you noticed', tip: 'Say what you noticed about her business, for example "I saw that your bakery has no online shop."', any: ['saw', 'noticed', 'found', 'read'] },
        { label: 'Says what you can do', tip: 'Say what you can do in one sentence, for example "I build simple online shops".', any: ['i build', 'i help', 'i make', 'i create'] },
      ],
      avoid: [
        { label: 'Does not sound like spam', tip: 'Do not sound like spam. Avoid "Dear Sir or Madam" and long lists of skills.', words: ['dear sir', 'sir or madam', 'many skills', 'cheap', 'hire me'] },
        emptyWords, casual,
      ],
    },
    checklist: [
      'Does the message show that you looked at her business?',
      'Is it short enough to read in 20 seconds?',
      'Is there only one question, and is it easy to answer?',
      'Could this message be sent to anyone? (It should not.)',
    ],
    modelAnswers: [{
      text: 'Hi Anna,\n\nI saw that your bakery has no online shop. I build simple online shops for small businesses, and customers can order from their phones.\n\nWould you like me to send two ideas for your shop? You can say no, and I will not write again.\n\nBest regards,\nSam',
      why: 'It is personal, short and specific. It offers one thing, asks one easy question, and gives the reader a polite way to say no.',
    }],
    skillTags: ['finding-clients'],
  },
  {
    id: 'wr-18', module: 'writing', order: 18, level: 2,
    title: 'Write a short proposal email',
    area: 'Freelance',
    situation: 'Ms. Green owns a bakery and needs a website that sells cakes online. You can build it in four weeks for $1,500.',
    task: 'Write a short proposal email with four parts: her problem, your plan, the price and the time, and a next step with a day.',
    phrases: ['You need ...', 'Here is my plan:', 'The work takes ... and costs ...', 'If you agree, I can start on ...'],
    targetWords: { min: 50, max: 110 },
    checks: {
      greeting: true, closing: true,
      required: [
        { label: 'Starts with her problem', tip: 'Start with her problem, for example "You need a website that sells your cakes online."', any: ['you need', 'problem'] },
        { label: 'Gives a plan', tip: 'Give your plan, for example "Here is my plan: I will build ...".', any: ['plan', 'i will build'] },
        { label: 'Gives the price', tip: 'Give the price: $1,500.', any: ['$1,500', '1,500'] },
        { label: 'Gives the time', tip: 'Give the time, for example "four weeks".', any: ['weeks'] },
        { label: 'Gives a next step with a day', tip: 'Give a next step with a day, for example "If you agree, I can start on Monday."', any: [...weekdays, 'by '] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Does the proposal start with her problem, not with you?',
      'Are the price and the time easy to find?',
      'Is the next step clear, with a day?',
      'Do you use "you" more than "I"?',
    ],
    modelAnswers: [{
      text: 'Hello Ms. Green,\n\nThank you for talking with me. You need a website that sells your cakes online, so customers can order without calling.\n\nHere is my plan: I will build a simple shop with photos, a cart and online payment. The work takes four weeks and costs $1,500.\n\nIf you agree, I can start on Monday. Please reply by Friday.\n\nBest regards,\nChris',
      why: 'It starts with her problem, gives a short plan, the price and the time, and ends with a clear next step and days.',
    }],
    skillTags: ['proposals'],
  },
  {
    id: 'wr-19', module: 'writing', order: 19, level: 2,
    title: 'Write a portfolio project description',
    area: 'Freelance',
    situation: 'A small shop needed online orders. You built an online shop with React. In two months, orders increased by 30 percent.',
    task: 'Write a short project description for your portfolio: the problem, what you did, and the result with a number.',
    phrases: ['A ... needed ...', 'I built ...', 'In two months, ... increased by ...', 'Customers now ...'],
    targetWords: { min: 30, max: 70 },
    checks: {
      required: [
        { label: 'Names the problem', tip: 'Start with the problem, for example "A small shop needed online orders."', any: ['needed', 'problem'] },
        { label: 'Says what you did', tip: 'Say what you did, for example "I built a simple online shop".', any: ['built', 'made', 'created'] },
        { label: 'Gives the result with a number', tip: 'Give the result with a number, for example "orders increased by 30 percent".', any: ['percent', '%'] },
      ],
      avoid: [emptyWords, casual],
    },
    checklist: [
      'Are the three parts (problem, action, result) easy to see?',
      'Is the result a real number?',
      'Are the sentences short?',
      'Is there no empty word (expert, passionate)?',
    ],
    modelAnswers: [{
      text: 'A small shop needed online orders. I built a simple online shop with React, with clear product pages and an easy checkout.\n\nIn two months, orders increased by 30 percent, and customers now order from their phones.',
      why: 'It follows the pattern problem, action, result, with a number. The sentences are short.',
    }],
    skillTags: ['portfolio'],
  },
  {
    id: 'wr-20', module: 'writing', order: 20, level: 2,
    title: 'Write a follow-up email after the first call',
    area: 'Freelance',
    situation: 'You had a first call with Mr. Lee. He needs a five-page website, ready by June, with a budget of about $1,500. He has a logo but no text yet.',
    task: 'Write a follow-up email: thank him, repeat the main facts, and say when you will send the quote.',
    phrases: ['Thank you for the call today.', 'To check that I understood: ...', 'I will send you a quote by ...', 'Please tell me if anything is wrong.'],
    targetWords: { min: 45, max: 90 },
    checks: {
      greeting: true, closing: true,
      required: [
        { label: 'Says thank you', tip: 'Thank him for the call.', any: ['thank'] },
        { label: 'Repeats the main facts', tip: 'Repeat the main facts: the five-page website, June, and the budget.', any: ['five-page', 'five pages', 'website'] },
        { label: 'Mentions the deadline', tip: 'Mention the deadline: June.', any: ['june'] },
        { label: 'Mentions the budget', tip: 'Mention the budget.', any: ['budget', '$1,500', '1,500'] },
        { label: 'Says when you will send the quote', tip: 'Say when you will send the quote, for example "by Friday".', any: [...weekdays, 'by '] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Can Mr. Lee check the facts quickly?',
      'Do you say what is not ready yet (the text)?',
      'Is the day for the quote clear?',
      'Do you invite him to correct you?',
    ],
    modelAnswers: [{
      text: 'Hello Mr. Lee,\n\nThank you for the call today. To check that I understood: you need a five-page website, ready by June, with a budget of about $1,500. You have a logo, but you do not have the text yet.\n\nI will send you a quote by Friday. Please tell me if anything is wrong.\n\nBest regards,\nSam',
      why: 'It repeats the facts so that mistakes show early, it says what is missing, and it gives a day for the next step.',
    }],
    skillTags: ['first-call'],
  },
  {
    id: 'wr-21', module: 'writing', order: 21, level: 2,
    title: 'Summarize the terms in an email',
    area: 'Freelance',
    situation: 'Mr. Adams accepted your quote. The scope is a five-page website. The fee is $1,200. He pays 50 percent before you start and 50 percent when you deliver. The deadline is 15 March.',
    task: 'Write a short email that summarizes these terms and asks him to confirm that they are correct. (This is not legal advice.)',
    phrases: ['Here is a short summary of what we agreed:', 'The scope is ...', 'You pay a deposit of ... before I start.', 'Please confirm that this is correct.'],
    targetWords: { min: 50, max: 100 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [
        { label: 'Names the scope', tip: 'Name the scope: a five-page website.', any: ['five-page', 'five pages'] },
        { label: 'Gives the fee', tip: 'Give the fee: $1,200.', any: ['$1,200', '1,200'] },
        { label: 'Explains the deposit and the payment', tip: 'Explain the payment: 50 percent before you start, 50 percent at delivery.', any: ['deposit', '50 percent', '50%'] },
        { label: 'Gives the deadline', tip: 'Give the deadline: 15 March.', any: ['15 march'] },
        { label: 'Asks him to confirm', tip: 'Ask him to confirm, for example "Please confirm that this is correct."', any: ['confirm'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Are the scope, fee, payment terms and deadline all in the email?',
      'Are the sentences short and clear?',
      'Is the request to confirm easy to find?',
      'Is the tone friendly?',
    ],
    modelAnswers: [{
      text: 'Hello Mr. Adams,\n\nThank you for accepting my quote. Here is a short summary of what we agreed:\n\nThe work is a five-page website for your bakery. The fee is $1,200. You pay a deposit of 50 percent before I start and 50 percent when I deliver the work. The deadline is 15 March.\n\nPlease confirm that this is correct, and I will start.\n\nBest regards,\nSam',
      why: 'All the important terms are in plain words, and the last sentence asks for a written confirmation.',
    }],
    skillTags: ['contracts'],
  },
  {
    id: 'wr-22', module: 'writing', order: 22, level: 2,
    title: 'Write a polite no to a project',
    area: 'Freelance',
    situation: 'A client, Mr. Kim, asks you to build a big app in two weeks for $300. You cannot do it. You are free in May.',
    task: 'Write a polite no. Thank him, say no clearly, give a short reason, and give an option.',
    phrases: ['Thank you for thinking of me.', 'I am sorry, but I cannot ...', 'The app needs more ...', 'I can recommend another freelancer.'],
    targetWords: { min: 40, max: 90 },
    checks: {
      greeting: true, closing: true,
      required: [
        { label: 'Says thank you', tip: 'Thank him for thinking of you.', any: ['thank'] },
        { label: 'Says no clearly', tip: 'Say no clearly, for example "I cannot take this project."', any: ['cannot', 'can not', 'unable', 'not able'] },
        { label: 'Gives a short reason', tip: 'Give a short reason, for example "because the app needs more time".', any: ['because', 'schedule', 'budget', 'needs more'] },
        { label: 'Gives an option', tip: 'Give an option, for example "I am free in May" or "I can recommend another freelancer".', any: ['may', 'recommend', 'smaller', 'instead'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Is the no clear (not "maybe")?',
      'Is the reason short and neutral, with no blame?',
      'Is there a useful option?',
      'Would you be happy to receive this message?',
    ],
    modelAnswers: [{
      text: 'Hello Mr. Kim,\n\nThank you for thinking of me for your app. I am sorry, but I cannot take this project, because the app needs more than two weeks and a larger budget.\n\nI am free in May, and I can build a smaller first version for $300. I can also recommend another freelancer if you prefer.\n\nBest regards,\nChris',
      why: 'It thanks him, says no clearly, gives a neutral reason, and offers two options. He can decide what to do next.',
    }],
    skillTags: ['saying-no'],
  },
];
