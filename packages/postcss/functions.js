// @gestalt/postcss :: functions

/*
css custom functions (@function) written out while building, for the browsers that do not have them:

  padding : --space(large);        ->  padding : calc(var(--unit, 0.25rem) * 6);
                                       padding : --space(large);
  --bg    : --alpha(ink, 0.35);    ->  --bg    : color-mix(in oklch, var(--color-ink) 35%, transparent);

a property gets the expansion in front as a fallback: a browser with @function takes the call, one
without drops it and keeps the line above. a custom property takes any value, so a fallback in front
would never show: its value is replaced.

the expansion follows the function: the arguments bound (the default when missing, checked against
their type), its local custom properties and its result in order, var() of a parameter or a local
replaced (an invalid one takes its fallback), if() decided where its style() tests a parameter or a
local, the calls inside expanded the same way, calc() of plain numbers worked out, the result checked
against returns. a call stays as it is when that can not be done while building: an if() on a property
of the page or on color-scheme(), an argument that does not fit its type, a function nobody defined.
*/

// :::::: TEXT

const INVALID = Symbol('invalid');

class Unresolved extends Error {}

const unresolved = reason => { throw new Unresolved(reason); };

// the index of the ) that closes the ( at open, strings skipped
function closeOf (text, open) {
  let depth = 0, quote = null;
  for (let index = open; index < text.length; index++) {
    const char = text[index];
    if (quote) { if (char === '\\') index++; else if (char === quote) quote = null; continue; }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(') depth++;
    else if (char === ')' && --depth === 0) return index;
  }
  return unresolved('unbalanced parentheses');
}

// split at separator outside of parentheses and strings, at the first one only when once
function splitTop (text, separator, once = false) {
  const parts = [];
  let depth = 0, quote = null, from = 0;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quote) { if (char === '\\') index++; else if (char === quote) quote = null; continue; }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === separator && depth === 0) {
      parts.push(text.slice(from, index));
      from = index + 1;
      if (once) break;
    }
  }
  parts.push(text.slice(from));
  return parts;
}

const tidy = text => text.replace(/\s+/g, ' ').trim();

// every call of a function named by pattern: { start, open, end, name, inner }, left to right
function * callsOf (text, pattern) {
  pattern.lastIndex = 0;
  let match;
  while ((match = pattern.exec(text))) {
    const start = match.index + match[1].length;
    const open  = match.index + match[0].length - 1;
    const end   = closeOf(text, open);
    yield { end, inner: text.slice(open + 1, end), name: match[2], open, start };
    pattern.lastIndex = end + 1;
  }
}

