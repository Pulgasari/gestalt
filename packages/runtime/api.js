// @gestalt/runtime/api.js

import { d } from '@domina/chain';

/**
 * Parses shorthand typography strings into individual key-value pairs.
 * Example: '"Rubik Sans" uppercase italic 20px justify'
 */
function parseTypoShorthand (valueStr) {
  if (!valueStr) return {};

  const result = {};

  // Extract font-family (quoted strings or comma-separated lists at the end/start)
  const familyMatch = valueStr.match(/("[^"]+"|'[^']+'|[a-zA-Z-]+\s*,\s*sans-serif|sans-serif|serif|monospace)/i);
  if (familyMatch) {
    result['font-family'] = familyMatch[0];
    valueStr = valueStr.replace(familyMatch[0], '');
  }

  // Tokenize remaining parts
  const tokens = valueStr.trim().split(/\s+/);

  tokens.forEach(token => {
    if (!token) return;

    if (/^(uppercase|lowercase|capitalize|none)$/i.test(token)) {
      result['text-transform'] = token.toLowerCase();
    } else if (/^(italic|oblique|normal)$/i.test(token)) {
      result['font-style'] = token.toLowerCase();
    } else if (/^(left|right|center|justify|start|end)$/i.test(token)) {
      result['text-align'] = token.toLowerCase();
    } else if (/^(bold|bolder|lighter|[1-9]00)$/i.test(token)) {
      result['font-weight'] = token.toLowerCase();
    } else if (/^\d+(\.\d+)?(px|rem|em|%|vh|vw|pt)$/i.test(token)) {
      result['font-size'] = token;
    }
  });

  return result;
}

class Gestalter {
  #namespace;
  #target;

  constructor (target, namespace) {
    this.#target    = target;
    this.#namespace = namespace;
  }

  get #prefix () { return `gestalt-${this.#namespace}-`; }

  setAttr (key, value) {
    const fullAttribute = this.#prefix + key;
    
    // Support domina chain or native DOM element
    if (typeof d === 'function') {
      d(this.#target).attr(fullAttribute, value);
    } else if (this.#target instanceof Element) {
      if (value === null || value === undefined) {
        this.#target.removeAttribute(fullAttribute);
      } else {
        this.#target.setAttribute(fullAttribute, String(value));
      }
    }
  }

  get target() {
    return this.#target;
  }
}

class TypoGestalter extends Gestalter {
  constructor (target) { super(target, 'typo'); }

  // Handles: element.gestalt.typo = "..."
  set shorthand (value) {
    const parsed = parseTypoShorthand(value);
    Object.entries(parsed).forEach(([key, val]) => {
      this.setAttr(key, val);
    });
  }
}

class FlowGestalter extends Gestalter {
  constructor (target) { super(target, 'flow'); }
}

class SurfaceGestalter extends Gestalter {
  constructor (target) { super(target, 'surface'); }
}

/**
 * Creates a Proxy to allow syntactic sugar:
 * element.gestalt.typo = '...'
 */
function createGestaltProxy (element) {
  const instances = {
    flow    : new    FlowGestalter (element),
    surface : new SurfaceGestalter (element),
    typo    : new    TypoGestalter (element),
  };

  return new Proxy (instances, {
    set(target, prop, value) {
      if (prop in target) {
        // Trigger shorthand setter
        target[prop].shorthand = value;
        return true;
      }
      return false;
    },
    get(target, prop) {
      return target[prop];
    }
  });
}

// extends Element.prototype so element.gestalt is available on all DOM nodes
function registerElementPrototype() {
  if (typeof Element !== 'undefined' && !Object.prototype.hasOwnProperty.call(Element.prototype, 'gestalt')) {
    Object.defineProperty(Element.prototype, 'gestalt', {
      get() {
        if (!this._gestaltProxy) {
          this._gestaltProxy = createGestaltProxy(this);
        }
        return this._gestaltProxy;
      },
      configurable: true
    });
  }
}

export {
  Gestalter,
  TypoGestalter,
  FlowGestalter,
  SurfaceGestalter,
  parseTypoShorthand
};
