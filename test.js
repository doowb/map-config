/*!
 * map-config <https://github.com/doowb/map-config>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

/* deps:mocha */
var assert = require('assert');
var should = require('should');
var MapConfig = require('./');

describe('map-config', function () {
  it('should:', function () {
    var map = {
      foo: 'bar'
    };

    var app = {
      bar: function () {
        console.log(arguments);
      }
    };

    var config = {
      foo: {
        baz: 'beep'
      }
    };

    var mapper = new MapConfig(map, app);
    mapper.process(config);
  });
});
