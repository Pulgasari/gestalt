# gestalt

erweiterbar via:
- plugins
- presets

weitere features:
- erweitern via definition eigener shorthands

# about

**gestalt** entstand aus dem umstand heraus, dass css zwar sehr vielseitig ist, aber gleichzeitig auch schnell messy wird. und alle mir bekannten tools lösen die probleme, die ich im umgang mit css habe, nur teilweise.

## in der praxis ...

... fungiert **gestalt** als configurator und controller für css (und svg).

# API sketch

## css

```css
:root {
  --gestalt-a11y     : reduced-motion high-contrast;
  --gestalt-geometry : soft;
  --gestalt-palette  : zombie;
}
```

was nich über pures css machbar ist, wird mit pseudo-css geregelt;

```css
div {
  gestalt-filter: glitch-live animate-true speed[2s];
  gestalt-pattern: dots;
}
```


unnötig?

```css
@gestalt-config {
  a11y     : reduced-motion high-contrast;
  geometry : soft;
  palette  : zombie;
}
```

## html + htx

```html
<app-root
  a11y='high-contrast reduced-motion'
  density=''
  geometry=''
  palette='zombie'>
  skin=''
>
  ...
</app-root>
```

## js

the intended way is to use it as prototypes extension so there is a `.gestalt` namespace under every dom-element/node.

```js
import '@gestalt/prototypes'
```

```js
element.gestalt.typo = '"Rubik Sans" uppercase italic 20px justify';
element.gestalt['typo']('"Rubik Sans" uppercase italic 20px justify');
element.gestalt['typo']('Rubik Sans', 'uppercase', 'italic', '20px', 'justify');
element.gestalt['typo']('Rubik Sans', 'uppercase', 'italic', [20, 'px'], 'justify');
```

on the global `gestalt` namespace one could set the base ...

```js
gestalt.typo = 'Texturina'; // sets base font
gestalt.typo.headings = '"Rubik Sans" 900-400'; // sets font on <h1> ti <h6> elements
```

additionally the global `gestalt` object provides some extra methods:

```js
gestalt.of('.sidebar .items').typo = 'italic';
```

#

## a11y

## density

## geometry

```md
# standard tokens
sharp
soft
rounded
pill

# dynamic
10px
10%
1rem
10px auto
10px auto 0.1
```

## layout

## palette

- builtin palettes
- any css named color
- any css color
- and some optional modifiers

```md
# builtin palettes
classic
oled
zombie
```

## skin

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

# packages

| package             | dir                                       | what |
|---------------------|-------------------------------------------|------|
| `@gestalt/core`     | [packages/core](packages/core)           | the controller: palette, mode, density, geometry, look, layout, skin |
| `@gestalt/css`      | [packages/css](packages/css)             | reset, functions, tokens, palettes, layouts, skins, animations |
| `@gestalt/filters`  | [packages/filters](packages/filters)     | svg, css, canvas and webgl filters |
| `@gestalt/patterns` | [packages/patterns](packages/patterns)   | svg patterns |
| `@gestalt/webfonts` | [packages/webfonts](packages/webfonts)   | fonts by name, google fonts |

formerly `@aufbau/gestalt`, `@aufbau/css`, `@aufbau/filters`, `@aufbau/patterns` and
`@aufbau/webfonts`.

planned, from the sketch above:

```
@gestalt/observer
@gestalt/processor
@gestalt/server
```
