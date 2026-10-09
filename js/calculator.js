/**
 * Calculator logic — no eval(), uses an immediate-execution model:
 * stores previous operand + operator, applies them when a new operator or "=" is pressed.
 */
class Calculator {
  constructor(prevEl, currEl, onResult) {
    this.prevEl = prevEl;
    this.currEl = currEl;
    this.onResult = onResult; // callback for history
    this.clear();
  }

  clear() {
    this.current = "0";
    this.previous = null;
    this.operator = null;
    this.expression = "";
    this.resetNext = false; // true after "=" or an error: next digit starts fresh
    this.error = false;
    this.render();
  }

  delete() {
    if (this.error || this.resetNext === true) return this.clear();
    if (this.resetNext === "op") return; // nothing typed yet for the second number
    this.current = this.current.length > 1 ? this.current.slice(0, -1) : "0";
    if (this.current === "-") this.current = "0";
    this.render();
  }

  appendNumber(n) {
    if (this.error) this.clear();
    if (this.resetNext) { this.current = "0"; this.resetNext = false; this.expression = ""; }
    if (this.current.replace(/[-.]/g, "").length >= 15) return; // limit digits
    this.current = this.current === "0" ? n : this.current + n;
    this.render();
  }

  appendDecimal() {
    if (this.error) this.clear();
    if (this.resetNext) { this.current = "0"; this.resetNext = false; this.expression = ""; }
    if (this.current.includes(".")) return; // only one decimal point
    this.current += ".";
    this.render();
  }

  chooseOperator(op) {
    if (this.error) return;
    // Two operators in a row: replace the operator instead of calculating
    if (this.operator && this.resetNext === "op") {
      this.operator = op;
      this.expression = `${Calculator.format(this.previous)} ${op}`;
      return this.render();
    }
    if (this.operator !== null) {
      const result = this.compute();
      if (result === null) return;
      this.previous = result;
    } else {
      this.previous = parseFloat(this.current);
    }
    this.operator = op;
    this.expression = `${Calculator.format(this.previous)} ${op}`;
    this.current = String(this.previous);
    this.resetNext = "op";
    this.render();
  }

  // Override resetNext handling for digits typed after an operator
  startOperand() {
    if (this.resetNext === "op") { this.current = "0"; this.resetNext = false; }
  }

  compute() {
    const a = this.previous;
    const b = parseFloat(this.current);
    let r;
    switch (this.operator) {
      case "+": r = a + b; break;
      case "−": r = a - b; break;
      case "×": r = a * b; break;
      case "÷":
        if (b === 0) { this.showError("Cannot divide by 0"); return null; }
        r = a / b; break;
      default: return b;
    }
    return Calculator.clean(r);
  }

  equals() {
    if (this.error || this.operator === null || this.resetNext === "op") return;
    const b = parseFloat(this.current);
    const expr = `${Calculator.format(this.previous)} ${this.operator} ${Calculator.format(b)} =`;
    const result = this.compute();
    if (result === null) return;
    this.expression = expr;
    this.current = String(result);
    this.previous = null;
    this.operator = null;
    this.resetNext = true;
    this.render();
    this.onResult(expr, Calculator.format(result));
  }

  unary(type) {
    if (this.error) return;
    let x = parseFloat(this.current);
    let label;
    switch (type) {
      case "negate":
        if (this.current === "0") return;
        this.current = this.current.startsWith("-") ? this.current.slice(1) : "-" + this.current;
        if (this.resetNext === "op") this.resetNext = false;
        return this.render();
      case "percent":
        // With a pending + or −, % means "percent of previous" (e.g. 200 + 10% = 220)
        x = (this.operator === "+" || this.operator === "−") ? (this.previous * x) / 100 : x / 100;
        break;
      case "sqrt":
        if (x < 0) return this.showError("Invalid input");
        label = `√(${Calculator.format(x)})`;
        x = Math.sqrt(x);
        break;
      case "square":
        label = `(${Calculator.format(x)})²`;
        x = x * x;
        break;
    }
    x = Calculator.clean(x);
    this.current = String(x);
    if (label && this.operator === null) {
      this.expression = `${label} =`;
      this.onResult(this.expression, Calculator.format(x));
      this.resetNext = true;
    } else if (this.resetNext === "op") {
      this.resetNext = false;
    }
    this.render();
  }

  showError(msg) {
    this.error = true;
    this.current = msg;
    this.expression = "";
    this.previous = null;
    this.operator = null;
    this.render();
  }

