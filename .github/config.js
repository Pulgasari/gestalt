// gestalt :: .github/config.js
// read by the scripts in .github/scripts

export default {

  // css bundles: output -> the files, in this order. @import inside them is inlined
  // (layer(), supports() and media conditions are kept as wrapping blocks), then minified.
  // built by .github/scripts/css.mjs, see .github/workflows/css.yml
  css : {
    'packages/css/gestalt.min.css' : [
      'packages/css/gestalt.css',
    ],
  },

};
