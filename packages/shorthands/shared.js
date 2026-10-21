// @gestalt/shorthands/shared.js

export const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

const UNITS  = 'px|rem|em|%|vh|vw|vi|vb|vmin|vmax|dvh|dvw|svh|svw|lvh|lvw|cqi|cqb|cqw|cqh|ch|ex|cap|ic|lh|rlh|pt|pc|cm|mm|in|q';
const LENGTH = new RegExp(`^-?(?:\\d+|\\d*\\.\\d+)(?:${UNITS})$`, 'i');
const MATH   = ['calc', 'clamp', 'max', 'min'];
const COLORS = ['color', 'color-mix', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'light-dark', 'oklab', 'oklch', 'rgb', 'rgba'];

// 1rem, 0.5em, 0, calc(…), clamp(…)
export const isLength = token => token.type === 'function' ? MATH.includes(token.name) : token.raw === '0' || LENGTH.test(token.raw);

// #fff, rgb(…), oklch(…) everywhere; named colors only where CSS.supports exists (the browser)
export function isColor (token) {
  if (token.type === 'function') return COLORS.includes(token.name);
  if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(token.raw)) return true;
  return token.type === 'word' && /^[a-z]+$/i.test(token.raw) && globalThis.CSS?.supports?.('color', token.raw) === true;
}

export const quote = text => `"${text.replace(/["\\]/g, '\\$&')}"`;

// a deep copy of source into target: nested blocks (`& > *`) merge, values overwrite
export function merge (target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (isObject(value)) target[key] = merge(isObject(target[key]) ? target[key] : {}, value);
    else                 target[key] = value;
  }
  return target;
}

// { 'font-weight': 700, '& > *': { … } } -> 'selector { font-weight: 700; & > * { … } }'
export function toCSS (selector, declarations) {
  const body = Object.entries(declarations).map(([key, value]) => isObject(value) ? toCSS(key, value) : `${key}: ${value};`);
  return `${selector} { ${body.join(' ')} }`;
}

// [name="value"], the value as a css string
export const attributeSelector = (name, value) => `[${name}=${quote(value).replace(/\n/g, '\\a ')}]`;
