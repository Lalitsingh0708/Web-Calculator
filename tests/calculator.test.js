/**
 * calculator.test.js – Unit tests for calculator logic
 *
 * Run with Node.js (no test runner required):
 *   node tests/calculator.test.js
 *
 * All tests use a tiny assertion helper so there are
 * zero external dependencies.
 */
 
'use strict';

/* ---- Minimal test harness ---- */
let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ✓  ${description}`);
    passed++;
  } else {
    console.error(`  ✗  ${description}`);
    failed++;
  }
}

function describe(suite, fn) {
  console.log(`\n▸ ${suite}`);
  fn();
}



// Replicate safeEval from utils.js
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      tokens.push({ type: 'NUM', val: parseFloat(num) });
      continue;
    }
    if ('+-*/()%'.includes(ch)) { tokens.push({ type: 'OP', val: ch }); i++; continue; }
    i++;
  }
  return tokens;
}

let _pos, _tokens;

function parseExpression(tokens) { _tokens = tokens; _pos = 0; return parseAddSub(); }
function parseAddSub() {
  let l = parseMulDiv();
  while (_pos < _tokens.length && ['+', '-'].includes(_tokens[_pos].val)) {
    const op = _tokens[_pos++].val; const r = parseMulDiv();
    l = op === '+' ? l + r : l - r;
  }
  return l;
}
function parseMulDiv() {
  let l = parseUnary();
  while (_pos < _tokens.length && ['*', '/', '%'].includes(_tokens[_pos].val)) {
    const op = _tokens[_pos++].val; const r = parseUnary();
    if (op === '/' && r === 0) throw new Error('Division by zero');
    l = op === '/' ? l / r : op === '*' ? l * r : l % r;
  }
  return l;
}
function parseUnary() {
  if (_pos < _tokens.length && _tokens[_pos].val === '-') { _pos++; return -parsePrimary(); }
  if (_pos < _tokens.length && _tokens[_pos].val === '+') _pos++;
  return parsePrimary();
}
function parsePrimary() {
  if (_pos >= _tokens.length) throw new Error('Unexpected end');
  const tok = _tokens[_pos];
  if (tok.type === 'OP' && tok.val === '(') {
    _pos++; const r = parseAddSub();
    if (_pos >= _tokens.length || _tokens[_pos].val !== ')') throw new Error('Missing )');
    _pos++; return r;
  }
  if (tok.type === 'NUM') { _pos++; return tok.val; }
  throw new Error(`Unexpected token: ${tok.val}`);
}
function safeEval(expression) {
  const sanitized = expression.replace(/[^0-9+\-*/().% ]/g, '');
  if (!sanitized.trim()) throw new Error('Empty expression');
  const result = parseExpression(tokenize(sanitized));
  if (!isFinite(result)) throw new Error('Math error');
  return result;
}

// Replicate compute() from calculator.js
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
  return parseFloat(result.toPrecision(12));
}

// Replicate formatNumber() from utils.js (simplified, no SETTINGS)
function formatNumber(value) {
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) return 'Error';
  if (Math.abs(num) >= 1e13 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6).replace(/\.?0+e/, 'e');
  }
  const parts = num.toFixed(10).replace(/\.?0+$/, '').split('.');
  const intPart  = parts[0].replace(/-?\d+/, n => n.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
  return parts[1] ? `${intPart}.${parts[1]}` : intPart;
}



describe('Basic arithmetic – compute()', () => {
  assert('2 + 3 = 5',          compute(2, '+', 3) === 5);
  assert('10 - 4 = 6',         compute(10, '-', 4) === 6);
  assert('3 * 7 = 21',         compute(3, '*', 7) === 21);
  assert('20 / 4 = 5',         compute(20, '/', 4) === 5);
  assert('1 / 3 ≈ 0.333…',     Math.abs(compute(1, '/', 3) - 0.3333333333) < 1e-9);
  assert('Division by zero → null', compute(5, '/', 0) === null);
  assert('Negative result: 3 - 10 = -7', compute(3, '-', 10) === -7);
  assert('Float: 0.1 + 0.2 ≈ 0.3',       Math.abs(compute(0.1, '+', 0.2) - 0.3) < 1e-9);
});

describe('safeEval() – expression parser', () => {
  assert('Simple addition "3 + 4" = 7',    safeEval('3 + 4') === 7);
  assert('Chained "2 + 3 * 4" = 14',       safeEval('2 + 3 * 4') === 14);
  assert('Parentheses "(2 + 3) * 4" = 20', safeEval('(2 + 3) * 4') === 20);
  assert('Negative unary "-5 + 10" = 5',   safeEval('-5 + 10') === 5);
  assert('Float "1.5 + 2.5" = 4',          safeEval('1.5 + 2.5') === 4);
  assert('Modulo "10 % 3" = 1',            safeEval('10 % 3') === 1);

  let threw = false;
  try { safeEval('10 / 0'); } catch { threw = true; }
  assert('Division by zero throws', threw);

  let threwEmpty = false;
  try { safeEval(''); } catch { threwEmpty = true; }
  assert('Empty expression throws', threwEmpty);
});

describe('formatNumber() – display formatting', () => {
  assert('"0" → "0"',                  formatNumber('0')         === '0');
  assert('"1000" → "1,000"',           formatNumber('1000')      === '1,000');
  assert('"1234567" → "1,234,567"',    formatNumber('1234567')   === '1,234,567');
  assert('"3.14" → "3.14"',            formatNumber('3.14')      === '3.14');
  assert('"-42" → "-42"',              formatNumber('-42')       === '-42');
  assert('"NaN" → "Error"',            formatNumber('NaN')       === 'Error');
  assert('Very large → scientific',    formatNumber('1e14').includes('e'));
  assert('Very small → scientific',    formatNumber('1e-7').includes('e'));
  assert('No trailing zeros: "1.50"',  formatNumber('1.50')      === '1.5');
});

describe('Edge cases', () => {
  assert('compute with unknown op returns null', compute(1, '^', 2) === null);
  assert('Infinity result returns null',         compute(1e308, '*', 1e308) === null);
  assert('formatNumber of Infinity → "Error"',  formatNumber(Infinity) === 'Error');
  assert('0 / 1 = 0',                            compute(0, '/', 1) === 0);
  assert('-0 treated as 0',                      Object.is(compute(0, '-', 0), 0) || compute(0, '-', 0) === 0);
});


console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('❌ Some tests failed.');
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
}
