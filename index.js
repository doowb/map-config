/*!
 * map-config <https://github.com/doowb/map-config>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var forOwn = require('for-own');

/**
 * Create a new instance of MapConfig with a specified map and application.
 *
 * ```js
 * var mapper = new MapConfig(map, app);
 * ```
 * @param {Object} `map` Object specifying how to map a configuration to an application.
 * @param {Object} `app` Object containing the methods that will be called based on the map specification.
 * @api public
 */

function MapConfig (map, app) {
  this.map = map;
  this.app = app;
}

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
  forOwn(this.map, function (to, from) {
    if (!config.hasOwnProperty(from)) {
      return;
    }
    var val = config[from];
    if (typeof to === 'function') {
      return to(val, this.app);
    }
    return this.app[to](val, this.app);
  }, this);
};

/**
 * Exposes MapConfig
 */

module.exports = MapConfig;
