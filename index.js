/*!
 * map-config <https://github.com/doowb/map-config>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

/**
 * Create a new instance of MapConfig with a specified map and application.
 *
 * ```js
 * var mapper = new MapConfig(app, map);
 * ```
 * @param {Object} `app` Object containing the methods that will be called based on the map specification.
 * @param {Object} `map` Optional object specifying how to map a configuration to an application.
 * @api public
 */

function MapConfig (app, map) {
  if (!(this instanceof MapConfig)) {
    return new MapConfig(app, map);
  }

  utils.define(this, 'app', app);
  utils.define(this, '_map', map || {});
}

/**
 * Map a properties to methods and/or functions.
 *
 * ```js
 * mapper
 *   .map('foo', 'bar')
 *   .map('baz')
 *   .map('bang', function (config) {
 *   });
 * ```

 * @param  {String} `key` property key to map.
 * @param  {String|Function} `fn` Optional method or function to call when a config has the given key. Map be a string specifying a method on the app to call.
 * @return {Object} `this` to enable chaining
 * @api public
 */

MapConfig.prototype.map = function(key, fn) {
  if (typeof fn === 'undefined') {
    fn = key;
  }

  this._map[key] = fn;
  return this;
};

/**
 * Process a configuration object with the already configured `map` and `app`.
 *
 * ```js
 * mapper.process(config);
 * ```
 * @param  {Object} `config` Configuration object to map to application methods.
 * @api public
 */

MapConfig.prototype.process = function(config) {
  config = config || {};
  utils.forOwn(this._map, function (fn, key) {
    if (!config.hasOwnProperty(key)) {
      return;
    }
    var val = config[key];
    if (typeof fn === 'function') {
      return fn.call(this.app, val);
    }
    return this.app[fn](val);
  }, this);
  return this;
};

/**
 * Exposes MapConfig
 */

module.exports = MapConfig;
