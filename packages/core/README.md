# @gestalt/core

the appearance of a page as a whole: palette, mode, density, geometry,
look, layout and skin: one controller to set them. the stylesheets that read them
are `@gestalt/css`.

```js
import { gestalt } from '@gestalt/core';

await gestalt.set({ palette: 'oled', mode: 'dark', density: 'touch', geometry: 'round' });
gestalt.get('palette');     // 'oled'
gestalt.colors();           // { bg, fg, ink } as the browser computed them
await gestalt.palettes();   // the preset names of palettes.css
```

`www/boot.js` hands the same controller on to the pages of the site.

## files

| file          | what it is |
|---------------|------------|
| `index.js`    | the controller |
| `animate/`    | the js over the animations (`data-animate`) |
| `engine/`     | experimental, do not use |

the stylesheets it sets and reads (`gestalt.css`, `palettes.css`, `themes.css`, `skins/`,
`layouts/`, `animate/*.css`, `engine/*.css`) are [`@gestalt/css`](../css). `CSS_PATH` and
`GESTALT_PATH` point there.
