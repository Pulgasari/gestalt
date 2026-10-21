# @gestalt/shorthands

status: v0. groups: `typo`, `flow`. the concept below stays as it was written.

## how it works

one compiler, three ways in. all of them end in the same declarations.

```
value ──tokenize──▶ tokens ──group──▶ { declarations, unknown }
                                            │
          ┌─────────────────────────────────┼──────────────────────────────┐
          ▼                                 ▼                              ▼
   attribute: a rule per value     element.gestalt: writes the       css text: gestalt-typo: …
   in one adopted sheet            attribute, renders its rule       becomes real declarations
```

| file | job |
|---|---|
| `tokenize.js` | value → tokens: strings, functions, `key[value]` options, words. `gestalt='…'` blocks → groups |
| `compile.js` | the registry (`define`), `compile`, `compileBlock`, `compileCSS`, a cache per value |
| `groups/typo.js`, `groups/flow.js` | tokens → declarations |
| `render.js` | attributes → rules in one constructed sheet, `@layer aufbau.utilities`; `scan`, `observe` |
| `element.js` | `element.gestalt` (import for the side effect) |

## api

```js
import { compile, observe } from '@gestalt/shorthands';

compile('typo', '"Rubik Sans" sans uppercase italic 20px/1.4 justify').declarations;
// { 'font-family': '"Rubik Sans", system-ui, sans-serif', 'text-transform': 'uppercase',
//   'font-style': 'italic', 'font-size': '20px', 'line-height': '1.4', 'text-align': 'justify' }

observe();   // every gestalt attribute in the document, now and later
```

```html
<div gestalt-typo='bold uppercase'>…</div>
<div gestalt='typo: bold uppercase; flow: grid 3 gap[small]'>…</div>
<div data-gestalt-flow='flex col center'>…</div>
```

```js
import '@gestalt/shorthands/element';

element.gestalt.typo = '"Rubik Sans" uppercase italic 20px justify';
element.gestalt.set({ flow: 'grid 200px auto-fit', typo: 'mono 14px' });
element.gestalt.clear('typo');
```

```js
import { compileCSS } from '@gestalt/shorthands';

compileCSS('h1 { gestalt-typo: serif bold 3rem/1.1 balance; }');
// 'h1 { font-weight: 700; font-size: 3rem; line-height: 1.1; text-wrap: balance; font-family: Georgia, serif; }'
```

- **a rule per distinct value**, shared by every element with that value. the selector is the attribute itself (`[gestalt-typo="bold uppercase"]`), so the value stays readable in the dom and the page's own css wins over the layer. rules are never removed.
- **shadow roots**: the sheet is adopted by the root of each rendered element, a document or a shadow root.
- **unknown tokens** are reported once per value (`console.warn`) and in `unknown` of the result.
- `shorthands/typo.css` in `@gestalt/css` covers the keyword part of `gestalt-typo` without js (`[gestalt-typo~='bold']`). sizes, fonts and colors need the compiler.

### typo

| written | css |
|---|---|
| `"Rubik Sans"`, `sans`, `serif`, `mono` | `font-family`, in their order |
| `20px`, `1.2rem`, `clamp(…)`, `20px/1.4` | `font-size`, with `/` also `line-height` |
| `100` … `900`, `thin` `extralight` `light` `regular` `medium` `semibold` `bold` `extrabold` `heavy` `bolder` `lighter` | `font-weight` (no `black`: that is a color) |
| `#fff`, `rgb(…)`, `oklch(…)`, a named color (browser only) | `color` |
| `left` `right` `center` `justify` `start` `end` | `text-align` |
| `uppercase` `lowercase` `capitalize` | `text-transform` |
| `italic` `oblique` | `font-style` |
| `condensed` … `ultra-expanded` | `font-stretch` |
| `small-caps` `all-small-caps` `petite-caps` `all-petite-caps` `titling-caps` `unicase` | `font-variant-caps` |
| `underline` `overline` `line-through` | `text-decoration-line` |
| `balance` `pretty` | `text-wrap` |
| `ltr` `rtl` | `direction` |
| `hyphens`, `nowrap`, `tabular`, `truncate` | `hyphens: auto`, `white-space: nowrap`, tabular numbers, one line with an ellipsis |
| `size[…]` `leading[…]` `tracking[…]` `weight[…]` `family[…]` `color[…]` `align[…]` `indent[…]` `spacing[…]` | one property each |