  // Fix floating-point noise: 0.1 + 0.2 -> 0.3
  static clean(n) {
    return parseFloat(n.toPrecision(12));
  }

  // Pretty-print numbers; switch to exponential for very large/small values
  static format(n) {
    if (typeof n === "string") n = parseFloat(n);
    if (!isFinite(n)) return "Error";
    const abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) return n.toExponential(6);
    return n.toLocaleString("en-US", { maximumFractionDigits: 10 });
  }

  render() {
    this.currEl.classList.toggle("error", this.error);
    if (this.error) {
      this.currEl.textContent = this.current;
    } else {
      // Keep a trailing "." or trailing zeros visible while typing
      const [int, dec] = this.current.split(".");
      const intFormatted = int === "-" ? "-" : Calculator.format(int === "" ? "0" : int);
      const negZero = int === "-0" ? "-0" : intFormatted;
      this.currEl.textContent = dec !== undefined ? `${negZero}.${dec}` : Calculator.format(this.current);
    }
    this.prevEl.textContent = this.expression;
  }
}

/* ---------- History (saved in localStorage) ---------- */
const HISTORY_KEY = "calc-history";
const historyList = document.getElementById("historyList");

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveHistory(items) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)); } catch {}
}
function renderHistory() {
  const items = loadHistory();
  historyList.innerHTML = "";
  if (items.length === 0) {
    historyList.innerHTML = '<li class="empty">No calculations yet</li>';
    return;
  }
  items.forEach(({ expr, result }) => {
    const li = document.createElement("li");
    li.innerHTML = `<div class="h-expr"></div><div class="h-result"></div>`;
    li.querySelector(".h-expr").textContent = expr;
    li.querySelector(".h-result").textContent = result;
    li.title = "Click to reuse this result";
    li.addEventListener("click", () => {
      calc.clear();
      calc.current = result.replace(/,/g, "");
      calc.resetNext = true;
      calc.render();
    });
    historyList.appendChild(li);
  });
}
function addToHistory(expr, result) {
  const items = loadHistory();
  items.unshift({ expr, result });
  saveHistory(items.slice(0, 10)); // keep last 10
  renderHistory();
}
document.getElementById("clearHistory").addEventListener("click", () => {
  saveHistory([]);
  renderHistory();
});

/* ---------- Wire up calculator ---------- */
const calc = new Calculator(
  document.getElementById("previous"),
  document.getElementById("current"),
  addToHistory
);

function handleNumber(n) { calc.startOperand(); calc.appendNumber(n); }
function handleDecimal() { calc.startOperand(); calc.appendDecimal(); }

document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const { number, operator, action } = btn.dataset;
  if (number !== undefined) handleNumber(number);
  else if (operator) calc.chooseOperator(operator);
  else if (action === "decimal") handleDecimal();
  else if (action === "equals") calc.equals();
  else if (action === "clear") calc.clear();
  else if (action === "delete") calc.delete();
  else calc.unary(action); // percent, sqrt, square, negate
});

/* ---------- Keyboard support ---------- */
const keyMap = { "+": "+", "-": "−", "*": "×", "x": "×", "/": "÷" };
document.addEventListener("keydown", (e) => {
  let selector = null;
  if (/^[0-9]$/.test(e.key)) { handleNumber(e.key); selector = `[data-number="${e.key}"]`; }
  else if (e.key === "." || e.key === ",") { handleDecimal(); selector = '[data-action="decimal"]'; }
  else if (keyMap[e.key]) { calc.chooseOperator(keyMap[e.key]); selector = `[data-operator="${keyMap[e.key]}"]`; }
  else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); calc.equals(); selector = '[data-action="equals"]'; }
  else if (e.key === "Backspace") { calc.delete(); selector = '[data-action="delete"]'; }
  else if (e.key === "Escape" || e.key === "Delete") { calc.clear(); selector = '[data-action="clear"]'; }
  else if (e.key === "%") { calc.unary("percent"); selector = '[data-action="percent"]'; }
  else return;

  // Visual feedback on the matching on-screen button
  const btn = document.querySelector(`.keys ${selector}`);
  if (btn) {
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 120);
  }
});

/* ---------- Theme toggle (remembered) ---------- */
const themeBtn = document.getElementById("themeToggle");
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
}
let savedTheme = null;
try { savedTheme = localStorage.getItem("calc-theme"); } catch {}
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("calc-theme", next); } catch {}
});

renderHistory();
