/*!
 * map-config <https://github.com/doowb/map-config>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

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

function MapConfig(app, config) {
  if (!(this instanceof MapConfig)) {
    return new MapConfig(app, config);
  }

  this.app = app || {};
  this.aliases = {};
  this.config = {};

  if (config) {
    for (var key in config) {
      var val = config[key];
      if (typeof val === 'string') {
        this.alias(key, val);
      } else {
        this.map(key, val);
      }
    }
  }
}

/**
 * Map a properties to methods and/or functions.
 *
 * ```js
 * mapper
 *   .map('baz')
 *   .map('bang', function (config) {
 *   });
 * ```

 * @param  {String} `key` property key to map.
 * @param  {Function} `fn` Optional function to call when a config has the given key.
 * @return {Object} `this` to enable chaining
 * @api public
 */

MapConfig.prototype.map = function(key, val) {
  if (typeof val !== 'function') {
    val = this.app[key];
  }
  this.config[key] = val;
  return this;
};

/**
 * Alias properties to methods on the `app`.
 *
 * ```js
 * mapper.alias('foo', 'bar');
 * ```

 * @param  {String} `alias` Property being mapped from..
 * @param  {String} `key` Property being mapped to on the app.
 * @return {Object} `this` to enable chaining
 * @api public
 */

MapConfig.prototype.alias = function(alias, key) {
  this.aliases[alias] = key;
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

MapConfig.prototype.process = function(args) {
  args = args || {};
  var key;

  for (key in this.aliases) {
    var alias = this.aliases[key];
    this.map(key, this.config[alias] || this.app[alias]);
  }

  for (key in args) {
    if (typeof this.config[key] === 'function') {
      this.config[key].call(this.app, args[key]);
    }
  }
};

/**
 * Exposes MapConfig
 */

module.exports = MapConfig;
