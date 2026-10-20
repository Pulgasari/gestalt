# @gestalt/shorthands

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

