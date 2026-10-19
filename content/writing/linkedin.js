// Writing tasks 9-13: LinkedIn texts. Only data, no logic.
// Task ids must never change after you start using the app (your drafts and history are saved by id).
// How the "checks" fields work: see js/logic/writing-check.js.

const casual = {
  label: 'Uses a professional style',
  tip: 'Use a professional style. Avoid casual words.',
  words: ['hey', 'dude', 'gonna', 'wanna', 'asap'],
};
const emptyWords = {
  label: 'Avoids empty words',
  tip: 'Show with facts instead of empty words like passionate or hard-working.',
  words: ['passionate', 'hard-working', 'hardworking', 'guru', 'ninja', 'rockstar'],
};
const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const linkedinTasks = [
  {
    id: 'wr-09', module: 'writing', order: 9, level: 2,
    title: 'Write your LinkedIn About text',
    area: 'LinkedIn',
    situation: 'You are a web developer with three years of experience. You use React and Node.js. You built five online shops for small businesses. You want clients and employers to contact you.',
    task: 'Write your About text in the first person. Say what you do, give two facts, and say how people can contact you.',
    phrases: ['I help ... to ...', 'I have ... years of experience with ...', 'I built ...', 'Message me to talk about ...'],
    targetWords: { min: 40, max: 90 },
    checks: {
      required: [
        { label: 'Says what you do', tip: 'Say what you do, for example "I am a web developer" or "I help small businesses".', any: ['developer', 'i build', 'i help', 'i work'] },
        { label: 'Gives facts', tip: 'Give a fact, for example years of experience or something you built.', any: ['years', 'built', 'experience'] },
        { label: 'Says how to contact you', tip: 'End with a next step, for example "Message me to talk about your project."', any: ['message me', 'contact me', 'connect', 'reach out', 'email me'] },
      ],
      avoid: [emptyWords, casual],
    },
    checklist: [
      'Do the first two lines say the most important thing?',
      'Are there real facts (numbers, tools, results) and not only empty words?',
      'Is it written in the first person (I)?',
      'Does the last sentence tell the reader what to do next?',
    ],
    modelAnswers: [{
      text: 'I am a web developer. I help small businesses sell online. I have three years of experience with React and Node.js, and I built five online shops that are still running today.\n\nI like clear code and simple designs that customers can use without help. Message me if you want to talk about your project.',
      why: 'It starts with what you do, gives facts (years, tools, five shops), shows how you work, and ends with a clear next step. It has no empty words.',
    }],
    skillTags: ['about-section'],
  },
  {
    id: 'wr-10', module: 'writing', order: 10, level: 2,
    title: 'Write a connection note (200 characters)',
    area: 'LinkedIn',
    situation: 'You read a post by Maria Lopez, a recruiter, about hiring junior developers. You are a junior web developer. You want to connect with her.',
    task: 'Write a connection note of 200 characters or fewer. Greet her, give a specific reason, and end politely with your name.',
    phrases: ['I read your post about ...', 'I would like to follow your work.', 'I am a junior ...', 'Thanks,'],
    targetWords: { min: 15, max: 40 },
    checks: {
      greeting: true, closing: true, maxChars: 200,
      required: [{ label: 'Gives a specific reason', tip: 'Name something real, for example "I read your post about hiring junior developers".', any: ['post', 'article', 'read', 'talk'] }],
      avoid: [casual],
    },
    checklist: [
      'Is the note short enough to fit the limit?',
      'Is the reason specific (not "I want to grow my network")?',
      'Do you avoid asking for a job?',
      'Is the tone polite and friendly?',
    ],
    modelAnswers: [{
      text: 'Hi Maria,\nI read your post about hiring junior developers. I am a junior web developer, and I would like to follow your work.\nThanks,\nSam',
      why: 'It is short, it names a real post, it says who you are in a few words, and it asks for nothing big.',
    }],
    skillTags: ['connection-note'],
  },
  {
    id: 'wr-11', module: 'writing', order: 11, level: 2,
    title: 'Reply to a recruiter',
    area: 'LinkedIn',
    situation: 'A recruiter, Tom Weber, writes: "Hi, we have a Junior Frontend Developer role at a fintech company. Are you open to a quick call?" You are interested. You want to know the salary range and if the job is remote.',
    task: 'Reply to Tom. Thank him, say you are interested, ask two questions, and suggest a time for a call.',
    phrases: ['Thank you for your message.', 'I am interested in ...', 'Could you tell me ... ?', 'I am free on ...'],
    targetWords: { min: 40, max: 90 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [
        { label: 'Says thank you', tip: 'Start by thanking him, for example "Thank you for your message."', any: ['thank'] },
        { label: 'Says you are interested', tip: 'Say clearly that you are interested.', any: ['interested'] },
        { label: 'Asks about the salary', tip: 'Ask about the salary range.', any: ['salary'] },
        { label: 'Asks if the job is remote', tip: 'Ask if the job is remote.', any: ['remote'] },
        { label: 'Suggests a time', tip: 'Suggest a day or time for the call, for example "on Tuesday afternoon".', any: [...weekdays, 'morning', 'afternoon', 'this week', 'next week'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Do you thank him in the first sentence?',
      'Is your answer (yes, interested) easy to find?',
      'Are your two questions clear and polite?',
      'Is the time for the call specific?',
    ],
    modelAnswers: [{
      text: 'Hi Tom,\n\nThank you for your message. I am interested in the Junior Frontend Developer role.\n\nBefore we talk, could you tell me the salary range and if the job is remote? I am free on Tuesday or Wednesday afternoon for a short call.\n\nBest regards,\nSam',
      why: 'Thanks first, a clear yes, two polite questions, and a specific time. The recruiter can answer in one message.',
    }],
    skillTags: ['recruiter-replies'],
  },
  {
    id: 'wr-12', module: 'writing', order: 12, level: 2,
    title: 'Ask a senior engineer for advice',
    area: 'LinkedIn',
    situation: 'You watched a talk by Alex Kim, a senior engineer. You are a junior developer and you want advice about preparing for interviews. You have never spoken to Alex.',
    task: 'Write a short message to Alex. Say how you know his work, ask one small thing (for example one question), and make it easy to say no.',
    phrases: ['I watched your talk about ...', 'Could I ask you one question about ... ?', 'If you are busy, no problem.', 'Thank you for your time.'],
    targetWords: { min: 45, max: 90 },
    checks: {
      greeting: true, closing: true, request: true,
      required: [
        { label: 'Says how you know his work', tip: 'Say how you know his work, for example "I watched your talk".', any: ['talk', 'saw', 'read', 'follow', 'watched'] },
        { label: 'Asks for something small', tip: 'Ask for something small, for example "one question" or "15 minutes".', any: ['one question', 'minutes', 'short question'] },
        { label: 'Makes it easy to say no', tip: 'Make it easy to say no, for example "If you are busy, no problem".', any: ['no problem', 'no worries', 'busy', 'if you have time', 'if you can'] },
      ],
      avoid: [casual],
    },
    checklist: [
      'Does Alex know in the first sentence why you write to him?',
      'Is your request small (one question, not "teach me everything")?',
      'Can Alex say no without feeling bad?',
      'Do you say thank you?',
    ],
    modelAnswers: [{
      text: 'Hello Alex,\n\nI watched your talk about code reviews last week, and I learned a lot. I am a junior developer, and I am preparing for my first interviews.\n\nCould I ask you one question about how you prepare for technical interviews? If you are busy, no problem at all. Thank you for your time.\n\nBest regards,\nMia',
      why: 'It shows that you know his work, asks one small thing, and says no problem if he is busy. That makes a yes easy.',
    }],
    skillTags: ['asking-advice'],
  },
  {
    id: 'wr-13', module: 'writing', order: 13, level: 2,
    title: 'Write a short post about a project',
    area: 'LinkedIn',
    situation: 'You built a small budget app with React in two months. The main page was slow at first (4 seconds to load), and you made it faster (1 second). You want to share it on LinkedIn.',
    task: 'Write a short post: what you built, one fact, what you learned, and a question for the readers.',
    phrases: ['I built ...', 'I reduced ... from ... to ...', 'I learned that ...', 'What is the best tip you have for ... ?'],
    targetWords: { min: 50, max: 100 },
    checks: {
      request: true,
      required: [
        { label: 'Says what you built', tip: 'Say what you built, for example "I built a small budget app".', any: ['built', 'made', 'created'] },
        { label: 'Gives a fact with a number', tip: 'Give a fact with a number, for example "from 4 seconds to 1 second".', any: ['seconds', 'percent', '%', 'weeks', 'months'] },
        { label: 'Says what you learned', tip: 'Say what you learned, for example "I learned that ...".', any: ['learned', 'learnt'] },
      ],
      avoid: [emptyWords, casual],
    },
    checklist: [
      'Is the first line clear and interesting?',
      'Are the sentences and paragraphs short?',
      'Do you end with a real question for the readers?',
      'Is the tone calm, without capital letters and many exclamation marks?',
    ],
    modelAnswers: [{
      text: 'I built a small budget app with React in two months.\n\nAt first, the main page took 4 seconds to load. I reduced it to 1 second by loading the charts only when users need them.\n\nI learned that small changes can make a big difference, and that I should measure before I change anything.\n\nWhat is the best tip you have for making web pages faster?',
      why: 'A clear first line, a fact with numbers, a lesson, and a real question for the readers. Short paragraphs are easy to read on a phone.',
    }],
    skillTags: ['posts'],
  },
];