### flow

| written | css |
|---|---|
| `flex` `grid` `block` `none` `inline-flex` … | `display` |
| `3` | `grid-template-columns: repeat(3, minmax(0, 1fr))` |
| `3x2` | 3 columns, 2 rows (width x height) |
| `200px auto-fit`, `auto-fill 200px` | columns of at least 200px, as many as fit |
| `masonry` | `grid-template-rows: masonry` |
| `row` `col` `row-reverse` `col-reverse` | `flex-direction`, in a grid `grid-auto-flow` |
| `wrap` `nowrap` `wrap-reverse` | `flex-wrap` |
| `dense` | `grid-auto-flow: … dense` |
| `center` | both axes |
| `between` `around` `evenly` | `justify-content` |
| `start` `end` `stretch` `baseline` | `align-items` |
| `items-center`, `justify-between`, `content-…`, `place-…`, `self-…` | that property |
| `square` `landscape` `portrait` `16:9` `ratio[4/3]` | `aspect-ratio` of the children |
| a length left over, `gap[…]` | `gap`; a number or `tiny` … `huge` goes to `--gap` of `@gestalt/css` |
| `cols[…]` `rows[…]` `areas[…]` | the grid templates (a number becomes equal tracks) |

display follows from what is given: columns, rows, dense or masonry make a grid, a direction or wrap a flex box. `flex` or `grid` named explicitly always win.

### a group of your own

```js
import { define } from '@gestalt/shorthands';

define('shadow', tokens => {
  const word = tokens[0]?.value;
  return word === 'off'
    ? { declarations: { 'box-shadow': 'none' }, unknown: [] }
    : { declarations: { 'box-shadow': '0 1px 3px rgb(0 0 0 / 0.3)' }, unknown: tokens.slice(1).map(token => token.raw) };
});
```

groups defined after `observe()` are not observed; define them first.

---

## grundprinzip

die wichtigsten eigenschaften für design und layout einer app/webseite oder eines containers, lassen sich in ein paar wenige kategorien gruppieren. 

in css muss man sich oft die finger brechen und schreibt massenweise redundanten code.

1. man schreibt pseudo-shorthand-rules:

```css
gestalt-colors
gestalt-flow
gestalt-shadows
gestalt-surface
gestalt-typo
gestalt-vfx
```

2. deren content landet dann beim selector als attribut am element und wird dann zum teil durch pures css gehandlet (siehe `@gestalt/css/shorthands.css`), ein teil muss aber mithilfe von js verarbeitet werden.
- parsen
- als sub-attribute einfügen
- css kann diese dann mit `attr()` verarbeiten

ABER mittlerweile glaube ich fast, dass es aufgrund der ubgmaublichen redundanz von css fast besser wäre via  js zu regeln, zumal es js ja sowieso brauchen wird.
- 1. observer erfasst `gestalt`-attribute an elementen sowie `gestalt-*`-rules in `<style>`-elementen
2. gibt deren content und context an parser, der die dann zerlegt usw
   

---

# groups | shorthands

## colors

## flow
```
grid 10
grid 10|3
grid 200px auto-fit
flex col
flex row wrap
masonry
```

## fx
```
glitch
```

## shadow
```
on
off
fg[0 0 5px black]
```

## surface
```
black
pattern 'dots' 20px 45deg
```

## typo
```
default
uppercase
'Rubik Sans' bold uppercase
google('Texturina') 200 italic
```

