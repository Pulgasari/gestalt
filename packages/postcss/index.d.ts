// @gestalt/postcss

import type { PluginCreator } from 'postcss';

export interface GestaltOptions {
  /** where the webfonts of gestalt-webfont are, default https://code.pulgasari.dev/aufbau/webfonts */
  baseUrl?    : string;
  /** gestalt-typo, gestalt-flow …, gestalt-pattern, gestalt-filter, gestalt-webfont as plain css. default true */
  directives? : boolean;
  /** more css files with @function rules, besides @gestalt/css/functions.css and the file itself */
  files?      : string[];
  /** calls of css custom functions written out for browsers without @function. default true */
  functions?  : boolean;
}

export declare const gestalt: PluginCreator<GestaltOptions>;
export default gestalt;
