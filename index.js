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

  define(this, 'isMapConfig', true);

  this.app = app || {};
  this.keys = [];
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
 *   .map('bang', function(config) {
 *   });
 * ```

 * @param  {String} `key` property key to map.
 * @param  {Function|Object} `val` Optional function to call when a config has the given key. May also pass another instance of MapConfig to be processed.
 * @return {Object} `this` to enable chaining
 * @api public
 */

MapConfig.prototype.map = function(key, val) {
  // allow passing another map-config object in as a value
  if (isMapConfig(val)) {
    this.map(key, function(config) {
      return val.process(config);
    });
    return this.addKey(key, val.keys);
  }

  if (typeof val !== 'function') {
    val = this.app[key];
  }

  this.config[key] = val;
  this.addKey(key);
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
  this.addKey(alias);
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
 * Add a key to the `.keys` array. May also be used to add an array of namespaced keys to the `.keys` array.
 * This is useful for mapping sub configs to a key in a parent config.
 *
 * ```js
 * mapper.addKey('foo');
 * console.log(mapper.keys);
 * //=> ['foo']
 *
 * var mapper1 = new MapConfig();
 * var mapper2 = new MapConfig();
 * mapper2.map('foo');
 * mapper2.map('bar');
 * mapper2.map('baz');
 *
 * mapper1.map('mapper2', function(config) {
 *   mapper2.process(config);
 * });
 * mapper1.addKey('mapper2', mapper2.keys);
 * console.log(mapper1.keys);
 * //=> ['mapper2.foo', 'mapper2.bar', 'mapper2.baz']
 * ```
 *
 * @param {String} `key` key to push onto `.keys`
 * @param {Array} `arr` Array of sub keys to push onto `.keys`
 * @return {Object} `this` for chaining
 * @api public
 */

MapConfig.prototype.addKey = function(key, arr) {
  var idx = this.keys.indexOf(key);
  if (Array.isArray(arr)) {
    if (idx === -1) {
      this.keys = this.keys.concat(arr.map(function(val) {
        return [key, val].join('.');
      }));
    } else {
      this.keys.splice(idx, 1);
      var vals = arr.map(function(val) {
        return [key, val].join('.');
      })
      .filter(function(val) {
        return this.keys.indexOf(val) === -1;
      }.bind(this));

      this.keys.push.apply(this.keys, vals);
    }
  } else if (idx === -1) {
    this.keys.push(key);
  }
  return this;
};

/**
 * Check if given value looks like an instance of `map-config`
 *
 * @param  {*} `val` Value to check
 * @return {Boolean} `true` if instance of `map-config`
 */

function isMapConfig(val) {
  return val
    && typeof val === 'object'
    && val.isMapConfig === true;
}

/**
 * Define a property on an object.
 *
 * @param  {Object} `obj` Object to define property on.
 * @param  {String} `prop` Property to define.
 * @param  {*} `val` Value of property to define.
 */

function define(obj, prop, val) {
  Object.defineProperty(obj, prop, {
    enumerable: false,
    configurable: true,
    value: val
  });
}

/**
 * Exposes MapConfig
 */

module.exports = MapConfig;
