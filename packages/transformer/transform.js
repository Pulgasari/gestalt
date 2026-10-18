// transform.js

import filters  from '@gestalt/filters';
import patterns from '@gestalt/patterns';

/*
gestalt-anweisungen können kommen von
- data-attributen
- css-regeln
- js-api

und teilweise transformieren sie code teilweise  nich
*/

function transform (code) {
  code.replace(/#soviet/g, '#ff0000');
  return code;
}

function processFilterRule  (rule, target = 'body') {
  // body { gestalt-filter: glitch-live animate[true] speed[2s]; }
  // <body gestalt-filter="glitch-live animate[true] speed[2s]">
  // <body data-gestalt-filter="glitch-live animate[true] speed[2s]">
  // hier kommt an: glitch-live animate[true] speed[2s]
  filters.apply(target, 'glitch-live', { animate: true, speed: '2s' });
}
function processPatternRule () {}

export { transform };
export default transform;
