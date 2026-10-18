// Lets one page tell the next page what to open. Kept in memory only.
// Example: the dashboard says "open lesson X", and the grammar page opens it.

let pending = null;

export function setIntent(intent) {
  pending = intent;
}

// Returns the waiting intent (or null) and clears it, so it is used only once.
export function takeIntent() {
  const intent = pending;
  pending = null;
  return intent;
}
