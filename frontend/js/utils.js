/**
 * utils.js – Pure helper / utility functions
 *
 * These functions have zero side-effects and no DOM access.
 * They are shared across calculator.js, display.js, and buttons.js.
 */

/**
 * Format a number for display.
 * - Adds thousands separators.
 * - Converts to scientific notation if too large/small.
 * - Removes trailing zeros after decimal.
 *
 * @param {number|string} value - Raw numeric value
 * @returns {string} Human-friendly display string
 */
function formatNumber(value) {
  const num = parseFloat(value);

  if (isNaN(num) || !isFinite(num)) return 'Error';

  // Use scientific notation for very large or very small numbers
  if (Math.abs(num) >= 1e13 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6).replace(/\.?0+e/, 'e');
  }

  // Split integer and decimal parts
  const parts = num.toFixed(10).replace(/\.?0+$/, '').split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  // Add thousands separator to integer part
  const formattedInt = intPart.replace(/-?\d+/, (n) => {
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, SETTINGS.THOUSANDS_SEP);
  });

  return decPart ? `${formattedInt}${SETTINGS.DECIMAL_SEP}${decPart}` : formattedInt;
}

/**
 * Clamp a string to a maximum character length,
 * appending '…' when truncated.
 *
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
function clampString(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * Determine whether a given string value represents a valid
 * intermediate calculator input (not necessarily a complete expression).
 *
 * @param {string} str
 * @returns {boolean}
 */
function isValidInput(str) {
  return str !== '' && str !== 'Error' && str !== 'Infinity' && str !== '-Infinity';
}

/**
 * Safely evaluate a simple arithmetic expression string
 * using only +, -, *, /, and parentheses – no eval().
 *
 * Supports: integers, floats, negatives.
 * Throws on invalid input.
 *
 * @param {string} expression - e.g. "3.5 + 2 * (4 - 1)"
 * @returns {number}
 */
function safeEval(expression) {
  // Strip out anything that's not a digit, operator, dot, or space
  const sanitized = expression.replace(/[^0-9+\-*/().% ]/g, '');
  if (!sanitized.trim()) throw new Error('Empty expression');

  // We parse manually using a recursive descent approach
  const tokens = tokenize(sanitized);
  const result = parseExpression(tokens);

  if (!isFinite(result)) throw new Error('Math error');
  return result;
}

/* ---- Tokenizer ---- */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) { i++; continue; }

    // Number (including decimals)
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) { num += expr[i++]; }
      tokens.push({ type: 'NUM', val: parseFloat(num) });
      continue;
    }

    // Operators & parens
    if ('+-*/()%'.includes(ch)) {
      tokens.push({ type: 'OP', val: ch });
      i++;
      continue;
    }

    // Unknown character – skip
    i++;
  }
  return tokens;
}

let _pos, _tokens;

function parseExpression(tokens) {
  _tokens = tokens;
  _pos = 0;
  const result = parseAddSub();
  return result;
}

function parseAddSub() {
  let left = parseMulDiv();
  while (_pos < _tokens.length && (_tokens[_pos].val === '+' || _tokens[_pos].val === '-')) {
    const op = _tokens[_pos++].val;
    const right = parseMulDiv();
    left = op === '+' ? left + right : left - right;
  }
  return left;
}

function parseMulDiv() {
  let left = parseUnary();
  while (_pos < _tokens.length && (_tokens[_pos].val === '*' || _tokens[_pos].val === '/' || _tokens[_pos].val === '%')) {
    const op = _tokens[_pos++].val;
    const right = parseUnary();
    if (op === '/' && right === 0) throw new Error('Division by zero');
    if (op === '/') left = left / right;
    else if (op === '*') left = left * right;
    else                 left = left % right;
  }
  return left;
}

function parseUnary() {
  if (_pos < _tokens.length && _tokens[_pos].val === '-') {
    _pos++;
    return -parsePrimary();
  }
  if (_pos < _tokens.length && _tokens[_pos].val === '+') {
    _pos++;
  }
  return parsePrimary();
}

function parsePrimary() {
  if (_pos >= _tokens.length) throw new Error('Unexpected end');

  const tok = _tokens[_pos];

  // Parenthesised sub-expression
  if (tok.type === 'OP' && tok.val === '(') {
    _pos++; // consume '('
    const result = parseAddSub();
    if (_pos >= _tokens.length || _tokens[_pos].val !== ')') throw new Error('Missing )');
    _pos++; // consume ')'
    return result;
  }

  // Number literal
  if (tok.type === 'NUM') {
    _pos++;
    return tok.val;
  }

  throw new Error(`Unexpected token: ${tok.val}`);
}

/**
 * Debounce a function call.
 *
 * @param {Function} fn
 * @param {number}   delay - milliseconds
 * @returns {Function}
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Add a CSS class for one animation cycle, then remove it.
 *
 * @param {Element} el
 * @param {string}  className
 * @param {number}  duration - milliseconds
 */
function flashClass(el, className, duration) {
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}
