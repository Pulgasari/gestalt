// @gestalt/syntax :: parse

/*
css as a small tree with positions, comment and string aware, no dependencies: the same code runs in a
page and in a build. only what compile() needs to find and replace is told apart, everything else is
kept as the text it was.

  { type: 'rule',   selector, start, open, close, end, nodes }      selector { … }
  { type: 'atrule', name, params, start, open, close, end, nodes }  @name params { … }
  { type: 'atrule', name, params, start, end, nodes: null }         @name params;
  { type: 'decl',   prop, value, start, end }                       prop: value;

start is the first character of a node, end the index after its ; or }. open and close are the { and }.
*/

// the index after a closing quote, escapes skipped
function readString (code, at) {
  const quote = code[at++];
  while (at < code.length) {
    if (code[at] === '\\')  { at += 2; continue; }
    if (code[at] === quote) return at + 1;
    at++;
  }
  return at;
}

// the index after the ) of a ( at at: strings and comments inside are inert (url(), calc())
function readParen (code, at) {
  let depth = 0;
  while (at < code.length) {
    const char = code[at];
    if (char === '"' || char === "'")              { at = readString(code, at); continue; }
    if (char === '/' && code[at + 1] === '*')      { const end = code.indexOf('*/', at + 2); at = end < 0 ? code.length : end + 2; continue; }
    if (char === '(') depth++;
    else if (char === ')' && --depth === 0) return at + 1;
    at++;
  }
  return at;
}

// the index of the first or last : outside of strings and parens, -1 without one
export function colonIn (text, last = false) {
  let found = -1;
  for (let at = 0; at < text.length; at++) {
    const char = text[at];
    if (char === '"' || char === "'") { at = readString(text, at) - 1; continue; }
    if (char === '(')                 { at = readParen(text, at) - 1; continue; }
    if (char === ':') { found = at; if (!last) return at; }
  }
  return found;
}

// the head of a statement or a block, trimmed, with where its text starts
const headOf = (code, from, to) => {
  const raw   = code.slice(from, to);
  const start = from + raw.length - raw.trimStart().length;
  return { start, text: raw.trim() };
};

function nameOf (text) {
  const space = text.search(/[\s;]/);
  return space < 0 ? { name: text, params: '' } : { name: text.slice(0, space), params: text.slice(space).trim() };
}

function statement (code, from, to, end) {
  const { start, text } = headOf(code, from, to);
  if (!text) return null;
  if (text[0] === '@') return { ...nameOf(text), end, nodes: null, start, type: 'atrule' };
  const colon = colonIn(text);
  if (colon < 0) return null;
  return { end, prop: text.slice(0, colon).trim(), start, type: 'decl', value: text.slice(colon + 1).trim() };
}

function block (code, from, open, close, nodes) {
  const { start, text } = headOf(code, from, open);
  const base = { close, end: close + 1, nodes, open, start };
  return text[0] === '@' ? { ...base, ...nameOf(text), type: 'atrule' } : { ...base, selector: text, type: 'rule' };
}

// the nodes from at up to the } that closes them (or the end): [nodes, index of that }]
function nodesOf (code, at) {
  const nodes = [];
  let   from  = at;

  while (at < code.length) {
    const char = code[at];

    if (char === '/' && code[at + 1] === '*') {
      const end = code.indexOf('*/', at + 2);
      // a comment before a statement is not part of it
      if (!code.slice(from, at).trim()) from = end < 0 ? code.length : end + 2;
      at = end < 0 ? code.length : end + 2;
      continue;
    }
    if (char === '"' || char === "'") { at = readString(code, at); continue; }
    if (char === '(')                 { at = readParen(code, at); continue; }

    if (char === '{') {
      const [children, close] = nodesOf(code, at + 1);
      nodes.push(block(code, from, at, close, children));
      at = from = close + 1;
      continue;
    }
    if (char === ';') {
      const node = statement(code, from, at, at + 1);
      if (node) nodes.push(node);
      at = from = at + 1;
      continue;
    }
    if (char === '}') {
      const node = statement(code, from, at, at);   // a last statement without ;
      if (node) nodes.push(node);
      return [nodes, at];
    }
    at++;
  }

  const node = statement(code, from, at, at);
  if (node) nodes.push(node);
  return [nodes, at];
}

export function parse (source) {
  return nodesOf(String(source), 0)[0];
}

export default parse;
