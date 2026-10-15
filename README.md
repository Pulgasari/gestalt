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

## skin

# groups | shorthands

## colors

## flow

## fx
```
glitch
```

## shadow

## surface

## typo

# packages

```
@gestalt/css
@gestalt/observer
```
