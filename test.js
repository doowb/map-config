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
  it('should pass a config and the app instance to mapped methods', function () {
    var called = false;
    var map = {foo: 'bar', baz: 'bang'};
    var app = {bar: function (config, _app) {
      called = true;
      assert.deepEqual(config, {baz: 'beep'});
      assert.deepEqual(app, _app);
    }};
    var config = {foo: {baz: 'beep'}};
    var mapper = new MapConfig(map, app);
    mapper.process(config);
    assert(called);
  });

  it('should pass a config and the app instance to mapped functions', function () {
    var called = false;
    var map = {foo: function (config, _app) {
      called = true;
      assert.deepEqual(config, {baz: 'beep'});
      assert.deepEqual(app, _app);
    }};

    var app = {beep: 'boop'};
    var config = {foo: {baz: 'beep'}};
    var mapper = new MapConfig(map, app);
    mapper.process(config);
    assert(called);
  });

  it('should call a method on the app mapped through the map', function () {
    var output = [];
    var map = {foo: 'bar'};

    var app = {
      bar: function (config) {
        output.push('bar ' + config.baz);
      }
    };

    var config = {foo: {baz: 'beep'}};
    var mapper = new MapConfig(map, app);
    mapper.process(config);

    assert.deepEqual(output, ['bar beep']);
  });

  it('should not map anything when config is empty', function () {
    var output = [];
    var map = {foo: 'bar'};

    var app = {
      bar: function (config) {
        output.push('bar ' + config.baz);
      }
    };

    var mapper = new MapConfig(map, app);
    mapper.process();

    assert.deepEqual(output, []);
  });
});
