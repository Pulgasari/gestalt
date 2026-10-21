// @gestalt/shorthands/render.js
// from attributes to rules. every distinct attribute value gets one rule in one shared,
// constructed stylesheet, inside @layer aufbau.utilities:
//
//   <div gestalt-typo='bold uppercase'>  ->  [gestalt-typo="bold uppercase"] { font-weight: 700; text-transform: uppercase; }
//
// so equal values share a rule, the page's own css wins over it, and the value stays
// readable in the dom. rules are never removed: the sheet grows with the distinct values

import { compile, compileBlock, groups } from './compile.js';
import { attributeSelector, toCSS } from './shared.js';

const LAYER   = 'aufbau.utilities';
const sheet   = typeof CSSStyleSheet === 'function' ? new CSSStyleSheet : null;
const rules   = new Set;       // selectors in the sheet
const adopted = new WeakSet;   // documents and shadow roots that have the sheet
const warned  = new Set;

export { sheet };

// gestalt, data-gestalt: a block of groups. gestalt-typo, data-gestalt-typo: one group
export const attributeNames = () => ['gestalt', 'data-gestalt', ...[...groups.keys()].flatMap(name => [`gestalt-${name}`, `data-gestalt-${name}`])];

function compileAttribute (name, value) {
  const base = name.startsWith('data-') ? name.slice(5) : name;
  return base === 'gestalt' ? compileBlock(value) : compile(base.slice(8), value);
}

function adopt (root) {
  if (!sheet || adopted.has(root) || !root.adoptedStyleSheets) return;
  root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  adopted.add(root);
}

function insert (selector, declarations) {
  if (rules.has(selector)) return;
  rules.add(selector);
  try { sheet.insertRule(`@layer ${LAYER} { ${toCSS(selector, declarations)} }`, sheet.cssRules.length); }
  catch (error) { console.warn(`[gestalt] ${selector}: ${error.message}`); }
}

// the rule for one attribute of one element
export function render (element, name) {
  const value = element.getAttribute(name);
  if (!sheet || value == null || !value.trim()) return;

  const selector = attributeSelector(name, value);
  if (!rules.has(selector)) {
    const { declarations, unknown } = compileAttribute(name, value);
    if (unknown.length && !warned.has(selector)) { warned.add(selector); console.warn(`[gestalt] ${selector}: unknown ${unknown.join(', ')}`); }
    insert(selector, declarations);
  }
  adopt(element.getRootNode());
}

// every gestalt attribute in root, root included
export function scan (root = document) {
  const names    = attributeNames();
  const selector = names.map(name => `[${name}]`).join(',');
  const elements = [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
  for (const element of elements) for (const name of names) if (element.hasAttribute(name)) render(element, name);
}

// scan, then follow changed attributes and added elements. returns the disconnect.
// groups defined after this call are not observed
export function observe (root = document) {
  scan(root);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') render(record.target, record.attributeName);
      else for (const node of record.addedNodes) if (node.nodeType === 1) scan(node);
    }
  });
  observer.observe(root, { attributeFilter: attributeNames(), attributes: true, childList: true, subtree: true });
  return () => observer.disconnect();
}
