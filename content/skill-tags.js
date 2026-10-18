// Readable names for the skill tags used in the exercises.
// A test checks that every tag used in the lessons has a name here.

export const skillTagLabels = {
  'capital-letters': 'Capital letters',
  'end-punctuation': 'Full stops and question marks',
  apostrophe: 'Apostrophes',
  greetings: 'Greetings in messages',
  'sentence-order': 'Word order in sentences',
  'present-simple': 'Present simple',
  'third-person-s': 'Verb endings with he, she, it (-s)',
  negative: 'Negative sentences (do not, does not)',
  questions: 'Questions (do, does)',
  'have-has': 'Have and has',
  'a-an': 'A and an',
  the: 'The',
  'no-article': 'No article',
  uncountable: 'Uncountable nouns',
  jobs: 'Jobs and a/an',
};

export function skillTagLabel(tag) {
  return skillTagLabels[tag] ?? tag.replace(/-/g, ' ');
}
