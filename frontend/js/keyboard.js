/**
 * keyboard.js – Full keyboard support for the calculator
 *
 * Maps physical keyboard keys to calculator actions and
 * mirrors the visual button-press animation via Buttons.highlightButton().
 *
 * Key mapping:
 *   0–9         → digit input
 *   . or ,      → decimal point
 *   + - * /     → operators
 *   Enter or =  → evaluate
 *   Backspace   → backspace (delete last digit)
 *   Delete/Esc  → clear all (AC)
 *   n           → negate (±)
 *   p           → percent (%)
 *   h or H      → toggle history panel
 */

(function KeyboardSupport() {

  /**
   * Map from KeyboardEvent.key → calculator action string.
   */
  const KEY_ACTION_MAP = {
    '0': 'digit-0',
    '1': 'digit-1',
    '2': 'digit-2',
    '3': 'digit-3',
    '4': 'digit-4',
    '5': 'digit-5',
    '6': 'digit-6',
    '7': 'digit-7',
    '8': 'digit-8',
    '9': 'digit-9',

    '.':     'decimal',
    ',':     'decimal',     // European keyboard convenience

    '+':     'operator-+',
    '-':     'operator--',
    '*':     'operator-*',
    '/':     'operator-/',
    'x':     'operator-*', // common shorthand

    'Enter':  'equals',
    '=':      'equals',

    'Escape':  'clear-all',
    'Delete':  'clear-all',

    'Backspace': 'backspace',

    'n':  'negate',
    'N':  'negate',
    'p':  'percent',
    'P':  'percent',
    'h':  'toggle-history',
    'H':  'toggle-history',
  };

  /**
   * Handle backspace: remove the last character from displayValue.
   * This action lives here rather than in calculator.js because it
   * is keyboard-only – there is no backspace button on the pad.
   */
  function handleBackspace() {
    // Reach into Calculator state through the display element
    const el = document.getElementById('display-main');
    if (!el) return;

    const current = el.textContent.replace(/,/g, ''); // strip thousands separator
    if (current === 'Error' || current === '0') {
      Calculator.handle('clear-all');
      return;
    }

    // Simulate direct state mutation via a custom action routed through Calculator
    Calculator.handle('backspace-internal'); // handled below
  }

  /**
   * Throttle repeated key events when a key is held down.
   */
  let lastKey = null;
  let lastTime = 0;

  function onKeyDown(e) {
    // Ignore key events when focus is inside an input / textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    const now = Date.now();

    // Simple throttle for held keys
    if (e.key === lastKey && now - lastTime < SETTINGS.KEY_REPEAT_DELAY) return;
    lastKey  = e.key;
    lastTime = now;

    const action = KEY_ACTION_MAP[e.key];
    if (!action) return;

    // Prevent browser default (e.g. '/' opening quick-find in Firefox)
    e.preventDefault();

    if (action === 'backspace') {
      handleBackspace();
      Buttons.highlightButton('clear-all'); // nearest visual feedback
      return;
    }

    // Visual mirror on button pad
    Buttons.highlightButton(action);

    // Dispatch to calculator engine
    Calculator.handle(action);
  }

  function onKeyUp() {
    lastKey  = null;
    lastTime = 0;
  }

  /* Register listeners after DOM is ready */
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    console.log('⌨️  Keyboard support active');
  });

})();
