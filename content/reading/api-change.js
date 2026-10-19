// Reading lesson: an API change notice. Only data, no logic.
// Exercise ids must never change after you start using the app (progress is saved by id).
// The service, the versions and the dates are made up.

export const readingApiChange = {
  id: 'reading-api-change',
  module: 'reading',
  title: 'Reading: an API change notice',
  level: 3,
  order: 46,
  passage: {
    title: 'API change for the payments service',
    paragraphs: [
      'Next month we will release version 2 of the payments API. The new version adds partial refunds and a webhook for failed payments.',
      'The old endpoint /v1/charge will keep working until March 31. After that date it will return an error. Please move to /v2/payments before the deadline.',
      'The request format changes slightly: the amount is now in cents, not dollars, and the currency field is required. The response includes a new status field with one of three values: paid, pending, or failed.',
      'We will send a test key to every developer on February 1. The test environment will be available for two weeks. We do not yet have a date for the production key.',
      'If you have questions, reply to this email or join the office hours on Thursday at 3 p.m. EST.',
    ],
  },
  explanation: [
    'Technical notices often put the most important date in the second paragraph. Read the whole text before you plan any work.',
    'Separate the facts (dates, field names, values) from the missing information. Both matter for your next step.',
    'Pay attention to small words like \"until\", \"after\", \"before\", and \"not yet\". They change the meaning of a deadline.',
    'If a date is missing, ask about it early. Waiting can block your release.',
  ],
  examples: [
    {
      text: 'Text: \"will keep working until March 31\".',
      note: '\"Until\" means the old endpoint stops working after that date.',
    },
    {
      text: 'Text: \"We do not yet have a date for the production key.\"',
      note: 'The word \"yet\" tells you this is the missing information.',
    },
  ],
  exercises: [
    {
      id: 'ra-01', type: 'multiple-choice',
      prompt: 'What is the main purpose of this text?',
      choices: [
        'To announce an API change and explain what developers must do.',
        'To advertise a new payments company.',
        'To report a security problem.',
        'To ask developers to stop using the service.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'To advertise a new payments company.',
          feedback: 'The text comes from the service you already use. It is not an advertisement.',
        },
        {
          answer: 'To report a security problem.',
          feedback: 'No security problem is mentioned. The change is a new version.',
        },
        {
          answer: 'To ask developers to stop using the service.',
          feedback: 'The service continues. Only the old endpoint will stop working.',
        },
      ],
      hints: ['Read the first sentence and the deadline paragraph.'],
      explanation: 'The text announces version 2 and gives developers a deadline to move to it.',
      skillTags: ['reading-specs', 'reading-main-idea'],
    },
    {
      id: 'ra-02', type: 'multiple-choice',
      prompt: 'What does version 2 add?',
      choices: [
        'Partial refunds and a webhook for failed payments.',
        'A new login system.',
        'Lower prices.',
        'A mobile app.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'A new login system.',
          feedback: 'Login is not mentioned in the text.',
        },
        {
          answer: 'Lower prices.',
          feedback: 'The text talks about payment features, not prices.',
        },
        {
          answer: 'A mobile app.',
          feedback: 'No app is mentioned. The text is about an API.',
        },
      ],
      hints: ['Look at the second sentence.'],
      explanation: 'Version 2 adds partial refunds and a webhook for failed payments.',
      skillTags: ['reading-specs', 'reading-details'],
    },
    {
      id: 'ra-03', type: 'multiple-choice',
      prompt: 'When does the old endpoint /v1/charge stop working?',
      choices: ['After March 31.', 'After February 1.', 'After next month.', 'It stops working immediately.'],
      correct: 0,
      commonMistakes: [
        {
          answer: 'After February 1.',
          feedback: 'February 1 is when the test key is sent. The old endpoint works until March 31.',
        },
        {
          answer: 'After next month.',
          feedback: 'Version 2 is released next month, but the old endpoint has a later deadline.',
        },
        {
          answer: 'It stops working immediately.',
          feedback: 'The text says it will keep working until March 31.',
        },
      ],
      hints: ['Find the date in the paragraph about /v1/charge.'],
      explanation: 'The old endpoint keeps working until March 31 and returns an error after that date.',
      skillTags: ['reading-specs', 'reading-details'],
    },
    {
      id: 'ra-04', type: 'multiple-choice',
      prompt: 'What changes in the request?',
      choices: [
        'The amount is in cents and the currency field is required.',
        'The amount is in dollars and the currency field is optional.',
        'The endpoint is now /v1/payments.',
        'The response no longer has a status field.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The amount is in dollars and the currency field is optional.',
          feedback: 'The text says the opposite: cents, and currency is required.',
        },
        {
          answer: 'The endpoint is now /v1/payments.',
          feedback: 'The new endpoint is /v2/payments.',
        },
        {
          answer: 'The response no longer has a status field.',
          feedback: 'The response includes a new status field.',
        },
      ],
      hints: ['Read the paragraph that starts with \"The request format changes\".'],
      explanation: 'The amount moves from dollars to cents, and currency becomes required.',
      skillTags: ['reading-specs', 'reading-details'],
    },
    {
      id: 'ra-05', type: 'fill-blank',
      prompt: 'Complete the sentence from the text: "The amount is now in ___, not dollars."',
      acceptedAnswers: ['cents'],
      commonMistakes: [
        {
          answer: 'dollars',
          feedback: 'The text says cents, not dollars. The amount changes.',
        },
      ],
      hints: ['Look at the request format paragraph.'],
      explanation: 'The amount is now in cents.',
      skillTags: ['reading-specs', 'reading-details'],
    },
    {
      id: 'ra-06', type: 'multiple-choice',
      prompt: 'Which three values can the new status field have?',
      choices: [
        'Paid, pending, or failed.',
        'Paid, refunded, or canceled.',
        'Open, closed, or pending.',
        'Success, error, or retry.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Paid, refunded, or canceled.',
          feedback: 'The text names paid, pending, and failed.',
        },
        {
          answer: 'Open, closed, or pending.',
          feedback: 'Only pending is named in the text.',
        },
        {
          answer: 'Success, error, or retry.',
          feedback: 'These words are not in the status list.',
        },
      ],
      hints: ['Find the sentence about the response.'],
      explanation: 'The status values are paid, pending, and failed.',
      skillTags: ['reading-specs', 'reading-details'],
    },
    {
      id: 'ra-07', type: 'fill-blank',
      prompt: 'Complete the sentence from the text: "We will send a test key to every developer on February ___."',
      acceptedAnswers: ['1'],
      commonMistakes: [
        {
          answer: '31',
          feedback: 'March 31 is the deadline for the old endpoint. The test key comes on February 1.',
        },
      ],
      hints: ['Find the paragraph about the test key.'],
      explanation: 'The test key is sent on February 1.',
      skillTags: ['reading-specs', 'reading-details'],
    },
    {
      id: 'ra-08', type: 'multiple-choice',
      prompt: 'What is unclear in the text?',
      choices: [
        'The date when the production key will be available.',
        'The date when version 2 is released.',
        'The values of the status field.',
        'The deadline for the old endpoint.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The date when version 2 is released.',
          feedback: 'The text says version 2 is released next month.',
        },
        {
          answer: 'The values of the status field.',
          feedback: 'The text gives all three values: paid, pending, and failed.',
        },
        {
          answer: 'The deadline for the old endpoint.',
          feedback: 'The deadline is clear: March 31.',
        },
      ],
      hints: ['Look for the words \"We do not yet have\".'],
      explanation: 'The production key has no date yet, so that is the unclear part.',
      skillTags: ['reading-specs', 'reading-inference'],
    },
    {
      id: 'ra-09', type: 'reorder',
      prompt: 'Put the words in the correct order to make a sentence from the text.',
      words: ['the', 'Join', 'hours', 'office', 'on', 'Thursday.'],
      acceptedAnswers: ['Join the office hours on Thursday.'],
      hints: ['It starts with a verb.'],
      explanation: 'The sentence is: Join the office hours on Thursday.',
      skillTags: ['reading-specs', 'sentence-order'],
    },
    {
      id: 'ra-10', type: 'multiple-choice',
      prompt: 'Which is the best clarifying question for the API team?',
      choices: [
        'When will the production key be available?',
        'Why is the old endpoint still working?',
        'Can you cancel the March 31 deadline?',
        'Do we have to use the new version?',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Why is the old endpoint still working?',
          feedback: 'The text explains that it works until March 31. That is not unclear.',
        },
        {
          answer: 'Can you cancel the March 31 deadline?',
          feedback: 'This asks for a change, not for missing information. It is not a clarifying question.',
        },
        {
          answer: 'Do we have to use the new version?',
          feedback: 'The text tells you to move to version 2 before the deadline.',
        },
      ],
      hints: ['Ask about the one piece of information the text says is not known.'],
      explanation: 'The production key date is missing, so ask when it will be available.',
      skillTags: ['reading-specs', 'clarifying-questions'],
    },
  ],
};
