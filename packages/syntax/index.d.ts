// @gestalt/syntax

export type Node =
  | { type: 'rule';   selector: string; start: number; open: number; close: number; end: number; nodes: Node[] }
  | { type: 'atrule'; name: string; params: string; start: number; open?: number; close?: number; end: number; nodes: Node[] | null }
  | { type: 'decl';   prop: string; value: string; start: number; end: number };

/** css with @spread, @val, @mixin and @apply in it, as plain css. the rest stays the text it was. */
export declare function compile (css: string): string;

/** css as a tree with positions, comment and string aware. */
export declare function parse (css: string): Node[];

export default compile;
