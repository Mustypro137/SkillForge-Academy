// Texts for typing practice. This file is only data.
// Rules: plain keyboard characters only (no curly quotes), no line breaks,
// one space between words. A test in tests/typing-texts.test.js checks this.

export const categories = [
  { id: 'sentences',    label: 'Sentences' },
  { id: 'common-words', label: 'Common words' },
  { id: 'punctuation',  label: 'Punctuation' },
  { id: 'professional', label: 'Professional phrases' },
];

export const typingTexts = [
  // Common words
  { id: 'words-01', category: 'common-words', level: 1, text: 'time people work year good make just know take come think see look want give use find tell ask seem feel try leave call' },
  { id: 'words-02', category: 'common-words', level: 1, text: 'about after again always because before between different every example following important little never often other small thing under until while write' },
  { id: 'words-03', category: 'common-words', level: 1, text: 'message project client email update report review share send meet plan check help reply answer draft' },
  { id: 'words-04', category: 'common-words', level: 1, text: 'week month today tomorrow morning evening Monday Friday later early soon ready finish start begin continue stop' },
  { id: 'words-05', category: 'common-words', level: 2, text: 'account budget deadline invoice payment price contract offer order delivery support service team company' },
  { id: 'words-06', category: 'common-words', level: 2, text: 'learn practice improve lesson skill speed correct mistake sentence word grammar spelling reading writing typing' },

  // Sentences
  { id: 'sent-01', category: 'sentences', level: 1, text: 'I check my email every morning before I start my work.' },
  { id: 'sent-02', category: 'sentences', level: 1, text: 'She works from home on Mondays and Fridays.' },
  { id: 'sent-03', category: 'sentences', level: 1, text: 'Please let me know if you have any questions about the project.' },
  { id: 'sent-04', category: 'sentences', level: 2, text: 'We are going to finish the first version of the website next week.' },
  { id: 'sent-05', category: 'sentences', level: 2, text: 'My goal is to write clear and polite messages to my clients.' },
  { id: 'sent-06', category: 'sentences', level: 2, text: 'The meeting starts at ten, so I will join the call five minutes early.' },
  { id: 'sent-07', category: 'sentences', level: 2, text: 'Good communication saves time, and it helps people trust each other.' },
  { id: 'sent-08', category: 'sentences', level: 2, text: 'I practice typing for ten minutes every day, and I am getting faster.' },

  // Punctuation
  { id: 'punc-01', category: 'punctuation', level: 1, text: 'Hello, my name is Sam. I am a developer; I like clean code.' },
  { id: 'punc-02', category: 'punctuation', level: 2, text: "Wait, is the file ready? Yes, it's ready: you can download it now!" },
  { id: 'punc-03', category: 'punctuation', level: 2, text: 'Our plan has three steps: write the code, test it, and share it.' },
  { id: 'punc-04', category: 'punctuation', level: 3, text: 'She said, "I\'ll send the invoice today." Then she sent it.' },
  { id: 'punc-05', category: 'punctuation', level: 3, text: 'Items needed: a laptop, a charger, a notebook, and a pen (any color).' },
  { id: 'punc-06', category: 'punctuation', level: 3, text: "It isn't hard - it just takes time; don't give up!" },
  { id: 'punc-07', category: 'punctuation', level: 2, text: 'Dear Ms. Lee, thank you for your reply. Best regards, Sam' },
  { id: 'punc-08', category: 'punctuation', level: 1, text: 'Questions? Comments? Ideas? Please send them to me by Friday.' },

  // Professional phrases
  { id: 'prof-01', category: 'professional', level: 1, text: 'Thank you for your message. I will send you the update by Friday.' },
  { id: 'prof-02', category: 'professional', level: 2, text: 'Hi Anna, thanks for connecting. I enjoyed reading your post about remote work.' },
  { id: 'prof-03', category: 'professional', level: 2, text: 'Could you please share more details about the project before we start?' },
  { id: 'prof-04', category: 'professional', level: 2, text: 'I have attached the final files. Please let me know if you need any changes.' },
  { id: 'prof-05', category: 'professional', level: 2, text: 'Thank you for your patience. I apologize for the delay in my reply.' },
  { id: 'prof-06', category: 'professional', level: 3, text: 'The deadline is Friday at 5 p.m. I can deliver the first draft on Wednesday.' },
  { id: 'prof-07', category: 'professional', level: 3, text: 'I would be happy to discuss the project in more detail during a short call.' },
  { id: 'prof-08', category: 'professional', level: 2, text: 'Please find the invoice attached. Payment is due within seven days.' },
];
