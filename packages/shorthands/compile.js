// @gestalt/shorthands/compile.js
// the registry of groups and the compiler: a shorthand value -> css declarations.
// a group is a function (tokens) -> { declarations, unknown }. it knows nothing of
// elements or stylesheets, so the same result serves attributes, element.gestalt and css text

import { merge, toCSS } from './shared.js';
import { parseBlock, tokenize } from './tokenize.js';

export const groups = new Map;

const cache     = new Map;   // 'group\nvalue' -> result
const listeners = new Set;

export function define (name, group) {
  if (groups.has(name)) throw new Error(`[gestalt] the group ${name} exists`);
  groups.set(name, group);
  for (const listener of listeners) listener(name);
}

// called for every group, the existing ones now, later ones when they are defined
export function whenDefined (listener) {
  listeners.add(listener);
  for (const name of groups.keys()) listener(name);
  return () => listeners.delete(listener);
}

// the result is cached and shared: read it, do not change it
export function compile (name, value) {
  const group = groups.get(name);
  if (!group) return { declarations: {}, unknown: [`${name}:`] };

  const key = `${name}\n${value}`;
  if (!cache.has(key)) cache.set(key, group(tokenize(value)));
  return cache.get(key);
}

// 'typo: bold; flow: grid 3' -> the declarations of both groups
export function compileBlock (text) {
  const declarations = {};
  const unknown      = [];
  for (const [name, value] of Object.entries(parseBlock(text))) {
    const result = compile(name, value);
    merge(declarations, result.declarations);
    unknown.push(...result.unknown);
  }
  return { declarations, unknown };
}

// css text: every `gestalt-<group>: value;` (or --gestalt-<group>) becomes the declarations.
// an unknown group stays as it is
const PSEUDO = /(^|[{;\s])(?:--)?gestalt-([\w-]+)\s*:\s*([^;{}]+?)\s*(?:;|(?=}))/g;

export function compileCSS (text) {
  return String(text).replace(PSEUDO, (match, before, name, value) => {
    if (!groups.has(name)) return match;
    const css = toCSS('', compile(name, value).declarations);
    return before + css.slice(css.indexOf('{') + 1, css.lastIndexOf('}')).trim();
  });
}
