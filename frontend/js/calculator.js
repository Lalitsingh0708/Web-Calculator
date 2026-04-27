/**
 * calculator.js – Core calculator logic (main engine)
 *
 * Manages application state and exposes Calculator.handle(action)
 * which is the single entry point for all button presses and
 * keyboard events.
 *
 * State shape:
 * {
 *   displayValue  : string  – what is shown on the main line
 *   expression    : string  – running expression shown on secondary line
 *   operand       : number  – stored left-hand operand
 *   operator      : string|null – pending operator (+, -, *, /)
 *   waitingForRHS : boolean – if true, next digit starts a new number
 *   justEvaluated : boolean – true right after pressing =
 *   hasOperator   : boolean – operator has been selected
 *   error         : boolean – error state
 * }
 */

(function CalculatorEngine() {

  /* ---- Initial state ---- */
  const initialState = () => ({
    displayValue:  '0',
    expression:    '',
    operand:       null,
    operator:      null,
    waitingForRHS: false,
    justEvaluated: false,
    hasOperator:   false,
    error:         false,
  });

  let state = initialState();

  // history array  
  let history = loadHistory();


  function handle(action) {
    if (state.error && action !== 'clear-all') {
      // Any action other than AC in error state shakes the display
      Display.animateShake();
      return;
    }

    // Digit input
    if (action.startsWith('digit-')) {
      const digit = action.replace('digit-', '');
      inputDigit(digit);
      return;
    }

    // Operator input
    if (action.startsWith('operator-')) {
      const op = action.replace('operator-', '');
      inputOperator(op);
      return;
    }

    // Named actions
    switch (action) {
      case 'clear-all':     clearAll();      break;
      case 'decimal':       inputDecimal();  break;
      case 'equals':        evaluate();      break;
      case 'negate':        negate();        break;
      case 'percent':       percent();       break;
      case 'toggle-history':    toggleHistory();    break;
      case 'backspace-internal': backspace();        break;
      default:
        console.warn('Unknown action:', action);
    }
  }



  function inputDigit(digit) {
    // Enforce max digit count
    if (state.displayValue.replace(/[^0-9]/g, '').length >= SETTINGS.MAX_DIGITS && !state.waitingForRHS) {
      Display.animateShake();
      return;
    }

    if (state.waitingForRHS || state.justEvaluated) {
      // Start fresh number on RHS
      state.displayValue  = digit === '0' ? '0' : digit;
      state.waitingForRHS = false;
      state.justEvaluated = false;
    } else {
      // Append digit (replace leading zero)
      state.displayValue = state.displayValue === '0' ? digit : state.displayValue + digit;
    }

    Display.animatePop();
    commit();
  }

  function inputDecimal() {
    if (state.waitingForRHS || state.justEvaluated) {
      state.displayValue  = '0.';
      state.waitingForRHS = false;
      state.justEvaluated = false;
      commit();
      return;
    }
    if (state.displayValue.includes('.')) return; // already has decimal
    state.displayValue += '.';
    commit();
  }

  function inputOperator(op) {
    const current = parseFloat(state.displayValue);

    if (state.operator && !state.waitingForRHS) {
      // Chained operation: compute intermediate result first
      const result = compute(state.operand, state.operator, current);
      if (result === null) { showError(); return; }
      state.displayValue = String(result);
      state.operand      = result;
      state.expression   = `${formatNumber(result)} ${opSymbol(op)}`;
    } else {
      state.operand    = state.justEvaluated ? parseFloat(state.displayValue) : current;
      state.expression = `${formatNumber(state.operand)} ${opSymbol(op)}`;
    }

    state.operator      = op;
    state.waitingForRHS = true;
    state.justEvaluated = false;
    state.hasOperator   = true;
    commit();
  }

  function evaluate() {
    if (state.operator === null || state.waitingForRHS) return;

    const rhs    = parseFloat(state.displayValue);
    const result = compute(state.operand, state.operator, rhs);
    if (result === null) { showError(); return; }

    const expr = `${formatNumber(state.operand)} ${opSymbol(state.operator)} ${formatNumber(rhs)} =`;
    addHistory(expr, result);

    state.expression    = expr;
    state.displayValue  = String(result);
    state.operand       = null;
    state.operator      = null;
    state.waitingForRHS = false;
    state.justEvaluated = true;
    state.hasOperator   = false;

    Display.animatePop();
    commit();
  }

  function clearAll() {
    state = initialState();
    commit();
  }

  function negate() {
    if (state.displayValue === '0' || state.error) return;
    const num = parseFloat(state.displayValue);
    state.displayValue = String(-num);
    commit();
  }

  function percent() {
    if (state.error) return;
    const num = parseFloat(state.displayValue);
    state.displayValue = String(num / 100);
    commit();
  }

  function backspace() {
    if (state.waitingForRHS || state.justEvaluated) return;
    if (state.displayValue.length <= 1 || state.displayValue === '0') {
      state.displayValue = '0';
    } else {
      state.displayValue = state.displayValue.slice(0, -1);
      if (state.displayValue === '-') state.displayValue = '0';
    }
    commit();
  }

  function toggleHistory() {
    const panel = document.getElementById('history-panel');
    if (!panel) return;
    panel.classList.toggle('open');
  }

  function compute(a, op, b) {
    let result;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/':
        if (b === 0) return null;
        result = a / b;
        break;
      default: return null;
    }
    if (!isFinite(result)) return null;

    // Avoid floating-point artifacts (e.g. 0.1 + 0.2)
    return parseFloat(result.toPrecision(12));
  }

// manage history here 
  function addHistory(expr, result) {
    const entry = { expr, result };
    history.unshift(entry);
    if (history.length > SETTINGS.MAX_HISTORY) history.pop();
    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;

    list.innerHTML = '';

    if (history.length === 0) {
      list.innerHTML = '<li class="history-empty">No calculations yet.</li>';
      return;
    }

    history.forEach((entry) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'listitem');
      li.setAttribute('title', 'Click to restore result');
      li.innerHTML = `
        <span class="history-expr">${clampString(entry.expr, 30)}</span>
        <span class="history-res">${formatNumber(entry.result)}</span>
      `;

      // Click on history entry restores result to display
      li.addEventListener('click', () => {
        state.displayValue  = String(entry.result);
        state.justEvaluated = true;
        state.hasOperator   = false;
        state.operator      = null;
        state.operand       = null;
        state.expression    = entry.expr;
        commit();
        // Close history panel
        document.getElementById('history-panel')?.classList.remove('open');
      });

      list.appendChild(li);
    });
  }

  function loadHistory() {
    if (!SETTINGS.PERSIST_HISTORY) return [];
    try {
      const raw = localStorage.getItem(SETTINGS.HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveHistory() {
    if (!SETTINGS.PERSIST_HISTORY) return;
    try {
      localStorage.setItem(SETTINGS.HISTORY_KEY, JSON.stringify(history));
    } catch { /* storage quota or private mode – silently ignore */ }
  }

  /* Clear history button */
  function bindHistoryClear() {
    document.getElementById('history-clear-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      history = [];
      saveHistory();
      renderHistory();
    });
  }


  function opSymbol(op) {
    return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op;
  }

  function showError() {
    state.displayValue = 'Error';
    state.expression   = '';
    state.error        = true;
    Display.animateShake();
    commit();
  }

  /** Push state to display */
  function commit() {
    Display.update(state);
  }


  function init() {
    console.log(`%cCalcify v${SETTINGS.VERSION}`, 'color:#7c6af7;font-weight:700;font-size:14px');

    // Render components
    Display.render();
    Buttons.render();

    // Initial display
    commit();

    // Render persisted history
    renderHistory();

    // Wire up history clear button
    bindHistoryClear();
  }

  // Boot when DOM is ready
  document.addEventListener('DOMContentLoaded', init);

  /* Expose public handle function */
  window.Calculator = { handle };
})();
