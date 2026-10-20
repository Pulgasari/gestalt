# todo

gestalt besteht auch wieder aus mehreren packages und APIs — teilweise sinds nur verschiedene Ansätze, wo sich dann zeigen soll, was in derPraxis taugt, teilweise aber auch bewusst multiple Wege.

Ich will nun zunächst erstmal die einfachen umsetzen.

## 1. Die CSS-Files

Wird als einzelne Datei eingebunden.



```css
@import url('https://code.pulgasari.dev/gestalt/packages/css/gestalt.css');
```

```html
<link rel='stylesheet' href='https://code.pulgasari.dev/gestalt/packages/css/gestalt.css' />
```

einbinden bringt:
- `reset.css`
- `palettes.css`
- utils: custom functions
- erster teil zum funktionieren der shorthands

damit sollte dann das grundsätzlich schon funktionieren:

```html
<html
  a11y='high-contrast reduced-motion'
  density=''
  geometry=''
  palette='zombie'
  skin=''
>
```

## 2.

```js
element.gestalt.typo = '"Rubik Sans" uppercase italic 20px justify';
```

```html
<div gestalt='typo: bold uppercase;' />
```

## 3. filters, patterns, webfonts

die 3 packages/APIs sind von `@aufbau` hierher gewandert. funktionieren grundsätzlich.

---



- [ ] Für `@gestalt/css` könnten wir im Repo noch ne GH-Action/Workflow einrichten, dass ein Script die CSS-Files bündelt und eine einzelne minifizierte Version in `packages/css/gestalt.min.css` ablegt. Ich hab keine Lust das immer manuell zu starten, also sollte es automatisch passieren. Falls möglich aber debounced, sodass es das nur 5 bis 10min seit der letzten Änderung ausführt an einer der CSS-Files. Die Liste der zu bündelnden Files sollte nich automatisch sein, sondern aus derv `repo.config.js` geholt werden. Das Script selbst mit iwo in `.github` liegen.
- [ ] wie müssen auch noch den webfonts-workflow aus dem aufbau-repo nach hier umziehen.
