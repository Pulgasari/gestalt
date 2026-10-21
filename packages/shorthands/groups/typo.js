// @gestalt/shorthands/groups/typo.js
// '"Rubik Sans" sans uppercase italic 20px/1.4 justify'
//   strings and sans | serif | mono  font-family, in their order
//   20px, 1.2rem, clamp(…)           font-size, with /1.4 also line-height
//   100 … 900, thin … heavy          font-weight
//   #fff, rgb(…), red                color
//   key[value]                       one property: size, leading, tracking, weight, family, color, align, indent, spacing

import { isColor, isLength, quote } from '../shared.js';

const FAMILIES = {
  mono  : 'ui-monospace, monospace',
  sans  : 'system-ui, sans-serif',
  serif : 'Georgia, serif',
};

const OPTIONS = {
  align    : 'text-align',
  color    : 'color',
  family   : 'font-family',
  indent   : 'text-indent',
  leading  : 'line-height',
  size     : 'font-size',
  spacing  : 'word-spacing',
  tracking : 'letter-spacing',
  weight   : 'font-weight',
};

// no 'black' for 900: black is a color
const WEIGHTS = {
  bold       : 700,
  bolder     : 'bolder',
  extrabold  : 800,
  extralight : 200,
  heavy      : 900,
  light      : 300,
  lighter    : 'lighter',
  medium     : 500,
  regular    : 400,
  semibold   : 600,
  thin       : 100,
};

const words = (list, property) => Object.fromEntries(list.map(word => [word, { [property]: word }]));

export const KEYWORDS = {
  ...words(['center', 'end', 'justify', 'left', 'right', 'start'], 'text-align'),
  ...words(['ltr', 'rtl'], 'direction'),
  ...words(['italic', 'oblique'], 'font-style'),
  ...words(['condensed', 'expanded', 'extra-condensed', 'extra-expanded', 'semi-condensed', 'semi-expanded', 'ultra-condensed', 'ultra-expanded'], 'font-stretch'),
  ...words(['all-petite-caps', 'all-small-caps', 'petite-caps', 'small-caps', 'titling-caps', 'unicase'], 'font-variant-caps'),
  ...words(['capitalize', 'lowercase', 'uppercase'], 'text-transform'),
  ...words(['line-through', 'overline', 'underline'], 'text-decoration-line'),
  ...words(['balance', 'pretty'], 'text-wrap'),
  ...Object.fromEntries(Object.entries(WEIGHTS).map(([word, weight]) => [word, { 'font-weight': weight }])),
  hyphens  : { hyphens: 'auto' },
  nowrap   : { 'white-space': 'nowrap' },
  tabular  : { 'font-variant-numeric': 'tabular-nums' },
  truncate : { overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' },
};

// 20px, 20px/1.4, 1rem/1.5rem
function size (token, declarations) {
  if (token.type !== 'word' || !token.raw.includes('/')) return isLength(token) && (declarations['font-size'] = token.raw);
  const [fontSize, lineHeight] = token.raw.split('/');
  if (!isLength({ type: 'word', raw: fontSize }) || !/^[\d.]+[a-z%]*$/i.test(lineHeight)) return false;
  declarations['font-size']   = fontSize;
  declarations['line-height'] = lineHeight;
  return true;
}

export default function typo (tokens) {
  const declarations = {};
  const families     = [];
  const unknown      = [];

  for (const token of tokens) {
    const word = token.type === 'word' ? token.value : null;

         if (token.type === 'string')                  families.push(quote(token.value));
    else if (token.type === 'option' && OPTIONS[token.name]) declarations[OPTIONS[token.name]] = token.value;
    else if (word in FAMILIES)                         families.push(FAMILIES[word]);
    else if (word in KEYWORDS)                         Object.assign(declarations, KEYWORDS[word]);
    else if (/^[1-9]00$/.test(word))                   declarations['font-weight'] = Number(word);
    else if (size(token, declarations))                continue;
    else if (isColor(token))                           declarations.color = token.raw;
    else                                               unknown.push(token.raw);
  }

  if (families.length) declarations['font-family'] = families.join(', ');
  return { declarations, unknown };
}
