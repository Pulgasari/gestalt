# @gestalt/syntax

status: v0. gestalt's few additions to css, compiled to plain css. only they are replaced, the rest stays the.text it was: comments, nesting, formatting. no dependencies, the same code in a page and in a build.

```js
import { compile } from '@gestalt/syntax';
compile(css);   // css
```

## `@spread`: properties over selectors

the properties are fixed, each line is a value and where it goes:

```css
@spread --gap, --pad {
  normal : .menu, .panel, .panel-empty, .panel-head, .panel-list, .panels, .player;
  small  : .player-controls, .row;
}
```

```css
.menu, .panel, .panel-empty, .panel-head, .panel-list, .panels, .player {
  --gap: normal;
  --pad: normal;
}
.player-controls, .row {
  --gap: small;
  --pad: small;
}
```

## `@val`: a value over properties

inside a rule, where a line would otherwise be property : value:

```css
.clean-button {
  @val red   : border-color, color;
  @val unset : margin, padding;
}
```

```css
.clean-button {
  border-color: red;
  color: red;
  margin: unset;
  padding: unset;
}
```

## `@mixin` and `@apply`

as the css mixins draft writes them: a block with a `--name`, its body where `@apply` names it. a rule that is.exactly one class is a mixin too (the first of that name).

```css
@mixin --vert {
  display   : flex;
  flex-flow : column;
}

.bold { font-weight: bold; }

.menu { @apply --vert .bold; }
```

```css
.bold { font-weight: bold; }

.menu {
  display   : flex;
  flex-flow : column;
  font-weight: bold;
}
```

- a mixin may `@apply` others, a cycle is dropped, an unknown name too
- definitions are found in the whole text, before or after their use
- no parameters yet (the draft has them)

properties in `@val` and `@spread` are split at commas or spaces.

## where it runs

- **a build:** `@gestalt/postcss` compiles it first, in every `.css` file and every `<style>` of a rat component
- **rat without a build:** `<style lang="gestalt">`

---

gestalt's few additions to css, compiled to plain css. only they are replaced, the rest stays the text it was (comments, nesting, formatting): a superset of css.

```css
  @spread --gap, --pad { /*the properties over selectors, a line per value: */
    normal : .menu, .panel, .player;        .menu, .panel, .player { --gap: normal; --pad: normal; }
    small  : .row;                          .row { --gap: small; --pad: small; }
  }

  .button {
    @val red   : border-color, color;     a value over properties: border-color: red; color: red;
    @val unset : margin, padding;
  }

  @mixin --vert {                         a block to reuse, as the css mixins draft writes it
    display: flex; flex-flow: column;
  }
  .menu { @apply --vert; @apply .bold; }  its body in place. a class is a mixin too: the first rule
```

```js
compile(css) -> css
```

properties in @val and @spread are split at commas or spaces. a mixin may @apply others, a cycle is.dropped. definitions are found in the whole text, before or after their use. no parameters for mixins.
