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
  describe('constructor', function () {
    it('should pass a config and the app instance to mapped methods', function () {
      var called = false;
      var map = {foo: 'bar', baz: 'bang'};
      var app = {bar: function (config) {
        called = true;
        assert.deepEqual(config, {baz: 'beep'});
        assert.deepEqual(this, app);
      }};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app, map);
      mapper.process(config);
      assert(called);
    });

    it('should pass a config and the app instance to mapped functions', function () {
      var called = false;
      var map = {foo: function (config) {
        called = true;
        assert.deepEqual(config, {baz: 'beep'});
        assert.deepEqual(this, app);
      }};

      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app, map);
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
      var mapper = new MapConfig(app, map);
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

      var mapper = new MapConfig(app, map);
      mapper.process();

      assert.deepEqual(output, []);
    });
  });

  describe('map', function () {
    it('should pass a config and the app instance to mapped methods from `.map`', function () {
      var called = false;
      var app = {bar: function (config) {
        called = true;
        assert.deepEqual(config, {baz: 'beep'});
        assert.deepEqual(this, app);
      }};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', 'bar')
        .map('baz', 'bang');
      mapper.process(config);
      assert(called);
    });

    it('should pass a config and the app instance to mapped functions from `.map`', function () {
      var called = false;
      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', function (config) {
          called = true;
          assert.deepEqual(config, {baz: 'beep'});
          assert.deepEqual(this, app);
        });
      mapper.process(config);
      assert(called);
    });

    it('should call a method on the app mapped through the map from `.map`', function () {
      var output = [];
      var app = {
        bar: function (config) {
          output.push('bar ' + config.baz);
        }
      };

      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', 'bar');
      mapper.process(config);

      assert.deepEqual(output, ['bar beep']);
    });

    it('should not map anything when config is empty from `.map`', function () {
      var output = [];

      var app = {
        bar: function (config) {
          output.push('bar ' + config.baz);
        }
      };

      var mapper = new MapConfig(app)
        .map('foo', 'bar');
      mapper.process();

      assert.deepEqual(output, []);
    });
  });
});
