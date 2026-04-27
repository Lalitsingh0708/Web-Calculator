/**
 * buttons.js – Button rendering component
 *
 * Builds the entire button grid declaratively from a config array,
 * then wires up delegated click handling.
 *
 * Each button config object:
 * {
 *   label     : string  – visible text / aria label
 *   action    : string  – action name passed to Calculator.handle()
 *   type      : string  – CSS modifier class suffix (number|operator|equals|clear|func|history)
 *   span      : string  – optional CSS class for grid spanning (e.g. 'btn-zero')
 *   icon      : string  – optional SVG icon id (from assets/icons)
 * }
 */

(function ButtonsComponent() {

  /* ---- Button layout definition ---- */
  const BUTTON_MAP = [
    // Row 0 – History toggle (full width)
    { label: '⏱ History', action: 'toggle-history', type: 'history' },

    // Row 1
    { label: 'AC',  action: 'clear-all',   type: 'clear' },
    { label: '±',   action: 'negate',      type: 'func'  },
    { label: '%',   action: 'percent',     type: 'func'  },
    { label: '÷',   action: 'operator-/', type: 'operator', icon: 'divide' },

    // Row 2
    { label: '7',   action: 'digit-7',    type: 'number' },
    { label: '8',   action: 'digit-8',    type: 'number' },
    { label: '9',   action: 'digit-9',    type: 'number' },
    { label: '×',   action: 'operator-*', type: 'operator', icon: 'multiply' },

    // Row 3
    { label: '4',   action: 'digit-4',    type: 'number' },
    { label: '5',   action: 'digit-5',    type: 'number' },
    { label: '6',   action: 'digit-6',    type: 'number' },
    { label: '−',   action: 'operator--', type: 'operator', icon: 'minus' },

    // Row 4
    { label: '1',   action: 'digit-1',    type: 'number' },
    { label: '2',   action: 'digit-2',    type: 'number' },
    { label: '3',   action: 'digit-3',    type: 'number' },
    { label: '+',   action: 'operator-+', type: 'operator', icon: 'plus' },

    // Row 5
    { label: '0',   action: 'digit-0',    type: 'number', span: 'btn-zero' },
    { label: '.',   action: 'decimal',    type: 'number' },
    { label: '=',   action: 'equals',     type: 'equals' },
  ];

  /**
   * Load an SVG icon from assets/icons by name.
   * Returns an <img> element or empty string if not found.
   *
   * @param {string} name - e.g. 'plus'
   * @returns {string} HTML string
   */
  function iconHTML(name) {
    if (!name) return '';
    // Inline SVG path data for the four operator icons
    const paths = {
      plus:     'M12 5v14M5 12h14',
      minus:    'M5 12h14',
      multiply: 'M6 6l12 12M18 6L6 18',
      divide:   'M12 8v.01M5 12h14M12 16v.01',
    };
    if (!paths[name]) return '';
    return `<svg class="btn-icon" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.2"
                  stroke-linecap="round" stroke-linejoin="round"
                  aria-hidden="true">
              <path d="${paths[name]}"/>
            </svg>`;
  }

  /**
   * Create a single button element from a config object.
   *
   * @param {Object} cfg
   * @returns {HTMLButtonElement}
   */
  function createButton(cfg) {
    const btn = document.createElement('button');
    btn.className = ['btn', `btn-${cfg.type}`, cfg.span || ''].join(' ').trim();
    btn.dataset.action = cfg.action;
    btn.setAttribute('aria-label', cfg.label);
    btn.setAttribute('title', cfg.label);

    // Show icon + label (label hidden for operators that use icon)
    const showLabel = !cfg.icon || cfg.type !== 'operator';
    btn.innerHTML = `${iconHTML(cfg.icon)}${showLabel ? `<span>${cfg.label}</span>` : ''}`;

    // For operator buttons with icon, still add the symbol as aria fallback
    if (cfg.icon && !showLabel) {
      btn.setAttribute('aria-label', cfg.label);
    }

    return btn;
  }

  /**
   * Render all buttons into #calculator-buttons.
   * Uses event delegation on the grid container.
   */
  function render() {
    const container = document.getElementById('calculator-buttons');
    if (!container) return;

    const grid = document.createElement('div');
    grid.className = 'buttons-grid';
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', 'Calculator buttons');

    BUTTON_MAP.forEach(cfg => grid.appendChild(createButton(cfg)));
    container.appendChild(grid);

    // Delegated click handler
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      // Visual press feedback
      flashClass(btn, 'pressed', 300);

      // Dispatch to calculator logic
      Calculator.handle(btn.dataset.action);
    });
  }

  /**
   * Programmatically trigger the visual press animation on a button
   * (used by keyboard.js to mirror physical key presses).
   *
   * @param {string} action - data-action value
   */
  function highlightButton(action) {
    const btn = document.querySelector(`[data-action="${action}"]`);
    if (btn) flashClass(btn, 'pressed', 300);
  }

  /* Expose to global scope */
  window.Buttons = { render, highlightButton };
})();
