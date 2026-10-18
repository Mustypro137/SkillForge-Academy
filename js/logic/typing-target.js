// Builds the text to type from the list of typing texts. Pure function.

function shuffled(items, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Picks texts from one category in random order and joins them with a space
// until the result has at least minChars characters (always at least one text).
// minChars = 0 gives exactly one text (untimed mode).
// "random" can be replaced in tests to get a predictable order.
export function buildTarget(texts, { category, minChars = 0, random = Math.random } = {}) {
  const pool = texts.filter((item) => item.category === category);
  if (pool.length === 0) throw new Error(`No typing texts for category "${category}"`);

  const parts = [];
  let length = 0;
  while (parts.length === 0 || length < minChars) {
    for (const item of shuffled(pool, random)) {
      parts.push(item.text);
      length += (parts.length === 1 ? 0 : 1) + item.text.length; // +1 for the joining space
      if (length >= minChars) break;
    }
  }
  return parts.join(' ');
}
