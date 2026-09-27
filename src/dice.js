// Pure dice-rolling and history logic, independent of the DOM.
// The face source is injectable so tests can be deterministic; the default
// draws from Math.random.

export const COUNT_LIMITS = { min: 1, max: 20 };
export const SIDES_LIMITS = { min: 2, max: 100 };

export function defaultFaceSource(sides) {
  return 1 + Math.floor(Math.random() * sides);
}

/**
 * Validate that `raw` is a whole number string within [min, max].
 * Returns { value, error }: value is the parsed number (or null when
 * invalid), error is a user-facing message (or null when valid).
 */
export function validateWholeInRange(raw, min, max) {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  const error = `Enter a whole number from ${min} to ${max}.`;

  if (!/^\d+$/.test(trimmed)) {
    return { value: null, error };
  }

  const value = Number(trimmed);
  if (value < min || value > max) {
    return { value: null, error };
  }

  return { value, error: null };
}

export function rollDice(count, sides, faceSource = defaultFaceSource) {
  return Array.from({ length: count }, () => faceSource(sides));
}

export function sumOf(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** Roll N dM and return a history entry: { label, values, sum }. */
export function createRollEntry(count, sides, faceSource = defaultFaceSource) {
  const values = rollDice(count, sides, faceSource);
  return { label: `${count}d${sides}`, values, sum: sumOf(values) };
}

/** Prepend an entry to history (history is newest-first). */
export function addToHistory(history, entry) {
  return [entry, ...history];
}

export function runningTotal(history) {
  return history.reduce((total, entry) => total + entry.sum, 0);
}
