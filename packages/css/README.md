# @gestalt/css

the css of gestalt, no javascript (that is [`@gestalt/core`](../core)).

```md
aufbau.css      the entry: layers, functions, reset and the gestalt sheets
functions.css   the custom functions, functions/*.css
reset.css
gestalt.css     the axes as tokens (palette, scheme, density, geometry …)
palettes.css    the palette presets
themes.css
animate/        functions, keyframes, animations
engine/         flow, space, typo
layouts/        landing, mobile-basic, three-panels
skins/          andromeda, monochrome
```

the entry and the layer names (`aufbau.reset`, `aufbau.tokens`, …) keep their aufbau names for
now: `@aufbau/elements` and `@domina/element` adopt into those layers.

## shorthand props

```css
/* with shorthands */
div {
  --bg  : black;
  --fg  : white;
  --ink : red;
}

/* without shorthands */
div {
  background-color : black;
  color            : white;
  accent-color     : red;
}
```

## functions.css

custom functions for the design system. chromium only for now, a browser without them drops the declaration, so a plain value in front stays the fallback:

```css
color: var(--accent);
color: --darker(var(--accent));
```

parameters default to the tokens (`--bg`, `--fg`, `--accent`, `--unit`, `--ratio`, …), each with a fallback of its own, so the functions work before `tokens.css` is there and follow a theme once it is.
