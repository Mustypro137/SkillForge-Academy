// Reading lesson: a job post. Only data, no logic.
// Exercise ids must never change after you start using the app (progress is saved by id).
// The company and the job are made up.

export const readingJobPost = {
  id: 'reading-job-post',
  module: 'reading',
  title: 'Reading: a job post',
  level: 2,
  order: 44,
  passage: {
    title: 'Junior Frontend Developer at Nova Studio',
    paragraphs: [
      'Nova Studio is hiring a Junior Frontend Developer to join our small team in Austin. This is a full-time role with two days a week in the office and three days remote.',
      'You will build and maintain user interfaces with React and TypeScript. You will work with designers and a backend developer. We expect you to write tests and take part in code reviews.',
      'Requirements: at least one year of experience with JavaScript, a good understanding of HTML and CSS, and basic knowledge of Git.',
      'Nice to have: experience with Next.js, accessibility testing, or design tools such as Figma.',
      'We offer a salary of $55,000 to $65,000 a year, health insurance, and 20 days of paid vacation.',
      'To apply, send your resume and a link to one project you are proud of to jobs@novastudio.example. We review applications every Monday. The start date is not fixed yet; we will agree on it with the successful candidate.',
    ],
  },
  explanation: [
    'Read the text once quickly. You do not need to understand every word to answer the questions.',
    'Then read each question and find the part of the text that answers it. The answer is often in one sentence.',
    'Look for the difference between requirements (skills you must have) and nice to have (extra skills).',
    'Some information is missing or unclear. That is useful too: it tells you what to ask in a clarifying question.',
  ],
  examples: [
    {
      text: 'Question: Which experience is required? Text: "at least one year of experience with JavaScript".',
      note: 'Match the question to a word in the text. "Requirements" marks the must-have skills.',
    },
    {
      text: 'Question: What is unclear? Text: "The start date is not fixed yet".',
      note: 'When the text says something is not decided, that is the unclear part.',
    },
  ],
  exercises: [
    {
      id: 'rj-01', type: 'multiple-choice',
      prompt: 'What is the main purpose of this text?',
      choices: [
        'To describe a job and explain how to apply.',
        'To sell a course in web development.',
        'To announce a new product.',
        'To complain about a project.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'To sell a course in web development.',
          feedback: 'Nothing in the text sells a course. It is about a job at a studio.',
        },
        {
          answer: 'To announce a new product.',
          feedback: 'The text describes a job, not a product.',
        },
        {
          answer: 'To complain about a project.',
          feedback: 'The tone is positive and it invites applications.',
        },
      ],
      hints: ['Look at the first sentence and the last paragraph.'],
      explanation: 'The text describes an open job and tells people how to apply.',
      skillTags: ['reading-job-posts', 'reading-main-idea'],
    },
    {
      id: 'rj-02', type: 'multiple-choice',
      prompt: 'Which experience is required for the job?',
      choices: [
        'At least one year with JavaScript.',
        'At least two years with React.',
        'Experience with Next.js.',
        'Experience with Figma.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'At least two years with React.',
          feedback: 'The text asks for one year with JavaScript, not two years with React.',
        },
        {
          answer: 'Experience with Next.js.',
          feedback: 'Next.js is listed under "Nice to have", not under requirements.',
        },
        {
          answer: 'Experience with Figma.',
          feedback: 'Figma is a design tool and is only nice to have.',
        },
      ],
      hints: ['Find the word "Requirements".'],
      explanation: 'The Requirements paragraph names one year of JavaScript experience first.',
      skillTags: ['reading-job-posts', 'reading-details'],
    },
    {
      id: 'rj-03', type: 'multiple-choice',
      prompt: 'How many days a week are in the office?',
      choices: ['Two.', 'Three.', 'Five.', 'None.'],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Three.',
          feedback: 'Three days are remote. Two days are in the office.',
        },
        {
          answer: 'Five.',
          feedback: 'The role is not fully in the office. Read the first paragraph again.',
        },
        {
          answer: 'None.',
          feedback: 'The role is not fully remote. Two days are in the office.',
        },
      ],
      hints: ['Read the first paragraph slowly. It gives two numbers.'],
      explanation: 'The text says two days a week in the office and three days remote.',
      skillTags: ['reading-job-posts', 'reading-details'],
    },
    {
      id: 'rj-04', type: 'fill-blank',
      prompt: 'Complete the sentence from the text: "The salary is between $55,000 and $___ a year."',
      acceptedAnswers: ['65,000', '65000'],
      commonMistakes: [
        {
          answer: '55,000',
          feedback: 'That is the lower number. The range ends at 65,000.',
        },
      ],
      hints: ['Look at the paragraph about the offer.'],
      explanation: 'The salary range is $55,000 to $65,000 a year.',
      skillTags: ['reading-job-posts', 'reading-details'],
    },
    {
      id: 'rj-05', type: 'multiple-choice',
      prompt: 'Which skill is nice to have, but not required?',
      choices: ['Next.js.', 'JavaScript.', 'HTML.', 'Git.'],
      correct: 0,
      commonMistakes: [
        {
          answer: 'JavaScript.',
          feedback: 'JavaScript is a requirement, not a nice-to-have skill.',
        },
        {
          answer: 'HTML.',
          feedback: 'HTML is part of the requirements.',
        },
        {
          answer: 'Git.',
          feedback: 'Basic knowledge of Git is required.',
        },
      ],
      hints: ['Find the paragraph that starts with "Nice to have".'],
      explanation: 'Next.js is in the nice-to-have list. The other three are requirements.',
      skillTags: ['reading-job-posts', 'reading-details'],
    },
    {
      id: 'rj-06', type: 'multiple-choice',
      prompt: 'What is unclear in the text?',
      choices: [
        'The exact start date.',
        'The salary range.',
        'The office location.',
        'The number of vacation days.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The salary range.',
          feedback: 'The text gives a clear range: $55,000 to $65,000.',
        },
        {
          answer: 'The office location.',
          feedback: 'The text says the team is in Austin.',
        },
        {
          answer: 'The number of vacation days.',
          feedback: 'The text says 20 days of paid vacation.',
        },
      ],
      hints: ['Look for the words "not fixed yet".'],
      explanation: 'The text says the start date is not fixed yet, so it is the unclear point.',
      skillTags: ['reading-job-posts', 'reading-inference'],
    },
    {
      id: 'rj-07', type: 'fill-blank',
      prompt: 'Complete the sentence from the text: "Send your resume and a link to one ___ you are proud of."',
      acceptedAnswers: ['project'],
      commonMistakes: [
        {
          answer: 'portfolio',
          feedback: 'The text asks for a link to one project, not a full portfolio.',
        },
      ],
      hints: ['Look at the last paragraph.'],
      explanation: 'The application asks for a resume and a link to one project.',
      skillTags: ['reading-job-posts', 'reading-details'],
    },
    {
      id: 'rj-08', type: 'multiple-choice',
      prompt: 'When does the company review applications?',
      choices: ['Every Monday.', 'Every Friday.', 'Every day.', 'Once a month.'],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Every Friday.',
          feedback: 'Friday is not mentioned. The text says Monday.',
        },
        {
          answer: 'Every day.',
          feedback: 'The text gives one day of the week, not every day.',
        },
        {
          answer: 'Once a month.',
          feedback: 'The text says every Monday, which is once a week.',
        },
      ],
      hints: ['Find the sentence about reviewing applications.'],
      explanation: 'The text says applications are reviewed every Monday.',
      skillTags: ['reading-job-posts', 'reading-details'],
    },
    {
      id: 'rj-09', type: 'reorder',
      prompt: 'Put the words in the correct order to make a sentence from the text.',
      words: ['will', 'You', 'with', 'designers.', 'work'],
      acceptedAnswers: ['You will work with designers.'],
      hints: ['It starts with the person who will do the work.'],
      explanation: 'The sentence is: You will work with designers.',
      skillTags: ['reading-job-posts', 'sentence-order'],
    },
    {
      id: 'rj-10', type: 'multiple-choice',
      prompt: 'Which is the best clarifying question to ask about this job?',
      choices: [
        'When will the start date be decided?',
        'Why is the salary only $55,000?',
        'Can I skip the code reviews?',
        'Do I need to send a resume?',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Why is the salary only $55,000?',
          feedback: 'The salary range is clear. This question sounds critical, not clarifying.',
        },
        {
          answer: 'Can I skip the code reviews?',
          feedback: 'Code reviews are part of the role. Asking to skip them is not a useful clarification.',
        },
        {
          answer: 'Do I need to send a resume?',
          feedback: 'The text already says to send a resume.',
        },
      ],
      hints: ['Ask about the information the text says is not decided.'],
      explanation: 'The start date is the only unclear point, so ask about that.',
      skillTags: ['reading-job-posts', 'clarifying-questions'],
    },
  ],
};