const CALL = /(^|[^\w-])(--[\w-]+)\(/g;
const IF   = /(^|[^\w-])(if)\(/g;
const VAR  = /(^|[^\w-])(var)\(/g;
const CALC = /(^|[^\w-])(calc)\(/g;

// replace every call by what fn gives for it, fn may give INVALID
function replaceCalls (text, pattern, fn) {
  let out = '', from = 0;
  for (const call of callsOf(text, pattern)) {
    const value = fn(call);
    if (value === INVALID) return INVALID;
    out  += text.slice(from, call.start) + value;
    from  = call.end + 1;
  }
  return out + text.slice(from);
}

const isStatic = value => value !== INVALID && !/\b(var|env|attr)\(/.test(value);

// :::::: DEFINITIONS

/*
an @function rule as { name, params: [{ name, syntax, initial }], returns, body: [{ prop, value }] }.
a body with anything but declarations (an @media inside) is not written out
*/
function definitionOf (rule) {
  const name   = rule.params.match(/^\s*(--[\w-]+)\s*\(/)?.[1];
  if (!name) return null;
  const open   = rule.params.indexOf('(');
  const close  = closeOf(rule.params, open);
  const inner  = rule.params.slice(open + 1, close).trim();
  const after  = rule.params.slice(close + 1).trim();

  const params = inner ? splitTop(inner, ',').map(param => {
    const [head, initial] = splitTop(param, ':', true).map(part => part?.trim());
    const [, paramName, syntax = ''] = head.match(/^(--[\w-]+)\s*(.*)$/s) ?? [];
    return { initial: initial || null, name: paramName, syntax: syntaxOf(syntax) };
  }) : [];

  const body = (rule.nodes ?? []).filter(node => node.type !== 'comment');
  if (body.some(node => node.type !== 'decl')) return { name, unsupported: true };

  return {
    body    : body.map(node => ({ prop: node.prop, value: node.value })),
    name,
    params,
    returns : after.startsWith('returns') ? syntaxOf(after.slice(7)) : '*',
  };
}

const syntaxOf = text => {
  const trimmed = tidy(text);
  const typed   = trimmed.match(/^type\((.*)\)$/s);
  return typed ? tidy(typed[1]) : trimmed || '*';
};

// :::::: TYPES

const LENGTH = new Set(['cap', 'ch', 'cm', 'cqb', 'cqh', 'cqi', 'cqmax', 'cqmin', 'cqw', 'dvb', 'dvh', 'dvi', 'dvmax', 'dvmin', 'dvw', 'em', 'ex', 'ic', 'in', 'lh', 'lvb', 'lvh', 'lvi', 'lvmax', 'lvmin', 'lvw', 'mm', 'pc', 'pt', 'px', 'q', 'rcap', 'rch', 'rem', 'rex', 'ric', 'rlh', 'svb', 'svh', 'svi', 'svmax', 'svmin', 'svw', 'vb', 'vh', 'vi', 'vmax', 'vmin', 'vw']);
const ANGLE  = new Set(['deg', 'grad', 'rad', 'turn']);
const TIME   = new Set(['ms', 's']);

const COLOR_FUNCTIONS = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark|contrast-color)\(/i;
const NUMERIC         = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%|[a-z]+)?$/i;
const COLOR_WORDS     = /^(currentcolor|transparent|aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)$/i;

/*
the types a value has, as css names them, or null when that is only known in the page (var(), env(),
several values): such a value is taken as fitting
*/
function typesOf (value) {
  const text    = tidy(value);
  const numeric = text.match(NUMERIC);
  if (numeric) {
    const [, number, unit = ''] = numeric;
    if (!unit)        return Number.isInteger(Number(number)) ? ['number', 'integer'] : ['number'];
    if (unit === '%') return ['percentage', 'length-percentage'];
    const lower = unit.toLowerCase();
    if (LENGTH.has(lower)) return ['length', 'length-percentage'];
    if (ANGLE.has(lower))  return ['angle'];
    if (TIME.has(lower))   return ['time'];
    return null;
  }
  if (/^#[\da-f]{3,8}$/i.test(text) || COLOR_FUNCTIONS.test(text) || COLOR_WORDS.test(text)) return ['color', ...(/^[a-z-]+$/i.test(text) ? [`=${text}`] : [])];
  if (/^[a-z_-][\w-]*$/i.test(text)) return [`=${text}`];
  if (/^".*"$|^'.*'$/s.test(text))   return ['string'];
  return null;
}

// does value fit syntax ('<number> | <percentage> | small | large', '*')
function fits (value, syntax) {
  if (syntax === '*' || value === INVALID) return true;
  const types = typesOf(value);
  if (!types) return true;
  return splitTop(syntax, '|').map(tidy).some(option => option.startsWith('<') ? types.includes(option.slice(1, -1)) : types.includes(`=${option}`));
}

// :::::: CALC

/*
a calc() of plain numbers, percentages and dimensions worked out: calc(0.2 * 100%) is 20%. a type
error (a number plus a length, a number divided by a percentage) makes it INVALID, as in the browser.
anything else in it (var(), env(), keywords, mixed units) leaves it as written: null
*/
const UNKNOWN = Symbol('unknown');

function evaluate (inner) {
  const tokens = inner.match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(?:%|[a-z]+)?|[-+*/()]|\S+/gi) ?? [];
  let index = 0;

  const peek    = () => tokens[index];
  const next    = () => tokens[index++];
  const unknown = () => { throw UNKNOWN; };

  function primary () {
    const token = next();
    if (token === '(') { const value = sum(); if (next() !== ')') unknown(); return value; }
    const match = token?.match(NUMERIC) ?? unknown();
    return { number: Number(match[1]), unit: (match[2] ?? '').toLowerCase() };
  }

  function product () {
    let left = primary();
    while (peek() === '*' || peek() === '/') {
      const operator = next(), right = primary();
      if (operator === '*') {
        if (left.unit && right.unit) return INVALID;
        left = { number: left.number * right.number, unit: left.unit || right.unit };
        continue;
      }
      if (right.number === 0) unknown();
      if (right.unit && right.unit !== left.unit) return left.unit ? unknown() : INVALID;   // px / rem: the page knows. 2 / 1%: invalid
      left = { number: left.number / right.number, unit: right.unit ? '' : left.unit };
    }
    return left;
  }

  function sum () {
    let left = product();
    while (left !== INVALID && (peek() === '+' || peek() === '-')) {
      const operator = next(), right = product();
      if (right === INVALID) return INVALID;
      if (left.unit !== right.unit) return left.unit && right.unit ? unknown() : INVALID;   // 1px + 1rem: the page knows. 1 + 1px: invalid
      left = { number: operator === '+' ? left.number + right.number : left.number - right.number, unit: left.unit };
    }
    return left;
  }

  try {
    const value = sum();
    if (index < tokens.length) return null;
    return value === INVALID ? INVALID : `${Number(value.number.toFixed(6))}${value.unit}`;
  }
  catch (error) { if (error === UNKNOWN) return null; throw error; }
}

// :::::: EXPANSION

/*
text with its if(), var() of the scope, function calls and plain calc() resolved. scope: the
parameters and locals of the function being expanded, name -> value or INVALID
*/
function expand (text, scope, definitions, depth = 0) {
  if (depth > 32) unresolved('too deep');

  // if(): the first branch whose test holds. a test of anything but a parameter or a local stays for the page
  let out = replaceCalls(text, IF, ({ inner }) => {
    for (const branch of splitTop(inner, ';').map(tidy).filter(Boolean)) {
      const [test, value = ''] = splitTop(branch, ':', true).map(tidy);
      if (test === 'else') return value;
      const style = test.match(/^style\(\s*(--[\w-]+)\s*:\s*(.+)\)$/s);
      if (!style || !scope.has(style[1])) unresolved(`if(${test}) depends on the page`);
      const current = scope.get(style[1]);
      if (current !== INVALID && !isStatic(current)) unresolved(`${style[1]} is only known in the page`);
      if (current !== INVALID && tidy(current) === tidy(style[2])) return value;
    }
    return INVALID;
  });
  if (out === INVALID) return INVALID;

  // var() of a parameter or a local: its value, the fallback when it is invalid
  out = replaceCalls(out, VAR, ({ inner }) => {
    const [name, fallback] = splitTop(inner, ',', true).map(part => part?.trim());
    if (!scope.has(name)) return fallback === undefined ? `var(${inner})` : `var(${name}, ${expandOrKeep(fallback, scope, definitions, depth)})`;
    const value = scope.get(name);
    if (value !== INVALID) return value;
    return fallback === undefined ? INVALID : expand(fallback, scope, definitions, depth + 1);
  });
  if (out === INVALID) return INVALID;

  // calls of custom functions, their arguments first
  out = replaceCalls(out, CALL, ({ inner, name }) => {
    const definition = definitions.get(name);
    if (!definition)            unresolved(`${name} is not defined`);
    if (definition.unsupported) unresolved(`${name} has more than declarations`);
    const args = inner.trim() ? splitTop(inner, ',').map(arg => expand(arg.trim(), scope, definitions, depth + 1)) : [];
    if (args.includes(INVALID)) return INVALID;
    return call(definition, args, definitions, depth + 1);
  });
  if (out === INVALID) return INVALID;

  // calc() of plain values
  return replaceCalls(out, CALC, call => evaluate(call.inner) ?? out.slice(call.start, call.end + 1));
}

const expandOrKeep = (text, scope, definitions, depth) => {
  const value = expand(text, scope, definitions, depth + 1);
  return value === INVALID ? text : value;
};

// a function called with these (expanded) arguments: its result, or INVALID
function call (definition, args, definitions, depth) {
  const scope = new Map;

  definition.params.forEach((param, index) => {
    const given = args[index];
    const value = given === undefined || given === '' ? (param.initial == null ? INVALID : expand(param.initial, new Map, definitions, depth)) : given;
    if (!fits(value, param.syntax)) unresolved(`${value} does not fit ${param.syntax} of ${param.name}`);
    scope.set(param.name, value);
  });

  let result = INVALID;
  for (const { prop, value } of definition.body) {
    const resolved = expand(value, scope, definitions, depth);
    if (prop === 'result') result = resolved;
    else scope.set(prop, resolved);
  }

  return result !== INVALID && fits(result, definition.returns) ? tidy(result) : INVALID;
}

// :::::: THE PASS

// the @function rules of a root and the files it @imports (relative ones), name -> definition
async function definitionsIn (files, { parse, readFile, resolve, dirname }) {
  const definitions = new Map;
  const seen        = new Set;

  async function read (file) {
    if (seen.has(file)) return;
    seen.add(file);
    const root = parse(await readFile(file, 'utf8'), { from: file });
    for (const node of root.nodes) {
      if (node.type !== 'atrule') continue;
      if (node.name === 'import') {
        const path = node.params.match(/^(?:url\()?\s*['"]?([^'")]+)['"]?\s*\)?/)?.[1];
        if (path && /^\.{1,2}\//.test(path)) await read(resolve(dirname(file), path));
      }
      if (node.name === 'function') add(definitions, node);
    }
  }

  for (const file of files) await read(file);
  return definitions;
}

function add (definitions, rule) {
  try {
    const definition = definitionOf(rule);
    if (definition) definitions.set(definition.name, definition);
  }
  catch (error) { if (!(error instanceof Unresolved)) throw error; }
}

const HAS_CALL = /(^|[^\w-])--[\w-]+\(/;

// every declaration that calls a custom function, written out where it can be
function lower (root, definitions) {
  root.walkAtRules('function', rule => add(definitions, rule));

  root.walkDecls(decl => {
    if (!HAS_CALL.test(decl.value) || decl.parent?.type === 'atrule' && decl.parent.name === 'function') return;

    let value;
    try   { value = expand(decl.value, new Map, definitions); }
    catch (error) { if (error instanceof Unresolved) return; throw error; }
    if (value === INVALID || tidy(value) === tidy(decl.value)) return;

    if (decl.prop.startsWith('--')) { decl.value = value; return; }

    const previous = decl.prev();
    if (previous?.type === 'decl' && previous.prop === decl.prop && tidy(previous.value) === tidy(value)) return;
    decl.cloneBefore({ value });
  });
}

// :::::: EXPORT

export { INVALID, call, definitionOf, definitionsIn, evaluate, expand, fits, lower };
