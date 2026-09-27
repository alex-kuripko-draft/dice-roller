// Design prototype only. Mirrors the CP-7 acceptance criteria closely enough
// to demonstrate the UI states, but is not the unit-tested production
// implementation — the Developer owns that in src/.

const form = document.getElementById("roll-form");
const countInput = document.getElementById("dice-count");
const countError = document.getElementById("dice-count-error");
const sidesInput = document.getElementById("dice-sides");
const sidesError = document.getElementById("dice-sides-error");

const resultEmpty = document.getElementById("result-empty");
const resultLatest = document.getElementById("result-latest");
const latestLabel = document.getElementById("latest-label");
const latestDice = document.getElementById("latest-dice");
const latestSum = document.getElementById("latest-sum");

const runningTotalEl = document.getElementById("running-total");
const historyEmpty = document.getElementById("history-empty");
const historyList = document.getElementById("history-list");
const clearBtn = document.getElementById("clear-btn");

const COUNT_MIN = 1;
const COUNT_MAX = 20;
const SIDES_MIN = 2;
const SIDES_MAX = 100;

let history = [];

function parseWholeInRange(raw, min, max, label) {
  const value = raw.trim();
  if (value === "" || !/^\d+$/.test(value)) {
    return { value: null, message: `Enter a whole number from ${min} to ${max}.` };
  }
  const n = Number(value);
  if (n < min || n > max) {
    return { value: null, message: `Enter a whole number from ${min} to ${max}.` };
  }
  return { value: n, message: null };
}

function setError(input, el, message) {
  if (message) {
    el.textContent = message;
    el.hidden = false;
    input.setAttribute("aria-invalid", "true");
  } else {
    el.textContent = "";
    el.hidden = true;
    input.removeAttribute("aria-invalid");
  }
}

function validateCount() {
  const { value, message } = parseWholeInRange(countInput.value, COUNT_MIN, COUNT_MAX);
  setError(countInput, countError, message);
  return value;
}

function validateSides() {
  const { value, message } = parseWholeInRange(sidesInput.value, SIDES_MIN, SIDES_MAX);
  setError(sidesInput, sidesError, message);
  return value;
}

function rollDie(sides) {
  return 1 + Math.floor(Math.random() * sides);
}

function rollDice(count, sides) {
  return Array.from({ length: count }, () => rollDie(sides));
}

function sumOf(values) {
  return values.reduce((total, value) => total + value, 0);
}

function renderLatest(label, values, sum) {
  resultEmpty.hidden = true;
  resultLatest.hidden = false;
  latestLabel.textContent = label;
  latestSum.textContent = String(sum);
  latestDice.innerHTML = "";
  values.forEach((value) => {
    const die = document.createElement("span");
    die.className = "tray__die";
    die.textContent = String(value);
    latestDice.append(die);
  });
}

function renderHistory() {
  if (history.length === 0) {
    historyEmpty.hidden = false;
    historyList.hidden = true;
    historyList.innerHTML = "";
    clearBtn.disabled = true;
    runningTotalEl.textContent = "0";
    return;
  }

  historyEmpty.hidden = true;
  historyList.hidden = false;
  clearBtn.disabled = false;

  historyList.innerHTML = "";
  history.forEach((entry) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.className = "tray__history-label";
    label.textContent = entry.label;
    const values = document.createElement("span");
    values.className = "tray__history-values";
    values.textContent = entry.values.join(", ");
    const sum = document.createElement("span");
    sum.className = "tray__history-sum";
    sum.textContent = `= ${entry.sum}`;
    li.append(label, values, sum);
    historyList.append(li);
  });

  const runningTotal = history.reduce((total, entry) => total + entry.sum, 0);
  runningTotalEl.textContent = String(runningTotal);
}

countInput.addEventListener("input", validateCount);
sidesInput.addEventListener("input", validateSides);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const count = validateCount();
  const sides = validateSides();
  if (count === null || sides === null) return;

  const values = rollDice(count, sides);
  const sum = sumOf(values);
  const label = `${count}d${sides}`;

  renderLatest(label, values, sum);
  history.unshift({ label, values, sum });
  renderHistory();
});

clearBtn.addEventListener("click", () => {
  history = [];
  resultEmpty.hidden = false;
  resultLatest.hidden = true;
  renderHistory();
});

renderHistory();
