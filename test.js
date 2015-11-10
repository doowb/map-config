/*!
 * map-config <https://github.com/doowb/map-config>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

/* deps:mocha */
var assert = require('assert');
var MapConfig = require('./');

describe('map-config', function() {
  describe('constructor', function() {
    it('should create a new instance without `new`', function() {
      assert(MapConfig() instanceof MapConfig);
    });

    it('should pass a config and the app instance to mapped methods', function() {
      var called = false;
      var map = {foo: 'bar', baz: 'bang'};
      var app = {bar: function(config) {
        called = true;
        assert.deepEqual(config, {baz: 'beep'});
        assert.deepEqual(this, app);
      }};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app, map);
      mapper.process(config);
      assert(called);
    });

    it('should not blow up if `app` is undefined', function(done) {
      var app = {};
      app.set = function(key, val) {
        app[key] = val;
        return app;
      };

      function one(app) {
        var inst = new MapConfig(app)
          .map('two', two(app.two))
          .map('set');

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
          .map('set');

        return function(args) {
          inst.process(args);
          return inst;
        };
      }

      one(app)({});
    });

    it('should pass a config and the app instance to mapped functions', function() {
      var called = false;
      var map = {foo: function(config) {
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

    it('should call a method on the app mapped through the map', function() {
      var output = [];
      var map = {foo: 'bar'};

      var app = {
        bar: function(config) {
          output.push('bar ' + config.baz);
        }
      };

      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app, map);
      mapper.process(config);

      assert.deepEqual(output, ['bar beep']);
    });

    it('should not map anything when config is empty', function() {
      var output = [];
      var map = {foo: 'bar'};

      var app = {
        bar: function(config) {
          output.push('bar ' + config.baz);
        }
      };

      var mapper = new MapConfig(app, map);
      mapper.process();

      assert.deepEqual(output, []);
    });

    it('should not map anything when nothing is configured', function() {
      var output = [];
      var app = {
        bar: function(config) {
          output.push('bar ' + config.baz);
        }
      };

      var mapper = new MapConfig(app);
      mapper.process({'bar': {baz: 'foo'}});

      assert.deepEqual(output, []);
    });

    it('should not map anything when aliased property is not a method', function() {
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

  describe('keys', function() {
    it('should add a key to the `.keys` array', function() {
      var mapper = new MapConfig();
      mapper.addKey('foo');
      assert.deepEqual(mapper.keys, ['foo']);
    });

    it('should not add a key to the `.keys` array when the key already exists', function() {
      var mapper = new MapConfig();
      mapper.addKey('foo');
      mapper.addKey('foo');
      assert.deepEqual(mapper.keys, ['foo']);
    });

    it('should add an array of namespaced keys to the `.keys` array', function() {
      var mapper = new MapConfig();
      mapper.addKey('foo', ['bar', 'baz', 'bang']);
      assert.deepEqual(mapper.keys, ['foo.bar', 'foo.baz', 'foo.bang']);
    });

    it('should add an array of namespaced keys to the `.keys` array when key already exists', function() {
      var mapper = new MapConfig();
      mapper.addKey('foo');
      mapper.addKey('foo', ['bar', 'baz', 'bang']);
      assert.deepEqual(mapper.keys, ['foo.bar', 'foo.baz', 'foo.bang']);
    });

    it('should extend an array of namespaced keys to the `.keys` array when key already exists', function() {
      var mapper = new MapConfig();
      mapper.addKey('foo');
      mapper.addKey('foo', ['bar', 'baz', 'bang']);
      mapper.addKey('foo', ['beep', 'boop', 'bop']);
      assert.deepEqual(mapper.keys, ['foo.bar', 'foo.baz', 'foo.bang', 'foo.beep', 'foo.boop', 'foo.bop']);
    });

    it('should add mapped keys to `.keys` when using `.map`', function() {
      var app = {beep: 'boop'};
      var mapper = new MapConfig(app)
        .map('foo', function() {});

      assert.deepEqual(mapper.keys, ['foo']);
    });

    it('should add aliased keys to `.keys` when using `.alias`', function() {
      var app = {beep: 'boop'};
      var mapper = new MapConfig(app)
        .alias('foo', 'bar');

      assert.deepEqual(mapper.keys, ['foo']);
    });

    it('should extend an array of mapped keys from one mapper onto a key from another mapper.', function() {
      var mapper1 = new MapConfig({});
      mapper1.map('foo');
      mapper1.map('bar');
      mapper1.map('baz');

      var mapper2 = new MapConfig({});
      mapper2.map('mapper1', function(config) {
        mapper1.process(config);
      });
      mapper2.addKey('mapper1', mapper1.keys);

      assert.deepEqual(mapper1.keys, ['foo', 'bar', 'baz']);
      assert.deepEqual(mapper2.keys, ['mapper1.foo', 'mapper1.bar', 'mapper1.baz']);
    });

    it('should add an array of mapped keys when a mapper is passed into `.map`.', function() {
      var mapper1 = new MapConfig({});
      mapper1.map('foo');
      mapper1.map('bar');
      mapper1.map('baz');

      var mapper2 = new MapConfig({});
      mapper2.map('mapper1', mapper1);

      assert.deepEqual(mapper1.keys, ['foo', 'bar', 'baz']);
      assert.deepEqual(mapper2.keys, ['mapper1.foo', 'mapper1.bar', 'mapper1.baz']);
    });
  });

  describe('map', function() {
    it('should pass a config and the app instance to mapped functions from `.map`', function() {
      var called = false;
      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', function(config) {
          called = true;
          assert.deepEqual(config, {baz: 'beep'});
          assert.deepEqual(this, app);
        });
      mapper.process(config);
      assert(called);
    });

    it('should call same method on the app as specified through `.map`', function() {
      var output = [];
      var app = {
        foo: function(config) {
          output.push('foo ' + config.baz);
        }
      };

      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo');
      mapper.process(config);

      assert.deepEqual(output, ['foo beep']);
    });

    it('should call a child mapper when passed through `.map`', function() {
      var output = [];
      var app = {
        foo: function(config) {
          output.push('foo ' + config.baz);
        },
        bar: function(config) {
          output.push('bar ' + config.bang);
        }
      };

      var config = {
        child: {
          foo: {baz: 'beep'},
          bar: {bang: 'boop'}
        }
      };

      var mapper1 = new MapConfig(app)
        .map('foo')
        .map('bar');

      var mapper2 = new MapConfig()
        .map('child', mapper1);

      mapper2.process(config);
      assert.deepEqual(output, ['foo beep', 'bar boop']);
    });

    it('should not map anything when config is empty from `.map`', function() {
      var output = [];

      var app = {
        bar: function(config) {
          output.push('bar ' + config.baz);
        }
      };

      var mapper = new MapConfig(app)
        .map('foo', 'bar');
      mapper.process();

      assert.deepEqual(output, []);
    });
  });

  describe('alias', function() {
    it('should pass a config and the app instance to mapped methods from `.alias`', function() {
      var called = false;
      var app = {bar: function(config) {
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

    it('should call a method on the app mapped through the map from `.alias`', function() {
      var output = [];
      var app = {
        bar: function(config) {
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
