// Reading lesson: a client brief. Only data, no logic.
// Exercise ids must never change after you start using the app (progress is saved by id).
// The bakery, the budget and the dates are made up.

export const readingClientBrief = {
  id: 'reading-client-brief',
  module: 'reading',
  title: 'Reading: a client brief',
  level: 2,
  order: 45,
  passage: {
    title: 'Website brief from Sweet Crumb bakery',
    paragraphs: [
      'Hi, I need a website for my bakery, Sweet Crumb. We sell cakes and bread and we want to start taking orders online.',
      'The site needs a home page, a menu page with photos, and an order form. Customers should be able to choose a pickup date and pay online. We also need a page with our opening hours and address.',
      'Our brand colors are dark green and cream. I like simple designs with large photos. Please do not use too much text.',
      'We would like the site to be ready before December 1, because that is our busiest month. My budget is $2,500. I already have a logo and photos, but I do not have text for the pages.',
      'I am not sure if we need an online shop or just a form. Can you tell me which is better for us? Please reply by Friday with a plan and a price.',
    ],
  },
  explanation: [
    'A client brief mixes clear facts with wishes and open questions. Read it twice: first for the main request, then for details.',
    'Write down the four useful parts: what the client wants, what they already have, the limits (time and money), and what is unclear.',
    'Numbers and dates are easy to miss. Slow down when you see a date, a price, or a quantity.',
    'A good clarifying question is short and asks about one thing the brief does not answer.',
  ],
  examples: [
    {
      text: 'Text: "I already have a logo and photos, but I do not have text."',
      note: 'This tells you what the client will give you and what you must write yourself.',
    },
    {
      text: 'Text: "I am not sure if we need an online shop or just a form."',
      note: 'The client says they are not sure, so this is a good topic for a clarifying question.',
    },
  ],
  exercises: [
    {
      id: 'rc-01', type: 'multiple-choice',
      prompt: 'What does the client want?',
      choices: [
        'A bakery website with online orders.',
        'A new logo and new photos.',
        'A social media account.',
        'A recipe book.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'A new logo and new photos.',
          feedback: 'The client already has a logo and photos.',
        },
        {
          answer: 'A social media account.',
          feedback: 'The text is about a website, not social media.',
        },
        {
          answer: 'A recipe book.',
          feedback: 'The bakery sells cakes and bread. No book is mentioned.',
        },
      ],
      hints: ['Look at the first paragraph.'],
      explanation: 'The client wants a website for the bakery and wants to take orders online.',
      skillTags: ['reading-client-briefs', 'reading-main-idea'],
    },
    {
      id: 'rc-02', type: 'multiple-choice',
      prompt: 'Which page is NOT named in the brief?',
      choices: [
        'A blog page.',
        'A home page.',
        'A menu page.',
        'An order form.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'A home page.',
          feedback: 'The home page is named in the second paragraph.',
        },
        {
          answer: 'A menu page.',
          feedback: 'The menu page with photos is named in the second paragraph.',
        },
        {
          answer: 'An order form.',
          feedback: 'The order form is named in the second paragraph.',
        },
      ],
      hints: ['List every page the client names, then compare.'],
      explanation: 'The brief names a home page, a menu page, an order form, and a page with hours and address. There is no blog.',
      skillTags: ['reading-client-briefs', 'reading-details'],
    },
    {
      id: 'rc-03', type: 'multiple-choice',
      prompt: 'What does the client already have?',
      choices: [
        'A logo and photos.',
        'Text for every page.',
        'An online shop.',
        'A finished website.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Text for every page.',
          feedback: 'The brief says the client does not have text for the pages.',
        },
        {
          answer: 'An online shop.',
          feedback: 'The client is not sure if they need a shop or just a form.',
        },
        {
          answer: 'A finished website.',
          feedback: 'The client is asking for a new website.',
        },
      ],
      hints: ['Look for the word "already".'],
      explanation: 'The client says: "I already have a logo and photos."',
      skillTags: ['reading-client-briefs', 'reading-details'],
    },
    {
      id: 'rc-04', type: 'fill-blank',
      prompt: 'Complete the sentence from the brief: "Please reply by ___ with a plan and a price."',
      acceptedAnswers: ['Friday'],
      commonMistakes: [
        {
          answer: 'Monday',
          feedback: 'The brief says Friday, not Monday.',
        },
      ],
      hints: ['It is a day of the week in the last paragraph.'],
      explanation: 'The client asks for a reply by Friday.',
      skillTags: ['reading-client-briefs', 'reading-details'],
    },
    {
      id: 'rc-05', type: 'multiple-choice',
      prompt: 'What is the client\'s budget?',
      choices: ['$2,500.', '$1,500.', '$5,000.', 'The budget is not mentioned.'],
      correct: 0,
      commonMistakes: [
        {
          answer: '$1,500.',
          feedback: 'Read the fourth paragraph again. The number is 2,500.',
        },
        {
          answer: '$5,000.',
          feedback: 'The budget is $2,500, not $5,000.',
        },
        {
          answer: 'The budget is not mentioned.',
          feedback: 'The brief gives a clear budget in the fourth paragraph.',
        },
      ],
      hints: ['Find the sentence with the word "budget".'],
      explanation: 'The brief says: "My budget is $2,500."',
      skillTags: ['reading-client-briefs', 'reading-details'],
    },
    {
      id: 'rc-06', type: 'multiple-choice',
      prompt: 'Why does the client want the site before December 1?',
      choices: [
        'December is the bakery\'s busiest month.',
        'The bakery closes in December.',
        'The designer is on vacation in January.',
        'The domain name expires in December.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The bakery closes in December.',
          feedback: 'The text says December is the busiest month, not that the bakery closes.',
        },
        {
          answer: 'The designer is on vacation in January.',
          feedback: 'No vacation is mentioned in the brief.',
        },
        {
          answer: 'The domain name expires in December.',
          feedback: 'The brief does not mention a domain name.',
        },
      ],
      hints: ['The reason is in the same sentence as the date.'],
      explanation: 'The client says December is their busiest month.',
      skillTags: ['reading-client-briefs', 'reading-details'],
    },
    {
      id: 'rc-07', type: 'fill-blank',
      prompt: 'Complete the sentence from the brief: "I do not have ___ for the pages."',
      acceptedAnswers: ['text'],
      commonMistakes: [
        {
          answer: 'photos',
          feedback: 'The client already has photos. The missing thing is text.',
        },
      ],
      hints: ['Look at the end of the fourth paragraph.'],
      explanation: 'The client has a logo and photos, but no text for the pages.',
      skillTags: ['reading-client-briefs', 'reading-details'],
    },
    {
      id: 'rc-08', type: 'multiple-choice',
      prompt: 'What is unclear in the brief?',
      choices: [
        'Whether the client needs a full shop or a simple form.',
        'The brand colors.',
        'The pickup date system.',
        'The address of the bakery.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The brand colors.',
          feedback: 'The brief says dark green and cream.',
        },
        {
          answer: 'The pickup date system.',
          feedback: 'The brief says customers should choose a pickup date.',
        },
        {
          answer: 'The address of the bakery.',
          feedback: 'The brief asks for a page with the address, so it is part of the request.',
        },
      ],
      hints: ['Find the sentence where the client says "I am not sure".'],
      explanation: 'The client is not sure whether they need an online shop or just an order form.',
      skillTags: ['reading-client-briefs', 'reading-inference'],
    },
    {
      id: 'rc-09', type: 'reorder',
      prompt: 'Put the words in the correct order to make a sentence from the brief.',
      words: ['ready', 'the', 'site', 'before', 'December', 'We', 'would', 'like', '1.'],
      acceptedAnswers: ['We would like the site ready before December 1.'],
      hints: ['The sentence starts with "We would like".'],
      explanation: 'The sentence is: We would like the site ready before December 1.',
      skillTags: ['reading-client-briefs', 'sentence-order'],
    },
    {
      id: 'rc-10', type: 'multiple-choice',
      prompt: 'Which is the best clarifying question to ask this client?',
      choices: [
        'Would you like a full online shop or a simple order form?',
        'Why do you want dark green and cream?',
        'Can you send the photos again?',
        'Do you sell cakes?',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Why do you want dark green and cream?',
          feedback: 'The colors are clear. This does not help you plan the work.',
        },
        {
          answer: 'Can you send the photos again?',
          feedback: 'The client already has photos. The unclear part is the shop or the form.',
        },
        {
          answer: 'Do you sell cakes?',
          feedback: 'The first paragraph says the bakery sells cakes and bread.',
        },
      ],
      hints: ['Ask about the choice the client says they are not sure about.'],
      explanation: 'The client asks for advice about a shop or a form, so this is the question to clarify.',
      skillTags: ['reading-client-briefs', 'clarifying-questions'],
    },
  ],
};
