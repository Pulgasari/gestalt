// @gestalt/postcss
// @ts-self-types="./index.d.ts"

/*
gestalt in a build: what gestalt does in the page, done while building where it can be.

  // postcss.config.js
  import gestalt from '@gestalt/postcss';
  export default { plugins: [gestalt()] };

  directives   gestalt-typo, gestalt-flow …, gestalt-pattern, gestalt-filter, gestalt-webfont
               as plain css (directives.js)
  functions    calls of css custom functions (@function) written out for browsers without them
               (functions.js): gestalt's own (@gestalt/css/functions.css), the ones in the file,
               and the files given

options: directives (true), functions (true), files ([] more css files with @function rules),
baseUrl (where the webfonts are). runs in node: it reads the function files from disk.
*/

import { readFile }         from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath }    from 'node:url';

import { directives }              from './directives.js';
import { definitionsIn, lower }    from './functions.js';

const FUNCTIONS = fileURLToPath(new URL('../css/functions.css', import.meta.url));

function gestalt ({ baseUrl, directives: withDirectives = true, files = [], functions = true } = {}) {
  let definitions = null;   // read once per plugin, copied per file

  return {
    postcssPlugin : 'gestalt',

    async Once (root, { parse, result }) {
      if (withDirectives) await directives(root, { baseUrl, parse, result });
      if (!functions) return;
      definitions ??= definitionsIn([FUNCTIONS, ...files.map(file => resolve(file))], { dirname, parse, readFile, resolve });
      lower(root, new Map(await definitions));
    },
  };
}

gestalt.postcss = true;

// :::::: EXPORT

export { gestalt };
export default gestalt;
