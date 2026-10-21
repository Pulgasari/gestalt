# @gestalt/runtime

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
  gestalt-filter: glitch-live animate[true] speed[2s];
  gestalt-pattern: dots;
  gestalt-webfont: Texturina;
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

```html
<div gestalt='typo: bold uppercase;' />
```

## js

the intended way is to use it as prototypes extension so there is a `.gestalt` namespace under every dom-element/node.

```js
import '@gestalt/prototypes'
```

```js
element.gestalt.typo = '"Rubik Sans" uppercase italic 20px justify';
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

