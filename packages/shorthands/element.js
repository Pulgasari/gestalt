// @gestalt/shorthands/element.js
// element.gestalt: every group as a property. import it for the side effect.
//
//   el.gestalt.typo = '"Rubik Sans" uppercase italic 20px justify';
//   el.gestalt.typo                         // the value, from the attribute gestalt-typo
//   el.gestalt.set({ flow: 'grid 3', typo: 'bold' });
//   el.gestalt.clear('typo');  el.gestalt.clear();
//
// it writes the attribute gestalt-<group> and renders its rule right away, no observer needed

import { groups, whenDefined } from './index.js';
import { render }              from './render.js';

const instances = new WeakMap;

class Gestalt {
  #element;

  constructor (element) { this.#element = element; }

  get (name) { return this.#element.getAttribute(`gestalt-${name}`); }

  // null, false or '' removes
  set (nameOrMap, value) {
    const entries = typeof nameOrMap === 'object' && nameOrMap ? Object.entries(nameOrMap) : [[nameOrMap, value]];
    for (const [name, val] of entries) {
      const attribute = `gestalt-${name}`;
      if (val == null || val === false || val === '') this.#element.removeAttribute(attribute);
      else { this.#element.setAttribute(attribute, String(val)); render(this.#element, attribute); }
    }
    return this;
  }

  // one group, or all of them
  clear (name) {
    return this.set(name ? { [name]: null } : Object.fromEntries([...groups.keys()].map(group => [group, null])));
  }
}

// a group named like a method (get, set, clear) stays reachable through get() and set() only
whenDefined(name => {
  if (name in Gestalt.prototype) return;
  Object.defineProperty(Gestalt.prototype, name, {
    configurable : true,
    get () { return this.get(name); },
    set (value) { this.set(name, value); },
  });
});

if (typeof Element === 'function' && !Object.hasOwn(Element.prototype, 'gestalt')) {
  Object.defineProperty(Element.prototype, 'gestalt', {
    configurable : true,
    get () {
      let gestalt = instances.get(this);
      if (!gestalt) instances.set(this, gestalt = new Gestalt(this));
      return gestalt;
    },
  });
}

export { Gestalt };
