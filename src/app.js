import {
  COUNT_LIMITS,
  SIDES_LIMITS,
  addToHistory,
  createRollEntry,
  runningTotal,
  validateWholeInRange,
} from "./dice.js";

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

let history = [];

function setFieldError(input, errorEl, message) {
  if (message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    input.setAttribute("aria-invalid", "true");
  } else {
    errorEl.textContent = "";
    errorEl.hidden = true;
    input.removeAttribute("aria-invalid");
  }
}

function validateCount() {
  const { value, error } = validateWholeInRange(countInput.value, COUNT_LIMITS.min, COUNT_LIMITS.max);
  setFieldError(countInput, countError, error);
  return value;
}

function validateSides() {
  const { value, error } = validateWholeInRange(sidesInput.value, SIDES_LIMITS.min, SIDES_LIMITS.max);
  setFieldError(sidesInput, sidesError, error);
  return value;
}

function renderLatest(entry) {
  resultEmpty.hidden = true;
  resultLatest.hidden = false;
  latestLabel.textContent = entry.label;
  latestSum.textContent = String(entry.sum);
  latestDice.innerHTML = "";
  entry.values.forEach((value) => {
    const die = document.createElement("span");
    die.className = "tray__die";
    die.textContent = String(value);
    latestDice.append(die);
  });
}

function renderEmptyLatest() {
  resultEmpty.hidden = false;
  resultLatest.hidden = true;
  latestDice.innerHTML = "";
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

  runningTotalEl.textContent = String(runningTotal(history));
}

countInput.addEventListener("input", validateCount);
sidesInput.addEventListener("input", validateSides);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const count = validateCount();
  const sides = validateSides();
  if (count === null || sides === null) return;

  const entry = createRollEntry(count, sides);
  renderLatest(entry);
  history = addToHistory(history, entry);
  renderHistory();
});

clearBtn.addEventListener("click", () => {
  history = [];
  renderEmptyLatest();
  renderHistory();
});

renderHistory();
