// Reading lesson: a weekly status report. Only data, no logic.
// Exercise ids must never change after you start using the app (progress is saved by id).
// The project, the client and the numbers are made up.

export const readingStatusReport = {
  id: 'reading-status-report',
  module: 'reading',
  title: 'Reading: a status report',
  level: 3,
  order: 47,
  passage: {
    title: 'Project update: Bright Bakery website',
    paragraphs: [
      'Week 3 of 6',
      'Done this week: We finished the home page and the menu page. The client approved both on Tuesday.',
      'In progress: The order form is 70% complete. Payment testing starts on Thursday.',
      'Problems: The client has not sent the text for the About page yet. This blocks the About page but not the order form. The photo files are also too large, so we need smaller versions.',
      'Next week: Finish the order form, test payments, and add the About page if the text arrives.',
      'Budget: We have used $1,400 of the $2,500 budget.',
      'Risks: If the text arrives after November 20, we may miss the December 1 launch. We will decide on a backup plan on Friday.',
    ],
  },
  explanation: [
    'A status report is organized by topic: done, in progress, problems, next steps, budget, and risks. Use these headings to find information fast.',
    'Do not confuse what is finished with what is still in progress. Verbs like \"finished\" and \"starts\" tell you the difference.',
    'A problem is not always a risk. A problem is happening now; a risk may happen later.',
    'The most useful clarifying question asks about the thing that could stop the project.',
  ],
  examples: [
    {
      text: 'Text: \"This blocks the About page but not the order form.\"',
      note: 'The missing text affects one page only. The rest of the work can continue.',
    },
    {
      text: 'Text: \"If the text arrives after November 20, we may miss the December 1 launch.\"',
      note: 'This is a risk: it depends on a future event.',
    },
  ],
  exercises: [
    {
      id: 'rs-01', type: 'multiple-choice',
      prompt: 'What is this text?',
      choices: [
        'A weekly project update.',
        'A final project report.',
        'A job interview schedule.',
        'A new client brief.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'A final project report.',
          feedback: 'The text says \"Week 3 of 6\", so the project is not finished.',
        },
        {
          answer: 'A job interview schedule.',
          feedback: 'No interviews are mentioned. It is about a website project.',
        },
        {
          answer: 'A new client brief.',
          feedback: 'The project is already running. A brief comes before the work starts.',
        },
      ],
      hints: ['Look at the first line.'],
      explanation: 'The first line says \"Week 3 of 6\", so this is a weekly update during the project.',
      skillTags: ['reading-status-reports', 'reading-main-idea'],
    },
    {
      id: 'rs-02', type: 'multiple-choice',
      prompt: 'What was finished this week?',
      choices: [
        'The home page and the menu page.',
        'The order form and the payments.',
        'The About page.',
        'The whole website.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The order form and the payments.',
          feedback: 'The order form is 70% complete. Payment testing has not started yet.',
        },
        {
          answer: 'The About page.',
          feedback: 'The About page is blocked because the client has not sent the text.',
        },
        {
          answer: 'The whole website.',
          feedback: 'The project is only at week 3 of 6.',
        },
      ],
      hints: ['Read the line that starts with \"Done this week\".'],
      explanation: 'The home page and the menu page were finished and approved.',
      skillTags: ['reading-status-reports', 'reading-details'],
    },
    {
      id: 'rs-03', type: 'multiple-choice',
      prompt: 'Why is the About page blocked?',
      choices: [
        'The client has not sent the text yet.',
        'The photos are too large.',
        'The budget is too small.',
        'The order form is not finished.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The photos are too large.',
          feedback: 'The photos are a separate problem. The About page needs text.',
        },
        {
          answer: 'The budget is too small.',
          feedback: 'The budget is not given as the reason. The missing text is the blocker.',
        },
        {
          answer: 'The order form is not finished.',
          feedback: 'The text says the missing text blocks the About page but not the order form.',
        },
      ],
      hints: ['Find the word \"blocks\".'],
      explanation: 'The client has not sent the text for the About page, so that page cannot be finished.',
      skillTags: ['reading-status-reports', 'reading-details'],
    },
    {
      id: 'rs-04', type: 'fill-blank',
      prompt: 'Complete the sentence from the report: "The order form is ___% complete."',
      acceptedAnswers: ['70'],
      commonMistakes: [
        {
          answer: '30',
          feedback: 'The report says 70% complete. Thirty percent is the part that is not done.',
        },
      ],
      hints: ['Look at the \"In progress\" line.'],
      explanation: 'The order form is 70% complete.',
      skillTags: ['reading-status-reports', 'reading-details'],
    },
    {
      id: 'rs-05', type: 'fill-blank',
      prompt: 'Complete the sentence from the report: "We have used $1,400 of the $___ budget."',
      acceptedAnswers: ['2,500', '2500'],
      commonMistakes: [
        {
          answer: '1,400',
          feedback: 'That is the amount used. The total budget is 2,500.',
        },
      ],
      hints: ['Find the line that starts with \"Budget\".'],
      explanation: 'The team has used $1,400 of the $2,500 budget.',
      skillTags: ['reading-status-reports', 'reading-details'],
    },
    {
      id: 'rs-06', type: 'multiple-choice',
      prompt: 'What is the risk to the December 1 launch?',
      choices: [
        'The client may send the text after November 20.',
        'The payment test may take two days.',
        'The photos may be too small.',
        'The budget may be too large.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The payment test may take two days.',
          feedback: 'The report does not give a duration for payment testing.',
        },
        {
          answer: 'The photos may be too small.',
          feedback: 'The report says the photos are too large, not too small.',
        },
        {
          answer: 'The budget may be too large.',
          feedback: 'A larger budget would not be a risk. The risk is about the missing text.',
        },
      ],
      hints: ['Read the line that starts with \"Risks\".'],
      explanation: 'If the text arrives after November 20, the team may miss the December 1 launch.',
      skillTags: ['reading-status-reports', 'reading-inference'],
    },
    {
      id: 'rs-07', type: 'multiple-choice',
      prompt: 'What problem do the photos cause?',
      choices: [
        'The files are too large, so the team needs smaller versions.',
        'The photos are the wrong color.',
        'The client does not like the photos.',
        'The photos are missing.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The photos are the wrong color.',
          feedback: 'Color is not mentioned in the problems line.',
        },
        {
          answer: 'The client does not like the photos.',
          feedback: 'The client has not complained about the photos.',
        },
        {
          answer: 'The photos are missing.',
          feedback: 'The photos exist. The problem is their size.',
        },
      ],
      hints: ['Read the \"Problems\" line to the end.'],
      explanation: 'The photo files are too large, so the team needs smaller versions.',
      skillTags: ['reading-status-reports', 'reading-details'],
    },
    {
      id: 'rs-08', type: 'multiple-choice',
      prompt: 'What will the team decide on Friday?',
      choices: [
        'A backup plan for the launch.',
        'The final price of the website.',
        'Which photo editor to use.',
        'Whether to hire another developer.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The final price of the website.',
          feedback: 'The budget is already set at $2,500. Friday is about the backup plan.',
        },
        {
          answer: 'Which photo editor to use.',
          feedback: 'No photo editor is mentioned.',
        },
        {
          answer: 'Whether to hire another developer.',
          feedback: 'Hiring is not mentioned in the report.',
        },
      ],
      hints: ['Read the last sentence.'],
      explanation: 'The team will decide on a backup plan on Friday.',
      skillTags: ['reading-status-reports', 'reading-details'],
    },
    {
      id: 'rs-09', type: 'reorder',
      prompt: 'Put the words in the correct order to make a sentence from the report.',
      words: ['both', 'The', 'on', 'client', 'Tuesday.', 'approved'],
      acceptedAnswers: ['The client approved both on Tuesday.'],
      hints: ['It starts with \"The client\".'],
      explanation: 'The sentence is: The client approved both on Tuesday.',
      skillTags: ['reading-status-reports', 'sentence-order'],
    },
    {
      id: 'rs-10', type: 'multiple-choice',
      prompt: 'Which is the best clarifying question about this report?',
      choices: [
        'Will the client send the About page text before November 20?',
        'Why did the client approve the home page?',
        'Can we increase the budget to $5,000?',
        'Did we finish the menu page?',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Why did the client approve the home page?',
          feedback: 'The approval is good news. It does not block the project.',
        },
        {
          answer: 'Can we increase the budget to $5,000?',
          feedback: 'This asks for a change, not for missing information.',
        },
        {
          answer: 'Did we finish the menu page?',
          feedback: 'The report already says the menu page is finished and approved.',
        },
      ],
      hints: ['Ask about the risk that could delay the launch.'],
      explanation: 'The missing text is the main risk, so ask when it will arrive.',
      skillTags: ['reading-status-reports', 'clarifying-questions'],
    },
  ],
};
