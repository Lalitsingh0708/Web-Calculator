/**
 * settings.js – App-wide configuration
 *
 * All tuneable constants live here so you can tweak behavior
 * without hunting through logic files.
 */

const SETTINGS = {
  // Maximum number of digits shown before switching to scientific notation
  MAX_DIGITS: 12,

  // Maximum characters in the expression line
  MAX_EXPR_LENGTH: 60,

  // Number of history entries to keep
  MAX_HISTORY: 20,

  // Decimal separator (change to ',' for European locales)
  DECIMAL_SEP: '.',

  // Thousands separator used in display ('' to disable)
  THOUSANDS_SEP: ',',

  // Animation duration in ms for number pop-in
  ANIM_POP_MS: 180,

  // Duration of the shake error animation in ms
  ANIM_SHAKE_MS: 350,

  // Whether to persist history in localStorage
  PERSIST_HISTORY: true,

  // localStorage key for saved history
  HISTORY_KEY: 'calcify_history',

  // Keyboard repeat delay in ms (prevents flooding on hold)
  KEY_REPEAT_DELAY: 100,

  // App version (shown in console)
  VERSION: '1.0.0',
};

// Freeze to prevent accidental mutation
Object.freeze(SETTINGS);
