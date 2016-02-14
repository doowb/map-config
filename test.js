/*!
 * map-config <https://github.com/doowb/map-config>
 *
 * Copyright (c) 2015 .
 * Licensed under the MIT license.
 */

'use strict';

require('mocha');
var assert = require('assert');
var MapConfig = require('./');

describe('map-config', function() {
  describe('constructor', function() {
    it('should create a new instance without `new`', function() {
      assert(MapConfig() instanceof MapConfig);
    });

    it('should pass a config and the app instance to mapped methods', function(cb) {
      var called = false;
      var map = {foo: 'bar', baz: 'bang'};
      var app = {bar: function(config) {
        called = true;
        assert.deepEqual(config, {baz: 'beep'});
        assert.deepEqual(this, app);
      }};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app, map);
      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert(called);
        cb();
      });
    });

    it('should not blow up if `app` is undefined', function(cb) {
      var app = {};
      app.set = function(key, val) {
        app[key] = val;
        return app;
      };

      function one(app) {
        var inst = new MapConfig(app)
          .map('two', two(app.two))
          .map('set');

        return function(args, next) {
          inst.process(args, function(err) {
            if (err) next(err);
            assert(inst);
            assert(args);
            next();
          });
        };
      }

      function two(app) {
        var inst = new MapConfig(app)
          .map('set');

        return function(args, next) {
          inst.process(args, next);
        };
      }

      one(app)({}, cb);
    });

    it('should pass a config and the app instance to mapped functions', function(cb) {
      var called = false;
      var map = {foo: function(config) {
        called = true;
        assert.deepEqual(config, {baz: 'beep'});
        assert.deepEqual(this, app);
      }};

      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app, map);
      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert(called);
        cb();
      });
    });

    it('should call a method on the app mapped through the map', function(cb) {
      var output = [];
      var map = {foo: 'bar'};

      var app = {
        bar: function(config) {
          output.push('bar ' + config.baz);
        }
      };

      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app, map);
      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert.deepEqual(output, ['bar beep']);
        cb();
      });
    });

    it('should not map anything when config is empty', function(cb) {
      var output = [];
      var map = {foo: 'bar'};

      var app = {
        bar: function(config) {
          output.push('bar ' + config.baz);
        }
      };

      var mapper = new MapConfig(app, map);
      mapper.process(function(err) {
        if (err) return cb(err);
        assert.deepEqual(output, []);
        cb();
      });
    });

    it('should not map anything when nothing is configured', function(cb) {
      var output = [];
      var app = {
        bar: function(config) {
          output.push('bar ' + config.baz);
        }
      };

      var mapper = new MapConfig(app);
      mapper.process({'bar': {baz: 'foo'}}, function(err) {
        if (err) return cb(err);
        assert.deepEqual(output, []);
        cb();
      });
    });

    it('should not map anything when aliased property is not a method', function(cb) {
      var output = [];
      var app = {
        bar: 'baz'
      };

      var mapper = new MapConfig(app)
        .alias('foo', 'bar');

      mapper.process({'foo': {baz: 'foo'}}, function(err) {
        if (err) return cb(err);
        assert.deepEqual(output, []);
        cb();
      });
    });

    it('should not map un-mapped methods on the app.', function(cb) {
      var output = [];
      var app = {
        a: function(a) { output.push(a); },
        b: function(b) { output.push(b); },
        c: function(c) { output.push(c); },
        d: function(d) { output.push(d); },
        e: function(e) { output.push(e); },
        f: function(f) { output.push(f); },
        g: function(g) { output.push(g); }
      };

      // pass map into constructor with some methods mapped.
      var map = {
        a: 'a',
        b: 'b'
      };

      // map additional properties through `.map`
      var mapper = new MapConfig(app, map)
        .map('c', 'c')
        .map('d', 'd');

      // confi contains mapped properties and unmapped properties
      var config = {
        a: 'a',
        c: 'c',
        e: 'e',
        g: 'g'
      };

      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert.deepEqual(output, ['a', 'c']);
        cb();
      });
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
      mapper2.map('mapper1', function(config, next) {
        mapper1.process(config, next);
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
    it('should pass a config and the app instance to mapped functions from `.map`', function(cb) {
      var called = false;
      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', function(config) {
          called = true;
          assert.deepEqual(config, {baz: 'beep'});
          assert.deepEqual(this, app);
        });

      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert(called);
        cb();
      });
    });

    it('should call same method on the app as specified through `.map`', function(cb) {
      var output = [];
      var app = {
        foo: function(config) {
          output.push('foo ' + config.baz);
        }
      };

      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo');

      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert.deepEqual(output, ['foo beep']);
        cb();
      });
    });

    it('should call a child mapper when passed through `.map`', function(cb) {
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

      mapper2.process(config, function(err) {
        if (err) return cb(err);
        assert.deepEqual(output, ['foo beep', 'bar boop']);
        cb();
      });
    });

    it('should not map anything when config is empty from `.map`', function(cb) {
      var output = [];

      var app = {
        bar: function(config) {
          output.push('bar ' + config.baz);
        }
      };

      var mapper = new MapConfig(app)
        .map('foo', 'bar');

      mapper.process(function(err) {
        if (err) return cb(err);
        assert.deepEqual(output, []);
        cb();
      });
    });
  });

  describe('alias', function() {
    it('should map methods from `.alias` to app methods', function(cb) {
      var called = false;
      var app = {
        bar: function(config) {
          called = true;
          assert.deepEqual(config, {
            baz: 'beep'
          });
          assert.deepEqual(this, app);
        }
      };

      var mapper = new MapConfig(app)
        .alias('foo', 'bar')
        .alias('baz', 'bang');

      var config = {foo: {baz: 'beep'}};
      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert(called);
        cb();
      });
    });

    it('should map methods from `.alias` to previously mapped methods', function(cb) {
      var called = false;

      var app = {cache: {}};
      app.set = function(obj) {
        called = true;
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            app.cache[key] = obj[key];
          }
        }
      };

      var mapper = new MapConfig(app)
        .map('set')
        .alias('foo', 'set');

      var config = {foo: {bar: 'baz'}};
      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert(called);
        assert.deepEqual(app.cache, config.foo);
        cb();
      });
    });

    it('should map methods from `.alias` to methods mapped afterwards', function(cb) {
      var called = false;

      var app = {cache: {}};
      app.set = function(obj) {
        called = true;
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            app.cache[key] = obj[key];
          }
        }
      };

      var mapper = new MapConfig(app)
        .alias('foo', 'set')
        .map('set');

      var config = {foo: {bar: 'baz'}};
      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert(called);
        assert.deepEqual(app.cache, config.foo);
        cb();
      });
    });

    it('should invoke app methods from aliased methods', function(cb) {
      var output = [];
      var app = {
        bar: function(config) {
          output.push('bar ' + config.baz);
        }
      };

      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .alias('foo', 'bar');

      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert.deepEqual(output, ['bar beep']);
        cb();
      });
    });
  });

  describe('process', function() {
    it('should bind the process callback to the app', function(cb) {
      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app);
      mapper.process(config, function(err) {
        assert.deepEqual(this, app);
        if (err) return cb(err);
        cb();
      });
    });

    it('should process a config and call async function when finished', function(cb) {
      var called = false;
      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', function(config) {
          called = true;
          assert.deepEqual(config, {baz: 'beep'});
          assert.deepEqual(this, app);
        });

      mapper.process(config, function(err) {
        if (err) return cb(err);
        assert(called);
        cb();
      });
    });

    it('should process a config and return when finished', function() {
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

    it('should process a config and return an `err` when an error is thrown', function(cb) {
      var called = false;
      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', function(config) {
          called = true;
          throw new Error('test error');
        });

      mapper.process(config, function(err) {
        assert(err);
        assert(called);
        assert.equal(err.message, 'map-config#process test error');
        cb();
      });
    });

    it('should process a config and return an `err` when an error is returned', function(cb) {
      var called = false;
      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', function(config, next) {
          called = true;
          next(new Error('test error'));
        });

      mapper.process(config, function(err) {
        assert(err);
        assert(called);
        assert.equal(err.message, 'test error');
        cb();
      });
    });

    it('should process a config and throw an error when an error is thrown', function(cb) {
      var called = false;
      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', function(config) {
          called = true;
          throw new Error('test error');
        });

      try {
        mapper.process(config);
        cb(new Error('expected an error.'));
      } catch (err) {
        assert(err);
        assert(called);
        assert.equal(err.message, 'map-config#process test error');
        cb();
      }
    });

    it('should process a config and throw an error when an error returned', function(cb) {
      var called = false;
      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', function(config) {
          called = true;
          throw new Error('test error');
        });

      try {
        mapper.process(config);
        cb(new Error('expected an error.'));
      } catch (err) {
        assert(err);
        assert(called);
        assert.equal(err.message, 'map-config#process test error');
        cb();
      }
    });

    it('should throw when a fn is async but no callback is passed to process', function(cb) {
      var called = false;
      var app = {beep: 'boop'};
      var config = {foo: {baz: 'beep'}};
      var mapper = new MapConfig(app)
        .map('foo', function(config, next) {
          called = true;
          next();
        });

      try {
        mapper.process(config);
        cb(new Error('expected an error.'));
      } catch (err) {
        assert(err);
        assert(!called);
        assert.equal(err.message, 'expected a callback function');
        cb();
      }
    });
  });
});
