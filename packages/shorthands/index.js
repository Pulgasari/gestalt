// @gestalt/shorthands
// @ts-self-types="./index.d.ts"
//
// shorthand values -> css. one compiler, three ways in:
//   attributes        <div gestalt-typo='bold uppercase'>, <div gestalt='typo: bold; flow: grid 3'>   observe()
//   element.gestalt   el.gestalt.typo = '"Rubik Sans" italic 20px'                                     import '@gestalt/shorthands/element'
//   css text          div { gestalt-typo: bold uppercase; }                                            compileCSS()

import { define } from './compile.js';
import flow     from './groups/flow.js';
import typo     from './groups/typo.js';

define('flow', flow);
define('typo', typo);

export { compile, compileBlock, compileCSS, define, groups, whenDefined } from './compile.js';
export { attributeNames, observe, render, scan, sheet }                   from './render.js';
export { toCSS }                                                           from './shared.js';
export { parseBlock, split, tokenize }                                     from './tokenize.js';
