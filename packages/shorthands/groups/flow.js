// @gestalt/shorthands/groups/flow.js
// 'grid 3', 'grid 3x2 gap[small]', 'grid 200px auto-fit', 'flex col wrap center', 'masonry', 'grid 4 square'
//   flex grid block none …          display
//   3                               3 equal columns
//   3x2                             3 columns, 2 rows (width x height)
//   200px auto-fit, auto-fill 200px columns of at least 200px, as many as fit
//   masonry                         grid with masonry rows
//   row col row-reverse col-reverse direction: flex-direction, or the grid's auto flow
//   wrap nowrap wrap-reverse        flex-wrap
//   dense                           grid-auto-flow dense
//   center                          both axes; between around evenly: the main axis; start end stretch baseline: the cross axis
//   items-center justify-between …  one property: content- items- justify- place- self-
//   square landscape portrait 16:9  aspect-ratio of the children
//   a length left over              gap
//   key[value]                      gap, cols, rows, areas, ratio
//
// display follows from what is given: columns, rows, dense or masonry make a grid,
// direction or wrap a flex box. flex or grid named explicitly always win

import { isLength } from '../shared.js';

const DISPLAYS   = ['block', 'contents', 'flex', 'grid', 'inline', 'inline-block', 'inline-flex', 'inline-grid', 'none'];
const DIRECTIONS = { col: 'column', 'col-reverse': 'column-reverse', column: 'column', 'column-reverse': 'column-reverse', row: 'row', 'row-reverse': 'row-reverse' };
const WRAPS      = ['nowrap', 'wrap', 'wrap-reverse'];
const RATIOS     = { landscape: '16 / 9', portrait: '9 / 16', square: '1 / 1' };
const SPACES     = ['tiny', 'small', 'normal', 'large', 'huge'];

const PLACES = {
  around   : 'space-around',
  baseline : 'baseline',
  between  : 'space-between',
  center   : 'center',
  end      : 'end',
  evenly   : 'space-evenly',
  start    : 'start',
  stretch  : 'stretch',
};

const PREFIXES = {
  content : 'align-content',
  items   : 'align-items',
  justify : 'justify-content',
  place   : 'place-items',
  self    : 'align-self',
};

const MAIN = ['around', 'between', 'evenly'];

const isGrid  = display => display?.endsWith('grid');
const isFlex  = display => display?.endsWith('flex');
const toRatio = text => text.replace(/\s*[:/]\s*/, ' / ');

// a number or a size name goes through gestalt.css (--gap), a length is set as it is
const gapOf = value => /^\d+(\.\d+)?$/.test(value) || SPACES.includes(value) ? { '--gap': value } : { gap: value };

export default function flow (tokens) {
  const state   = { align: {}, cols: null, dense: false, direction: null, display: null, explicit: false, gap: null, length: null, ratio: null, rows: null, wrap: null };
  const unknown = [];

  for (let index = 0; index < tokens.length; index++) {
    const token  = tokens[index];
    const word   = token.type === 'word' ? token.value : null;
    const prefix = word?.match(/^(content|items|justify|place|self)-(.+)$/);

         if (DISPLAYS.includes(word))       { state.display = word; state.explicit = true; }
    else if (word === 'masonry')            state.rows = 'masonry';
    else if (word in DIRECTIONS)            state.direction = DIRECTIONS[word];
    else if (WRAPS.includes(word))          state.wrap = word;
    else if (word === 'dense')              state.dense = true;
    else if (/^\d+$/.test(word))            state.cols = `repeat(${word}, minmax(0, 1fr))`;
    else if (/^\d+x\d+$/i.test(word))       { const [cols, rows] = word.toLowerCase().split('x'); state.cols = `repeat(${cols}, minmax(0, 1fr))`; state.rows = `repeat(${rows}, minmax(0, 1fr))`; }
    else if (word === 'auto-fit' || word === 'auto-fill') {
      let min = state.length;
      if (min) state.length = null;
      else if (tokens[index + 1] && isLength(tokens[index + 1])) min = tokens[++index].raw;
      state.cols = `repeat(${word}, minmax(min(${min ?? '12rem'}, 100%), 1fr))`;
    }
    else if (word in PLACES) {
      if (word === 'center')        state.align['justify-content'] = state.align['align-items'] = 'center';
      else if (MAIN.includes(word)) state.align['justify-content'] = PLACES[word];
      else                          state.align['align-items'] = PLACES[word];
    }
    else if (prefix)                        state.align[PREFIXES[prefix[1]]] = PLACES[prefix[2]] ?? prefix[2];
    else if (word in RATIOS)                state.ratio = RATIOS[word];
    else if (/^\d+\s*[:/]\s*\d+$/.test(word)) state.ratio = toRatio(word);
    else if (isLength(token))               state.length = token.raw;
    else if (token.type === 'option') {
      if (token.name === 'gap')        state.gap = token.value;
      else if (token.name === 'cols')  state.cols = /^\d+$/.test(token.value) ? `repeat(${token.value}, minmax(0, 1fr))` : token.value;
      else if (token.name === 'rows')  state.rows = /^\d+$/.test(token.value) ? `repeat(${token.value}, minmax(0, 1fr))` : token.value;
      else if (token.name === 'areas') state.areas = token.value;
      else if (token.name === 'ratio') state.ratio = toRatio(token.value);
      else                             unknown.push(token.raw);
    }
    else unknown.push(token.raw);
  }

  // :::::: RESOLVE

  if (!state.explicit) {
    if (state.cols || state.rows || state.dense || state.areas) state.display = 'grid';
    else if (state.direction || state.wrap)                     state.display = 'flex';
  }

  const declarations = {};
  if (state.display) declarations.display = state.display;

  if (isGrid(state.display)) {
    if (state.cols)  declarations['grid-template-columns'] = state.cols;
    if (state.rows)  declarations['grid-template-rows']    = state.rows;
    if (state.areas) declarations['grid-template-areas']   = state.areas;
    if (state.direction || state.dense) declarations['grid-auto-flow'] = [state.direction?.startsWith('column') ? 'column' : 'row', state.dense && 'dense'].filter(Boolean).join(' ');
    if (state.wrap) unknown.push(state.wrap);
  } else {
    if (state.direction) declarations['flex-direction'] = state.direction;
    if (state.wrap)      declarations['flex-wrap']      = state.wrap;
    for (const [key, value] of [['cols', state.cols], ['rows', state.rows], ['dense', state.dense], ['areas', state.areas]]) if (value && isFlex(state.display)) unknown.push(key);
  }

  Object.assign(declarations, state.align);

  const gap = state.gap ?? state.length;
  if (gap) Object.assign(declarations, gapOf(gap));
  if (state.ratio) declarations['& > *'] = { 'aspect-ratio': state.ratio };

  return { declarations, unknown };
}
