/**
 * display.js – Calculator display component
 *
 * Responsible for:
 *  - Rendering the display HTML into #calculator-display
 *  - Updating the main value and expression line
 *  - Adjusting font size to fit long numbers
 *  - Running error / pop-in animations
 *  - Showing indicator dots (active operator, equals)
 */

(function DisplayComponent() {
  /* ---- DOM references ---- */
  let elMain, elExpr, elDotOp, elDotEq;

  /**
   * Build and inject the display HTML into the page.
   * Called once on startup by calculator.js.
   */
  function render() {
    const container = document.getElementById('calculator-display');
    if (!container) return;

    container.innerHTML = `
      <div class="display-panel" id="display-panel" aria-label="Calculator display">
        <!-- Status indicator dots -->
        <div class="display-indicator" aria-hidden="true">
          <span class="ind-dot op" id="ind-op"   title="Operator active"></span>
          <span class="ind-dot eq" id="ind-eq"   title="Result shown"></span>
        </div>

        <!-- Secondary line: running expression -->
        <div class="display-expr"
             id="display-expr"
             aria-label="Current expression"
             aria-live="polite">
        </div>

        <!-- Primary line: current number -->
        <div class="display-main"
             id="display-main"
             role="status"
             aria-label="Display value"
             aria-live="assertive">
          0
        </div>
      </div>
    `;

    // Cache references
    elMain  = document.getElementById('display-main');
    elExpr  = document.getElementById('display-expr');
    elDotOp = document.getElementById('ind-op');
    elDotEq = document.getElementById('ind-eq');
  }

  /**
   * Update the display with new values from calculator state.
   *
   * @param {Object} state
   * @param {string}  state.displayValue   - Number string to show on main line
   * @param {string}  state.expression     - Running expression string (top line)
   * @param {boolean} state.hasOperator    - Whether an operator has been pressed
   * @param {boolean} state.justEvaluated  - Whether = was just pressed
   * @param {boolean} [state.error]        - True when displaying an error
   */
  function update(state) {
    if (!elMain) return; // not rendered yet

    const rawVal  = state.displayValue;
    const display = state.error ? rawVal : formatNumber(rawVal);

    /* -- Main value -- */
    elMain.textContent = display;

    // Adjust font size based on length
    elMain.classList.remove('small', 'xsmall', 'error');
    if (state.error) {
      elMain.classList.add('error');
    } else if (display.length > 14) {
      elMain.classList.add('xsmall');
    } else if (display.length > 9) {
      elMain.classList.add('small');
    }

    /* -- Expression line -- */
    elExpr.textContent = clampString(state.expression || '', SETTINGS.MAX_EXPR_LENGTH);

    /* -- Indicator dots -- */
    elDotOp.classList.toggle('active', !!state.hasOperator && !state.justEvaluated);
    elDotEq.classList.toggle('active', !!state.justEvaluated);
  }

  /**
   * Trigger the pop-in animation on the main display number.
   * Called whenever a digit is appended.
   */
  function animatePop() {
    if (!elMain) return;
    flashClass(elMain, 'pop', SETTINGS.ANIM_POP_MS);
  }

  /**
   * Trigger the shake animation (error feedback).
   */
  function animateShake() {
    const panel = document.getElementById('display-panel');
    if (!panel) return;
    flashClass(panel, 'shake', SETTINGS.ANIM_SHAKE_MS);
  }

  /* Expose to global scope so calculator.js can call these */
  window.Display = { render, update, animatePop, animateShake };
})();
