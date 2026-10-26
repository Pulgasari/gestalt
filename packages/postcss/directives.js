// @gestalt/postcss :: directives

/*
gestalt's declarations of its own, turned into plain css while building:

  gestalt-typo    : serif bold 3rem/1.1;          the declarations of the shorthand group (typo, flow …)
  gestalt-pattern : dots fg[#f00] motion[up];     background-image (a data uri), animation and its @keyframes
  gestalt-filter  : blur amount[4];               filter, for a filter with a css backend
  gestalt-webfont : Texturina role[heading];      the @font-face rules, the role's property (--aufbau-font-heading)

a filter with only an svg backend needs its <filter> in the page: the declaration stays, for the runtime.
an unknown name or token is a warning, the declaration stays as it was.
*/

import { use as filter }           from '../filters/index.js';
import { Motion, use as pattern }  from '../patterns/index.js';
import { compile, groups }         from '../shorthands/index.js';
import { fonts }                   from '../webfonts/data.js';

const BASE_URL = 'https://code.pulgasari.dev/aufbau/webfonts';

// the properties of the roles, as @gestalt/webfonts has them (its index needs the dom)
const ROLES = {
  body    : '--aufbau-font',
  code    : '--aufbau-font-mono',
  heading : '--aufbau-font-heading',
  mono    : '--aufbau-font-mono',
  sans    : '--aufbau-font-sans',
  serif   : '--aufbau-font-serif',
};

const DIRECTIVE = /^gestalt-([\w-]+)$/;

// 'dots fg[#f00] size[12]' -> { name: 'dots', options: { fg: '#f00', size: 12 } }
function directiveOf (text) {
  const options = {};
  const name    = text.replace(/([\w-]+)\[([^\]]*)\]/g, (_, key, value) => { options[key] = valueOf(value.trim()); return ''; }).trim();
  return { name: name.replace(/^(['"])(.*)\1$/, '$2'), options };
}

const valueOf = text => text === 'true' ? true : text === 'false' ? false : text !== '' && !Number.isNaN(Number(text)) ? Number(text) : text;

// :::::: THE DIRECTIVES

const shorthand = (group, decl, { result }) => {
  const { declarations, unknown = [] } = compile(group, decl.value);
  if (unknown.length) decl.warn(result, `gestalt-${group}: unknown ${unknown.join(', ')}`);
  for (const [prop, value] of Object.entries(declarations)) decl.cloneBefore({ prop, value: String(value) });
  decl.remove();
};

async function patternOf (decl, { keyframes, parse }) {
  const { name, options: { motion, speed, timing, ...vars } } = directiveOf(decl.value);
  const tile = pattern(name, vars);
  decl.cloneBefore({ prop: 'background-image', value: await tile.image() });
  if (motion) {
    const moving = new Motion(motion, { size: vars.size ?? tile.meta.vars.size?.default, speed, timing });
    if (!keyframes.has(moving.name)) keyframes.set(moving.name, parse(moving.keyframes));
    decl.cloneBefore({ prop: 'animation', value: moving.animation });
  }
  decl.remove();
}

async function filterOf (decl, { result }) {
  const { name, options } = directiveOf(decl.value);
  const css = await filter(name, options).css();
  if (!css) return decl.warn(result, `gestalt-filter: ${name} has no css backend, its <filter> is made in the page`);
  decl.replaceWith(decl.clone({ prop: 'filter', value: css }));
}

function webfontOf (decl, { faces, baseUrl }) {
  const { name, options } = directiveOf(decl.value);
  const font = fonts.find(font => font.id === name || font.name === name);
  if (!font) throw new Error(`unknown font "${name}"`);

  for (const face of font.faces) {
    const src = /^https?:\/\//.test(face.file) ? face.file : `${baseUrl}/${face.file}`;
    if (!faces.has(src)) faces.set(src, `@font-face { font-family: '${font.name}'; src: url('${src}'); font-weight: ${face.weight ?? 400}; font-style: ${face.style ?? 'normal'}; font-display: ${face.display ?? 'swap'}; }`);
  }

  const role     = options.role ?? (font.category === 'mono' ? 'mono' : 'body');
  const property = role.startsWith('--') ? role : ROLES[role] ?? `--aufbau-font-${role}`;
  decl.replaceWith(decl.clone({ prop: property, value: `'${font.name}', ${options.fallback ?? font.fallback ?? 'sans-serif'}` }));
}

// :::::: THE PASS

async function directives (root, { baseUrl = BASE_URL, parse, result }) {
  const keyframes = new Map;   // name -> its rule
  const faces     = new Map;   // src -> its @font-face
  const pending   = [];

  root.walkDecls(DIRECTIVE, decl => pending.push(decl));

  for (const decl of pending) {
    const kind = decl.prop.match(DIRECTIVE)[1];
    try {
      if (groups.has(kind))       shorthand(kind, decl, { result });
      else if (kind === 'pattern') await patternOf(decl, { keyframes, parse });
      else if (kind === 'filter')  await filterOf(decl, { result });
      else if (kind === 'webfont') webfontOf(decl, { baseUrl, faces });
    }
    catch (error) { decl.warn(result, `${decl.prop}: ${error.message}`); }
  }

  if (faces.size)     root.prepend(parse([...faces.values()].join('\n')));
  if (keyframes.size) root.append(...keyframes.values());
}

// :::::: EXPORT

export { directiveOf, directives };
