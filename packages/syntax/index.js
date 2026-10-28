// @gestalt/syntax
// @ts-self-types="./index.d.ts"

// :::::: IMPORT

import { colonIn, parse } from './parse.js';

const listOf = text => text.split(/[\s,]+/).filter(Boolean);

// the indentation of the line a position is on
const indentAt = (code, at) => code.slice(code.lastIndexOf('\n', at - 1) + 1, at).match(/^[ \t]*/)[0];

// between what replaces a node: a line each where the node had a line of its own, else a space
const joinAt = (code, at) => /^[ \t]*$/.test(code.slice(code.lastIndexOf('\n', at - 1) + 1, at)) ? `\n${indentAt(code, at)}` : ' ';

// :::::: MIXINS

// --name of @mixin, and every rule that is exactly one class, the first one of a name wins
function mixinsOf (nodes, code, found = new Map) {
  for (const node of nodes) {
    if (node.type === 'atrule' && node.name === '@mixin' && node.nodes) {
      const name = node.params.trim();
      if (!found.has(name)) found.set(name, code.slice(node.open + 1, node.close));
    }
    if (node.type === 'rule' && /^\.[-\w]+$/.test(node.selector) && !found.has(node.selector)) found.set(node.selector, code.slice(node.open + 1, node.close));
    if (node.nodes) mixinsOf(node.nodes, code, found);
  }
  return found;
}

// a body, compiled itself (its own @apply, @val), without its outer blank lines, at an indentation
function inline (body, mixins, seen, indent) {
  const lines = render(body, parse(body), mixins, seen).replace(/^\s*\n/, '').trimEnd().split('\n');
  const base  = Math.min(...lines.filter(line => line.trim()).map(line => line.match(/^[ \t]*/)[0].length));
  return lines.map((line, index) => line.trim() ? (index ? indent : '') + line.slice(base) : '').join('\n');
}

// :::::: THE CONSTRUCTS

function apply (node, code, mixins, seen) {
  const indent = indentAt(code, node.start);
  const bodies = [];
  for (const name of listOf(node.params)) {
    if (!mixins.has(name) || seen.has(name)) continue;   // unknown, or a cycle: dropped
    bodies.push(inline(mixins.get(name), mixins, new Set([...seen, name]), indent));
  }
  return bodies.join(joinAt(code, node.start));
}

function val (node, code) {
  const colon = colonIn(node.params, true);
  if (colon < 0) return code.slice(node.start, node.end);
  const value = node.params.slice(0, colon).trim();
  return listOf(node.params.slice(colon + 1)).map(prop => `${prop}: ${value};`).join(joinAt(code, node.start));
}

function spread (node, code) {
  const indent = indentAt(code, node.start);
  const props  = listOf(node.params);
  return node.nodes.filter(line => line.type === 'decl').map(line => {
    const decls = props.map(prop => `${indent}  ${prop}: ${line.prop};`).join('\n');
    return `${line.value} {\n${decls}\n${indent}}`;
  }).join(`\n${indent}`);
}

// :::::: RENDER

// the text from start to end with every construct inside replaced
function render (code, nodes, mixins, seen = new Set, start = 0, end = code.length) {
  let out = '', at = start;
  for (const node of nodes) {
    const text = renderNode(code, node, mixins, seen);
    out += code.slice(at, node.start) + text;
    at = node.end;
    // a definition that is gone takes its line along
    if (!text) at += code.slice(at).match(/^[ \t]*\n?/)[0].length;
  }
  return out + code.slice(at, end);
}

function renderNode (code, node, mixins, seen) {
  if (node.type === 'atrule') {
    if (node.name === '@mixin' && node.nodes) return '';
    if (node.name === '@apply' && !node.nodes) return apply(node, code, mixins, seen);
    if (node.name === '@val'   && !node.nodes) return val(node, code);
    if (node.name === '@spread' && node.nodes) return spread(node, code);
  }
  if (!node.nodes) return code.slice(node.start, node.end);
  return code.slice(node.start, node.open + 1) + render(code, node.nodes, mixins, seen, node.open + 1, node.close) + '}';
}

const CONSTRUCTS = /@(?:apply|mixin|spread|val)\b/;

export function compile (source) {
  const code = String(source);
  if (!CONSTRUCTS.test(code)) return code;
  const nodes = parse(code);
  return render(code, nodes, mixinsOf(nodes, code));
}

export { parse };
export default compile;
