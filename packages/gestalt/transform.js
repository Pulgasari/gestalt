// transform.js

import filters  from '@gestalt/filters';
import patterns from '@gestalt/patterns';

/*
gestalt-anweisungen können kommen von
- data-attributen
- css-regeln
- js-api

und teilweise transformieren sie code teilweise  nich
*/

function transform (code) {
  code.replace(/#soviet/g, '#ff0000');
  return code;
}

function processFilterRule  (rule, target = 'body') {
  // body { gestalt-filter: glitch-live animate[true] speed[2s]; }
  // <body gestalt-filter="glitch-live animate[true] speed[2s]">
  // <body data-gestalt-filter="glitch-live animate[true] speed[2s]">
  // hier kommt an: glitch-live animate[true] speed[2s]
  filters.apply(target, 'glitch-live', { animate: true, speed: '2s' });
}
function processPatternRule () {}

export { transform };
export default transform;





/**
 * Parses a Gestalt directive string into a name and options object.
 * Example input: "glitch-live animate[true] speed[2s]"
 * Output: { name: 'glitch-live', options: { animate: true, speed: '2s' } }
 */
function parseDirective (directiveStr) {
  if (!directiveStr) return { name: null, options: {} };

  const trimmed = directiveStr.trim();
  const firstSpaceIndex = trimmed.search(/\s|\[/);
  
  const name = firstSpaceIndex === -1 ? trimmed : trimmed.slice(0, firstSpaceIndex);
  const options = {};

  // Extract key[value] arguments
  const paramRegex = /(\w+)\[([^\]]+)\]/g;
  let match;

  while ((match = paramRegex.exec(trimmed)) !== null) {
    const key = match[1];
    let rawValue = match[2].trim();

    // Type coercion for booleans and numbers
         if (rawValue === 'true')      rawValue = true;
    else if (rawValue === 'false')     rawValue = false;
    else if (!isNaN(Number(rawValue))) rawValue = Number(rawValue);

    options[key] = rawValue;
  }

  return { name, options };
}

const  filterRuleRegex = /([^{]+)\{([^}]*gestalt-filter\s*:\s*([^;]+);?[^}]*)\}/g;
const patternRuleRegex = /([^{]+)\{([^}]*gestalt-pattern\s*:\s*([^;]+);?[^}]*)\}/g;

function transform(code) {
  if (typeof code !== 'string') return code;

  // 1. Direct macro replacement
  let transformed = code.replace(/#soviet/g, '#ff0000');

  // 2. Extract and strip 'gestalt-filter' rules from CSS
  transformed = transformed.replace(filterRuleRegex, (fullMatch, selector, body, directive) => {
    const target = selector.trim();
    processFilterRule(directive, target);

    // Remove non-standard CSS rule to avoid invalid CSS property warnings in browser
    const cleanBody = body.replace(/gestalt-filter\s*:\s*[^;]+;?/g, '');
    return `${selector}{${cleanBody}}`;
  });

  // 3. Extract and strip 'gestalt-pattern' rules from CSS
  transformed = transformed.replace(patternRuleRegex, (fullMatch, selector, body, directive) => {
    const target = selector.trim();
    processPatternRule(directive, target);

    const cleanBody = body.replace(/gestalt-pattern\s*:\s*[^;]+;?/g, '');
    return `${selector}{${cleanBody}}`;
  });

  return transformed;
}

function processFilterRule (rule, target = 'body') {
  const { name, options } = parseDirective(rule);
  if (name) filters.apply(target, name, options);
}

function processPatternRule (rule, target = 'body') {
  const { name, options } = parseDirective(rule);
  if (name) patterns.apply(target, name, options);
}

/**
 * Scans DOM elements for HTML attributes like 'gestalt-filter' or 'data-gestalt-filter'.
 */
function processDOMAttributes (root = document) {
  // Query both standard attributes and data-* prefixed attributes
  const filterElements = root.querySelectorAll('[gestalt-filter], [data-gestalt-filter]');
  filterElements.forEach(element => {
    const directive = element.getAttribute('gestalt-filter') || element.getAttribute('data-gestalt-filter');
    if (directive) processFilterRule(directive, element);
  });

  const patternElements = root.querySelectorAll('[gestalt-pattern], [data-gestalt-pattern]');
  patternElements.forEach(element => {
    const directive = element.getAttribute('gestalt-pattern') || element.getAttribute('data-gestalt-pattern');
    if (directive) processPatternRule(directive, element);
  });
}

export {
  transform,
  parseDirective,
  processFilterRule,
  processPatternRule,
  processDOMAttributes
};

export default transform;
