// Reading lesson: meeting notes. Only data, no logic.
// Exercise ids must never change after you start using the app (progress is saved by id).
// The studio, the people and the dates are made up.

export const readingMeetingNotes = {
  id: 'reading-meeting-notes',
  module: 'reading',
  title: 'Reading: meeting notes',
  level: 2,
  order: 48,
  passage: {
    title: 'Meeting notes: mobile app kickoff',
    paragraphs: [
      'Date: October 6, 10 a.m. EST',
      'Present: Ana (project manager), Ben (designer), Chen (developer), Dana (client)',
      'Dana wants a simple app for her yoga studio. Users should see the class schedule, book a class, and pay online. She does not need user profiles or social features in version 1.',
      'Ben will share the first design screens by October 13. Chen will set up the project and the test environment by October 15. Ana will send a weekly update every Friday.',
      'Decisions: We will build the app for iOS first. Android will come later if the iOS version works well. We will use the client\'s existing payment provider.',
      'Open questions: Should users be able to cancel a booking? How many classes can one person book per week? Dana will answer by October 10.',
      'Next meeting: October 20 at 10 a.m. EST.',
    ],
  },
  explanation: [
    'Meeting notes often use short labels: present, decisions, open questions, next meeting. These labels help you find information quickly.',
    'A decision is final for now. An open question is not answered yet, even if someone will answer it later.',
    'Names with tasks and dates are easy to test: who will do what, and by when?',
    'When you write a clarifying question, ask about an open question that affects the work.',
  ],
  examples: [
    {
      text: 'Text: \"Ben will share the first design screens by October 13.\"',
      note: 'Who: Ben. What: design screens. When: by October 13.',
    },
    {
      text: 'Text: \"Should users be able to cancel a booking?\"',
      note: 'This is under \"Open questions\", so there is no answer yet.',
    },
  ],
  exercises: [
    {
      id: 'rm-01', type: 'multiple-choice',
      prompt: 'What is this text?',
      choices: [
        'Notes from a project kickoff meeting.',
        'A final report about a finished app.',
        'A job advertisement for a designer.',
        'A message from a user to a yoga studio.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'A final report about a finished app.',
          feedback: 'The meeting is a kickoff, so the project is just starting.',
        },
        {
          answer: 'A job advertisement for a designer.',
          feedback: 'The notes list the team. They do not advertise a job.',
        },
        {
          answer: 'A message from a user to a yoga studio.',
          feedback: 'This is an internal project meeting, not a message from a user.',
        },
      ],
      hints: ['Read the title and the list of people present.'],
      explanation: 'The title says \"mobile app kickoff\", so these are notes from the first project meeting.',
      skillTags: ['reading-meeting-notes', 'reading-main-idea'],
    },
    {
      id: 'rm-02', type: 'multiple-choice',
      prompt: 'What should users be able to do in the app?',
      choices: [
        'See the class schedule, book a class, and pay online.',
        'Create a profile and send messages to friends.',
        'Order food and track a delivery.',
        'Watch yoga videos and leave comments.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Create a profile and send messages to friends.',
          feedback: 'The notes say Dana does not need user profiles or social features in version 1.',
        },
        {
          answer: 'Order food and track a delivery.',
          feedback: 'The app is for a yoga studio. No food or delivery is mentioned.',
        },
        {
          answer: 'Watch yoga videos and leave comments.',
          feedback: 'Videos and comments are not mentioned in the notes.',
        },
      ],
      hints: ['Find the sentence that starts with \"Dana wants\".'],
      explanation: 'Users should see the schedule, book a class, and pay online.',
      skillTags: ['reading-meeting-notes', 'reading-details'],
    },
    {
      id: 'rm-03', type: 'multiple-choice',
      prompt: 'What is NOT part of version 1?',
      choices: [
        'User profiles and social features.',
        'The class schedule.',
        'Online payments.',
        'Booking a class.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The class schedule.',
          feedback: 'The schedule is one of the main features in version 1.',
        },
        {
          answer: 'Online payments.',
          feedback: 'Users should be able to pay online in version 1.',
        },
        {
          answer: 'Booking a class.',
          feedback: 'Booking is part of version 1.',
        },
      ],
      hints: ['Look for the words \"does not need\" in the third paragraph.'],
      explanation: 'Dana does not need user profiles or social features in version 1.',
      skillTags: ['reading-meeting-notes', 'reading-details'],
    },
    {
      id: 'rm-04', type: 'fill-blank',
      prompt: 'Complete the sentence from the notes: "Ben will share the first design screens by October ___."',
      acceptedAnswers: ['13'],
      commonMistakes: [
        {
          answer: '15',
          feedback: 'October 15 is Chen\'s deadline for the project setup. Ben shares designs by October 13.',
        },
      ],
      hints: ['Find the sentence about Ben.'],
      explanation: 'Ben will share the first design screens by October 13.',
      skillTags: ['reading-meeting-notes', 'reading-details'],
    },
    {
      id: 'rm-05', type: 'multiple-choice',
      prompt: 'Who will send a weekly update?',
      choices: ['Ana.', 'Ben.', 'Chen.', 'Dana.'],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Ben.',
          feedback: 'Ben shares the design screens. Ana sends the weekly update.',
        },
        {
          answer: 'Chen.',
          feedback: 'Chen sets up the project and test environment.',
        },
        {
          answer: 'Dana.',
          feedback: 'Dana is the client. She answers the open questions.',
        },
      ],
      hints: ['Find the name next to \"weekly update\".'],
      explanation: 'Ana will send a weekly update every Friday.',
      skillTags: ['reading-meeting-notes', 'reading-details'],
    },
    {
      id: 'rm-06', type: 'multiple-choice',
      prompt: 'What was decided about the platforms?',
      choices: [
        'Build for iOS first, and Android later if the iOS version works well.',
        'Build for Android first, and iOS later.',
        'Build for iOS and Android at the same time.',
        'Build only for the web.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Build for Android first, and iOS later.',
          feedback: 'The notes say iOS first, not Android first.',
        },
        {
          answer: 'Build for iOS and Android at the same time.',
          feedback: 'The notes say Android will come later.',
        },
        {
          answer: 'Build only for the web.',
          feedback: 'This is a mobile app project, and no web version is mentioned.',
        },
      ],
      hints: ['Read the line that starts with \"Decisions\".'],
      explanation: 'The team decided to build for iOS first and Android later.',
      skillTags: ['reading-meeting-notes', 'reading-details'],
    },
    {
      id: 'rm-07', type: 'fill-blank',
      prompt: 'Complete the sentence from the notes: "Ana will send a weekly update every ___."',
      acceptedAnswers: ['Friday'],
      commonMistakes: [
        {
          answer: 'Monday',
          feedback: 'The notes say Friday, not Monday.',
        },
      ],
      hints: ['Find the last sentence about Ana.'],
      explanation: 'Ana will send a weekly update every Friday.',
      skillTags: ['reading-meeting-notes', 'reading-details'],
    },
    {
      id: 'rm-08', type: 'multiple-choice',
      prompt: 'Which questions are still open?',
      choices: [
        'Booking cancellation and the number of classes one person can book per week.',
        'The price of the app and the name of the app.',
        'The design colors and the meeting room.',
        'The payment provider and the launch date.',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'The price of the app and the name of the app.',
          feedback: 'The price and the app name are not listed as open questions.',
        },
        {
          answer: 'The design colors and the meeting room.',
          feedback: 'These are not mentioned as open questions.',
        },
        {
          answer: 'The payment provider and the launch date.',
          feedback: 'The payment provider was decided: the client\'s existing one.',
        },
      ],
      hints: ['Read the line that starts with \"Open questions\".'],
      explanation: 'Cancellation and the weekly booking limit are still open.',
      skillTags: ['reading-meeting-notes', 'reading-details'],
    },
    {
      id: 'rm-09', type: 'reorder',
      prompt: 'Put the words in the correct order to make a sentence from the notes.',
      words: ['the', 'We', 'for', 'build', 'iOS', 'app', 'first.', 'will'],
      acceptedAnswers: ['We will build the app for iOS first.'],
      hints: ['It starts with \"We will\".'],
      explanation: 'The sentence is: We will build the app for iOS first.',
      skillTags: ['reading-meeting-notes', 'sentence-order'],
    },
    {
      id: 'rm-10', type: 'multiple-choice',
      prompt: 'Which is the best clarifying question to ask Dana?',
      choices: [
        'How many classes can one person book per week?',
        'Why does the app need a class schedule?',
        'Can we build Android first instead?',
        'Who is the designer on this project?',
      ],
      correct: 0,
      commonMistakes: [
        {
          answer: 'Why does the app need a class schedule?',
          feedback: 'The schedule is a clear feature request. It is not an open question.',
        },
        {
          answer: 'Can we build Android first instead?',
          feedback: 'The team already decided to build iOS first.',
        },
        {
          answer: 'Who is the designer on this project?',
          feedback: 'The notes say Ben is the designer.',
        },
      ],
      hints: ['Ask about one of the questions in the \"Open questions\" line.'],
      explanation: 'The weekly booking limit is an open question that Dana will answer.',
      skillTags: ['reading-meeting-notes', 'clarifying-questions'],
    },
  ],
};
