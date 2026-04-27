# ⬡ Calcify – Elegant Web Calculator

> A beautiful, glassmorphism-styled web calculator built with pure **HTML5**, **CSS3**, and **JavaScript ES6+** — no frameworks, no build tools, just the web.

---

## 📸 Preview

![Calcify Calculator UI](frontend/assets/images/calculator-bg.png)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔢 **Basic arithmetic** | Addition, subtraction, multiplication, division |
| 🔗 **Chained operations** | `5 + 3 × 2` computed with correct precedence |
| 🎯 **Floating-point safety** | `0.1 + 0.2 = 0.3` (no artifacts) |
| 📜 **History panel** | Last 20 calculations, click any to restore |
| 💾 **Persistent history** | Saved in `localStorage` across sessions |
| ⌨️ **Full keyboard support** | All keys mapped with visual button feedback |
| 📱 **Fully responsive** | Works on 320px phones to 4K desktops |
| ♿ **Accessible** | ARIA labels, live regions, focus-visible, high-contrast mode |
| 🎨 **Glassmorphism UI** | Dark theme, animated gradient orbs, micro-animations |
| 🧪 **30 unit tests** | Zero external dependencies — pure Node.js |

---

## 📁 Project Structure

```
calculator-web-app/
│
├── frontend/                         (Client Side)
│   ├── index.html                    (Main calculator UI)
│   │
│   ├── css/
│   │   ├── style.css                 (Design tokens, components, animations)
│   │   ├── layout.css                (CSS Grid button layout)
│   │   └── responsive.css            (All breakpoints + reduced-motion)
│   │
│   ├── js/
│   │   ├── calculator.js             (Core state machine & arithmetic engine)
│   │   ├── keyboard.js               (Keyboard support)
│   │   └── utils.js                  (Pure helper functions – no DOM)
│   │
│   ├── components/
│   │   ├── buttons.js                (Button grid renderer)
│   │   └── display.js                (Calculator display logic)
│   │
│   ├── assets/
│   │   ├── icons/
│   │   │   ├── plus.svg
│   │   │   ├── minus.svg
│   │   │   ├── multiply.svg
│   │   │   └── divide.svg
│   │   └── images/
│   │       └── calculator-bg.png
│   │
│   └── config/
│       └── settings.js               (App configuration constants)
│
├── tests/
│   └── calculator.test.js            (Unit tests – run with Node.js)
│
├── docs/
│   └── project-overview.md           (Architecture documentation)
│
├── README.md
├── package.json
└── .gitignore
```

---

## 🚀 Getting Started

### Option 1 – Open directly in browser
No setup needed. Just open the file:
```
frontend/index.html
```
Double-click it or drag it into any modern browser.

### Option 2 – Serve locally (recommended)
```bash
npm start
# Serves at http://localhost:3000
```

---

## 🧪 Running Tests

```bash
npm test
# or directly:
node tests/calculator.test.js
```

All **30 tests** run with **zero external dependencies** — pure Node.js.

**Test suites:**
- ✅ Basic arithmetic (`compute()`)
- ✅ Expression parser (`safeEval()`)
- ✅ Number formatting (`formatNumber()`)
- ✅ Edge cases (division by zero, Infinity, overflow)

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `0` – `9` | Digit input |
| `.` or `,` | Decimal point |
| `+` `-` `*` `/` | Operators |
| `Enter` or `=` | Evaluate (equals) |
| `Backspace` | Delete last digit |
| `Esc` or `Delete` | Clear all (AC) |
| `n` | Toggle negative (±) |
| `p` | Percent (%) |
| `h` | Toggle history panel |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Accent violet | `#7c6af7` | Equals button, highlights |
| Accent pink | `#f472b6` | Background orb |
| Operator amber | `#f59e0b` | All operator buttons |
| Error red | `#ef4444` | AC button, error state |
| UI font | Inter | All labels and text |
| Number font | JetBrains Mono | Display values |

---

## 🏗️ Architecture

### How it works

```
User input (click or keypress)
        │
        ▼
Calculator.handle(action)      ← single entry point
        │
        ├─► inputDigit()       ← updates displayValue
        ├─► inputOperator()    ← stores operand + operator
        ├─► evaluate()         ← runs compute(), saves history
        └─► clearAll() / negate() / percent()
                │
                ▼
            commit()           ← calls Display.update(state)
                │
                ▼
        Display.update(state)  ← updates the DOM
```

### Key design decisions

- **No `eval()`** — expressions are parsed with a hand-written recursive descent parser, safe from code injection.
- **Floating-point safety** — results run through `toPrecision(12)` to eliminate rounding artifacts.
- **IIFE modules** — each component is wrapped in an IIFE to avoid global namespace pollution.
- **Single state object** — all calculator state lives in one place, making the logic easy to follow and test.

---

## 🛠️ Configuration

All tuneable constants live in `frontend/config/settings.js`:

```js
const SETTINGS = {
  MAX_DIGITS: 12,         // max digits before blocking input
  MAX_HISTORY: 20,        // number of history entries to keep
  PERSIST_HISTORY: true,  // save history in localStorage
  DECIMAL_SEP: '.',       // change to ',' for European locales
  THOUSANDS_SEP: ',',     // separator for display formatting
  // ...
};
```
PROJECT DEPLOYED ON : https://new-dynamic-calculator.netlify.app/
---


