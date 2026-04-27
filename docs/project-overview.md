# Calcify – Project Overview

## Purpose
Calcify is a single-page web calculator application built entirely with vanilla web technologies (HTML5, CSS3, JavaScript ES6+). It demonstrates modern UI/UX patterns without any frameworks or build tools.

---

## Architecture

### Data Flow
```
User input (click / keypress)
         │
         ▼
  Calculator.handle(action)          ← single entry point
         │
         ├─► inputDigit()            ← mutates state.displayValue
         ├─► inputOperator()         ← stores operand + operator
         ├─► evaluate()              ← runs compute(), saves history
         ├─► clearAll() / negate() / percent()
         │
         ▼
      commit()                       ← calls Display.update(state)
         │
         ▼
  Display.update(state)              ← updates DOM (main value, expr line, dots)
```

### State Machine
The calculator tracks 8 state fields:

| Field | Type | Description |
|---|---|---|
| `displayValue` | string | Number currently shown on main line |
| `expression` | string | Running expression shown on the secondary line |
| `operand` | number\|null | Stored left-hand value |
| `operator` | string\|null | Pending operator symbol |
| `waitingForRHS` | boolean | True after an operator is pressed |
| `justEvaluated` | boolean | True after `=` is pressed |
| `hasOperator` | boolean | Controls indicator dot visibility |
| `error` | boolean | True in error state |

### Module Responsibilities

| File | Role |
|---|---|
| `config/settings.js` | All tuneable constants — change behavior here |
| `js/utils.js` | Pure functions: `formatNumber`, `safeEval`, `debounce`, `flashClass` |
| `components/display.js` | Renders display HTML; updates DOM from state |
| `components/buttons.js` | Declarative button map → DOM; delegated click handler |
| `js/calculator.js` | State machine, arithmetic, history, boot sequence |
| `js/keyboard.js` | Key → action mapping; throttling; visual mirror |
| `css/style.css` | Design tokens (CSS custom properties), all component styles |
| `css/layout.css` | CSS Grid layout for button pad |
| `css/responsive.css` | Media queries for all breakpoints |

---

## Key Design Decisions

### No `eval()`
The expression parser (`safeEval` in `utils.js`) is a hand-written recursive descent parser. It handles operator precedence correctly (`2 + 3 * 4 = 14`) and only permits the characters `0-9 + - * / ( ) . %` — eliminating code injection risk entirely.

### Floating-Point Safety
All computed results are passed through `parseFloat(result.toPrecision(12))` to eliminate classic floating-point artifacts like `0.1 + 0.2 = 0.30000000000000004`.

### Component Isolation
Each component (`Display`, `Buttons`) exposes only the methods needed by `Calculator`. Internal helpers remain inside IIFEs, preventing global namespace pollution.

### Accessibility
- All interactive elements have `aria-label`
- Display uses `role="status"` / `aria-live="assertive"` for screen reader announcements
- All focus states use `focus-visible` (keyboard only, not mouse)
- `prefers-reduced-motion` disables all CSS animations
- `forced-colors` media query provides high-contrast mode support

### History Persistence
History is saved to `localStorage` using the key defined in `settings.js` (`calcify_history`). On page load, `loadHistory()` restores it. The maximum entry count is also configurable (`MAX_HISTORY`).

---

## Extension Ideas
- Scientific mode (sin, cos, log, sqrt)
- Unit converter panel
- Dark/light theme toggle
- PWA (offline support via Service Worker)
- Localization (swap decimal/thousands separator per locale)
