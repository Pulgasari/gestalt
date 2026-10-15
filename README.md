# gestalt

erweiterbar via:
- plugins
- presets

weitere features:
- erweitern via definition eigener shorthands

# API sketch

## css

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

the intended way is to use it as prototypes extension so there is a `.gestalt` namespace under every dom-element.

```js
import '@gestalt/prototypes'
```

```js
element.gestalt.typo = '"Rubik Sans" uppercase italic 20px justify';
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

# packages

```
@gestalt/css
@gestalt/observer
```
