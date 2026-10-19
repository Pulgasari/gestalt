// @gestalt/runtime/api.js

import { d, dd } from '@domina/chain';

const gestalt = {
  set filter  (value) {}
  set pattern (value) {}
};

class Gestalter {
  #namespace;
  #prefix = 'gestalt-' + #namespace + '-';
  
  setAttr (key, value) { d(???).attr(#prefix + key, value; }
}

class    FlowGestalter extends Gestalter {
  #namespace = 'flow';
}

class SurfaceGestalter extends Gestalter {
  #namespace = 'surface';
}

class    TypoGestalter extends Gestalter {
  ##namespace = 'typo';
}

function setGestaltAttribute () {}

