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

function MapConfig (app, config) {
  if (!(this instanceof MapConfig)) {
    return new MapConfig(app, config);
  }

  utils.define(this, 'app', app);
  utils.define(this, 'aliases', {});
  utils.define(this, 'config', {});
  if (config) {
    utils.forOwn(config, function (val, key) {
      this.map(key, val);
    }, this);
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

MapConfig.prototype.map = function(key, fn) {
  if (typeof fn === 'string') {
    return this.alias(key, fn);
  }
  this.config[key] = fn;
  return this;
};

/**
 * Alias properties to methods on the `app`.
 *
 * ```js
 * mapper.alias('foo', 'bar');
 * ```

 * @param  {String} `key` property key to map.
 * @param  {String} `alias` Method to call instead of the key.
 * @return {Object} `this` to enable chaining
 * @api public
 */

MapConfig.prototype.alias = function(key, alias) {
  this.aliases[key] = alias;
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
  utils.forOwn(args, function (val, key) {
    if (!this.config.hasOwnProperty(key) &&
        !this.aliases.hasOwnProperty(key)) {
      return;
    }

    var fn = this.config[key];
    if (typeof fn === 'function') {
      return fn.call(this.app, val);
    }

    fn = this.app[key];
    if (typeof fn === 'function') {
      return fn.call(this.app, val);
    }

    fn = this.app[this.aliases[key]];
    if (typeof fn === 'function') {
      return fn.call(this.app, val);
    }
  }, this);
  return this;
};

/**
 * Exposes MapConfig
 */

module.exports = MapConfig;
