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
    it('should create a new instance without `new`', function () {
      assert(MapConfig() instanceof MapConfig);
    });

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

    it('should not blow up if `app` is undefined', function (done) {
      var app = {};
      app.set = function (key, val) {
        app[key] = val;
        return app;
      };

      function one(app) {
        var inst = new MapConfig(app)
          .map('two', two(app.two))
          .map('set')

        return function(args) {
          inst.process(args);
          assert(inst);
          assert(args);
          done();
          return inst;
        };
      }

      function two(app) {
        var inst = new MapConfig(app)
          .map('set')

        return function(args) {
          inst.process(args);
          return inst;
        };
      }

      one(app)({});
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

    it('should not map anything when nothing is configured', function () {
      var output = [];
      var app = {
        bar: function (config) {
          output.push('bar ' + config.baz);
        }
      };

      var mapper = new MapConfig(app);
      mapper.process({'bar': {baz: 'foo'}});

      assert.deepEqual(output, []);
    });

    it('should not map anything when aliased property is not a method', function () {
      var output = [];
      var app = {
        bar: 'baz'
      };

      var mapper = new MapConfig(app)
        .alias('foo', 'bar');
      mapper.process({'foo': {baz: 'foo'}});

      assert.deepEqual(output, []);
    });
  });

  describe('map', function () {
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

    it('should call same method on the app as specified through `.map`', function () {
      var output = [];
      var app = {
        foo: function (config) {
          output.push('foo ' + config.baz);
        }
      };

      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo');
      mapper.process(config);

      assert.deepEqual(output, ['foo beep']);
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

  describe('alias', function () {
    it('should pass a config and the app instance to mapped methods from `.alias`', function () {
      var called = false;
      var app = {bar: function (config) {
        called = true;
        assert.deepEqual(config, {baz: 'beep'});
        assert.deepEqual(this, app);
      }};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .alias('foo', 'bar')
        .alias('baz', 'bang');
      mapper.process(config);
      assert(called);
    });

    it('should call a method on the app mapped through the map from `.alias`', function () {
      var output = [];
      var app = {
        bar: function (config) {
          output.push('bar ' + config.baz);
        }
      };

      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .alias('foo', 'bar');
      mapper.process(config);

      assert.deepEqual(output, ['bar beep']);
    });
  });
});
