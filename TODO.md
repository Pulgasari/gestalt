# todo

gestalt besteht auch wieder aus mehreren packages und APIs — teilweise sinds nur verschiedene Ansätze, wo sich dann zeigen soll, was in derPraxis taugt, teilweise aber auch bewusst multiple Wege.

Ich will nun zunächst erstmal die einfachen umsetzen.

## 1. Die CSS-Files

```css
@import url('https://code.pulgasari.dev/gestalt/packages/css/gestalt.css');
```

```html
<link rel='stylesheet' href='https://code.pulgasari.dev/gestalt/packages/css/gestalt.css' />
```

## 2.

```js
element.gestalt.typo = '"Rubik Sans" uppercase italic 20px justify';
```

```html
<div gestalt='typo: bold uppercase;' />
```
