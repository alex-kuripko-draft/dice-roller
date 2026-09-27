import assert from "node:assert/strict";
import test from "node:test";

import {
  COUNT_LIMITS,
  SIDES_LIMITS,
  addToHistory,
  createRollEntry,
  defaultFaceSource,
  rollDice,
  runningTotal,
  sumOf,
  validateWholeInRange,
} from "../src/dice.js";

// Stubbed face source: returns the next value from a fixed queue, ignoring
// the requested `sides` — mirrors "a stubbed random source that returns the
// listed faces" from the CP-7 examples table.
function stubFaces(faces) {
  let index = 0;
  return () => {
    assert.ok(index < faces.length, "stub face source exhausted");
    return faces[index++];
  };
}

test("examples table: sequence of rolls builds history and running total", () => {
  let history = [];

  // N=2, M=6, faces 3,5 -> 2d6: 3, 5 = 8
  let entry = createRollEntry(2, 6, stubFaces([3, 5]));
  assert.equal(entry.label, "2d6");
  assert.deepEqual(entry.values, [3, 5]);
  assert.equal(entry.sum, 8);
  history = addToHistory(history, entry);
  assert.deepEqual(history.map((e) => e.label), ["2d6"]);
  assert.equal(runningTotal(history), 8);

  // then N=1, M=20, face 17 -> 1d20: 17 = 17
  entry = createRollEntry(1, 20, stubFaces([17]));
  assert.equal(entry.label, "1d20");
  assert.deepEqual(entry.values, [17]);
  assert.equal(entry.sum, 17);
  history = addToHistory(history, entry);
  assert.deepEqual(history.map((e) => e.label), ["1d20", "2d6"]);
  assert.equal(runningTotal(history), 25);

  // then N=3, M=4, faces 1,4,2 -> 3d4: 1, 4, 2 = 7
  entry = createRollEntry(3, 4, stubFaces([1, 4, 2]));
  assert.equal(entry.label, "3d4");
  assert.deepEqual(entry.values, [1, 4, 2]);
  assert.equal(entry.sum, 7);
  history = addToHistory(history, entry);
  assert.deepEqual(history.map((e) => e.label), ["3d4", "1d20", "2d6"]);
  assert.equal(runningTotal(history), 32);

  // then Clear history -> empty, total 0
  history = [];
  assert.deepEqual(history, []);
  assert.equal(runningTotal(history), 0);
});

test("examples table: N=20, M=100 produces 20 values and their sum", () => {
  const faces = Array.from({ length: 20 }, (_, i) => (i % 100) + 1);
  const entry = createRollEntry(20, 100, stubFaces(faces));
  assert.equal(entry.label, "20d100");
  assert.equal(entry.values.length, 20);
  assert.equal(entry.sum, sumOf(faces));
  const history = addToHistory([], entry);
  assert.equal(history.length, 1);
  assert.equal(runningTotal(history), entry.sum);
});

test("examples table: N=1, M=2 face 1 -> 1d2: 1 = 1", () => {
  const entry = createRollEntry(1, 2, stubFaces([1]));
  assert.equal(entry.label, "1d2");
  assert.deepEqual(entry.values, [1]);
  assert.equal(entry.sum, 1);
});

test("boundary values are accepted: N=1, N=20, M=2, M=100", () => {
  assert.equal(validateWholeInRange("1", COUNT_LIMITS.min, COUNT_LIMITS.max).value, 1);
  assert.equal(validateWholeInRange("20", COUNT_LIMITS.min, COUNT_LIMITS.max).value, 20);
  assert.equal(validateWholeInRange("2", SIDES_LIMITS.min, SIDES_LIMITS.max).value, 2);
  assert.equal(validateWholeInRange("100", SIDES_LIMITS.min, SIDES_LIMITS.max).value, 100);
});

test("examples table: invalid N values fail validation with no roll", () => {
  for (const raw of ["0", "21", "2.5", "", "abc"]) {
    const { value, error } = validateWholeInRange(raw, COUNT_LIMITS.min, COUNT_LIMITS.max);
    assert.equal(value, null, `expected N=${JSON.stringify(raw)} to be invalid`);
    assert.ok(error, `expected an error message for N=${JSON.stringify(raw)}`);
  }
});

test("examples table: invalid M values fail validation with no roll", () => {
  for (const raw of ["1", "101", "6.5", "", "abc"]) {
    const { value, error } = validateWholeInRange(raw, SIDES_LIMITS.min, SIDES_LIMITS.max);
    assert.equal(value, null, `expected M=${JSON.stringify(raw)} to be invalid`);
    assert.ok(error, `expected an error message for M=${JSON.stringify(raw)}`);
  }
});

test("valid whole numbers within range pass validation", () => {
  const { value, error } = validateWholeInRange("6", SIDES_LIMITS.min, SIDES_LIMITS.max);
  assert.equal(value, 6);
  assert.equal(error, null);
});

test("sumOf sums an arbitrary list of values, including an empty list", () => {
  assert.equal(sumOf([]), 0);
  assert.equal(sumOf([1, 2, 3]), 6);
});

test("runningTotal is 0 for an empty history", () => {
  assert.equal(runningTotal([]), 0);
});

test("real random source: many rolls stay within 1..M", () => {
  for (let i = 0; i < 500; i++) {
    const sides = 1 + (i % 100) + 1; // varies 2..101, clamp below
    const clampedSides = Math.min(sides, 100);
    const [value] = rollDice(1, clampedSides, defaultFaceSource);
    assert.ok(Number.isInteger(value), "value must be a whole number");
    assert.ok(value >= 1 && value <= clampedSides, `value ${value} out of range 1..${clampedSides}`);
  }
});
