# @gestalt/postcss

status: v0. gestalt in a build: what gestalt does in the page, done while building where it can be.

```js
// postcss.config.js
import gestalt from '@gestalt/postcss';
export default { plugins: [gestalt()] };
```

## directives

gestalt's declarations of its own become plain css:

```css
.title { gestalt-typo: serif bold 3rem/1.1; }
.hero  { gestalt-pattern: dots fg[#f00] size[12] motion[up]; }
.photo { gestalt-filter: blur amount[4]; }
:root  { gestalt-webfont: Texturina role[heading]; }
```

```css
@font-face { font-family: 'Texturina'; src: url('…/texturina-variable.ttf'); font-weight: 100 900; … }

.title { font-weight: 700; font-size: 3rem; line-height: 1.1; font-family: Georgia, serif; }
.hero  { background-image: url("data:image/svg+xml,…"); animation: aufbau-pattern-up-12 8s linear infinite; }
.photo { filter: blur(4px); }
:root  { --aufbau-font-heading: 'Texturina', serif; }

@keyframes aufbau-pattern-up-12 { to { background-position: 0px -12px; } }
```

- every shorthand group of `@gestalt/shorthands` (`gestalt-typo`, `gestalt-flow` …). unknown tokens are a warning
- a filter with only an svg backend needs its `<filter>` in the page: the declaration stays for the runtime, with a warning

## functions

calls of css custom functions (`@function`, chromium only for now) written out for the browsers without them:

```css
.a  { background-color: --alpha(cc, 0.1); padding: --space(small); }
.b  { --bg: --darker(bg, 0.2); }
```

```css
.a  { background-color: color-mix(in oklch, currentColor 10%, transparent); background-color: --alpha(cc, 0.1);
      padding: calc(var(--unit, 0.25rem) * 2); padding: --space(small); }
.b  { --bg: oklch(from var(--color-bg) max(0, l - 0.2) c h / alpha); }
```

- a property keeps the call and gets the expansion in front: a browser with `@function` takes the call, one
  without drops it and keeps the line above
- a custom property takes any value, a fallback in front would never show: its value is replaced
- the functions: gestalt's (`@gestalt/css/functions.css` and what it imports), the `@function` rules of the file
  itself, the files given in `files`
- the expansion follows the function: arguments (default when missing, checked against their type), locals and
  result in order, `if()` decided where it tests a parameter or a local, calls inside expanded too, `calc()` of
  plain numbers worked out, the result checked against `returns`
- a call stays as it is when that needs the page: an `if()` on a property of the page or on `color-scheme()`
  (`--light-dark`), an argument from `var()` that an `if()` tests (`--color(var(--x))`), a function nobody defined

## options

| | default | |
|---|---|---|
| `directives` | `true` | the directives above |
| `functions` | `true` | the function calls above |
| `files` | `[]` | more css files with `@function` rules |
| `baseUrl` | `https://code.pulgasari.dev/aufbau/webfonts` | where the webfont files are |

runs in node: it reads the function files from disk and imports `@gestalt/shorthands`, `patterns`, `filters` and
the font list of `webfonts` from the packages beside it.

## in rat

`@rat/dev` hands the `<style>` of every component through vite's css pipeline, so the project's
`postcss.config.js` reaches components as well as `.css` files. `rat/dev/apps/postcss.config.js` does that for
the apps.
