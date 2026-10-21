// @gestalt/shorthands

/** One piece of a shorthand value. */
export type Token =
  | { type: 'string';   value: string; raw: string }
  | { type: 'function'; name: string; args: string; raw: string }
  | { type: 'option';   name: string; value: string; raw: string }
  | { type: 'word';     value: string; raw: string };

/** Css declarations: property -> value. A nested object is a nested rule (`'& > *': { … }`). */
export interface Declarations { [property: string]: string | number | Declarations; }

export interface Result {
  declarations : Declarations;
  /** The tokens the group did not understand, as written. */
  unknown      : string[];
}

/** Turns the tokens of one value into declarations. Knows nothing of elements or stylesheets. */
export type Group = (tokens: Token[]) => Result;

/** The groups by name: `flow`, `typo`, and every one added through `define()`. */
export declare const groups: Map<string, Group>;

/** Adds a group. Throws when the name exists. */
export declare function define(name: string, group: Group): void;
/** Calls `listener` for every group, the existing ones now, later ones when defined. Returns the unsubscribe. */
export declare function whenDefined(listener: (name: string) => void): () => void;

/** One value of one group. Cached: read the result, do not change it. */
export declare function compile(group: string, value: string): Result;
/** `'typo: bold; flow: grid 3'`: the declarations of every group in it. */
export declare function compileBlock(text: string): Result;
/** Css text with `gestalt-<group>: value;` (or `--gestalt-<group>`) declarations replaced by what they compile to. */
export declare function compileCSS(text: string): string;

/** `'"Rubik Sans" 20px/1.4 gap[small]'` -> tokens. */
export declare function tokenize(value: string): Token[];
/** Splits at `separator`, not inside quotes or brackets. */
export declare function split(source: string, separator: string): string[];
/** `'typo: bold; flow: grid 3'` -> `{ typo: 'bold', flow: 'grid 3' }`. */
export declare function parseBlock(text: string): Record<string, string>;
/** `selector { declarations }` as css text. */
export declare function toCSS(selector: string, declarations: Declarations): string;

/** The sheet every rule goes into, adopted by each document or shadow root that needs it. `null` outside the browser. */
export declare const sheet: CSSStyleSheet | null;
/** `gestalt`, `data-gestalt`, and `gestalt-<group>` / `data-gestalt-<group>` for every group. */
export declare function attributeNames(): string[];
/** The rule for one attribute of one element. */
export declare function render(element: Element, attribute: string): void;
/** Renders every gestalt attribute in `root`, `root` included. */
export declare function scan(root?: ParentNode): void;
/** `scan()`, then follows changed attributes and added elements. Returns the disconnect. */
export declare function observe(root?: Node): () => void;

/** `element.gestalt`, from `@gestalt/shorthands/element`. */
export interface Gestalt {
  /** The value of a group, from the attribute `gestalt-<group>`. */
  get(group: string): string | null;
  /** `null`, `false` or `''` removes. */
  set(group: string, value: string | null | false): this;
  set(values: Record<string, string | null | false>): this;
  /** One group, or all of them. */
  clear(group?: string): this;
  flow : string | null;
  typo : string | null;
  [group: string]: any;
}

declare global {
  interface Element { readonly gestalt: Gestalt; }
}
