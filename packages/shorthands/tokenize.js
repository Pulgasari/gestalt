// @gestalt/shorthands/tokenize.js
// a shorthand value into tokens, a gestalt='…' block into its groups.
//
//   "Rubik Sans"   string    { type, value: 'Rubik Sans', raw }
//   clamp(1rem, …) function  { type, name: 'clamp', args: '1rem, …', raw }
//   gap[small]     option    { type, name: 'gap', value: 'small', raw }
//   anything else  word      { type, value, raw }       20px/1.4, 3x2, 16:9, bold

const SPACE = /\s/;

// index of the quote that closes the one at start, or the last index
function closing (source, start) {
  const quote = source[start];
  let index   = start + 1;
  while (index < source.length && source[index] !== quote) index += source[index] === '\\' ? 2 : 1;
  return Math.min(index, source.length - 1);
}

// index of the bracket that closes the one at start, nested brackets and quotes skipped
function balanced (source, start) {
  const open  = source[start];
  const close = open === '(' ? ')' : ']';
  let depth   = 0;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    if (char === '"' || char === "'") index = closing(source, index);
    else if (char === open)           depth++;
    else if (char === close && !--depth) return index;
  }
  return source.length - 1;
}

function classify (raw) {
  const option = raw.match(/^([\w-]+)\[([\s\S]*)\]$/);
  if (option) return { type: 'option', name: option[1], value: option[2].trim(), raw };

  const fn = raw.match(/^([\w-]+)\(([\s\S]*)\)$/);
  if (fn) return { type: 'function', name: fn[1], args: fn[2].trim(), raw };

  return { type: 'word', value: raw, raw };
}

export function tokenize (value) {
  const source = String(value ?? '');
  const tokens = [];
  let index    = 0;

  while (index < source.length) {
    if (SPACE.test(source[index])) { index++; continue; }

    if (source[index] === '"' || source[index] === "'") {
      const end = closing(source, index);
      tokens.push({ type: 'string', value: source.slice(index + 1, end), raw: source.slice(index, end + 1) });
      index = end + 1;
      continue;
    }

    let end = index;
    while (end < source.length && !SPACE.test(source[end])) {
      const char = source[end];
      if (char === '(' || char === '[')      end = balanced(source, end);
      else if (char === '"' || char === "'") end = closing(source, end);
      end++;
    }

    tokens.push(classify(source.slice(index, end)));
    index = end;
  }

  return tokens;
}

// splits at separator, not inside quotes or brackets
export function split (source, separator) {
  const parts = [];
  let last    = 0;
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (char === '"' || char === "'")      index = closing(source, index);
    else if (char === '(' || char === '[') index = balanced(source, index);
    else if (char === separator)           { parts.push(source.slice(last, index)); last = index + 1; }
  }
  parts.push(source.slice(last));
  return parts;
}

// 'typo: bold uppercase; flow: grid 3' -> { typo: 'bold uppercase', flow: 'grid 3' }
export function parseBlock (text) {
  const groups = {};
  for (const part of split(String(text ?? ''), ';')) {
    const colon = part.indexOf(':');
    if (colon === -1) continue;
    const name  = part.slice(0, colon).trim();
    const value = part.slice(colon + 1).trim();
    if (name && value) groups[name] = value;
  }
  return groups;
}
