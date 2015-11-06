# map-config [![NPM version](https://badge.fury.io/js/map-config.svg)](http://badge.fury.io/js/map-config)  [![Build Status](https://travis-ci.org/doowb/map-config.svg)](https://travis-ci.org/doowb/map-config)

> Map configuration objects to application methods.

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i map-config --save
```

## Usage

```js
var MapConfig = require('map-config');
```

## API

### [MapConfig](index.js#L21)

Create a new instance of MapConfig with a specified map and application.

**Params**

* `app` **{Object}**: Object containing the methods that will be called based on the map specification.
* `map` **{Object}**: Optional object specifying how to map a configuration to an application.

**Example**

```js
var mapper = new MapConfig(app, map);
```

### [.addKey](index.js#L72)

Add a key to the `.keys` array. May also be used to add an array of namespaced keys to the `.keys` array. This is useful for mapping sub configs to a key in a parent config.

```
var mapper1 = new MapConfig();
var mapper2 = new MapConfig();
mapper2.map('foo');
mapper2.map('bar');
mapper2.map('baz');
mapper1.map('mapper2', function(config) {
  mapper2.process(config);
});
mapper1.addKey('mapper2', mapper2.keys);
```

**Params**

* `key` **{String}**: key to push onto `.keys`
* `arr` **{Array}**: Array of sub keys to push onto `.keys`
* `returns` **{Object}** `this`: for chaining

**Examples**

```js
mapper.addKey('foo');
console.log(mapper.keys);
//=> ['foo']
```

```
var mapper1 = new MapConfig();
var mapper2 = new MapConfig();
mapper2.map('foo');
mapper2.map('bar');
mapper2.map('baz');

mapper1.map('mapper2', function(config) {
  mapper2.process(config);
});
mapper1.addKey('mapper2', mapper2.keys);
```

### [.map](index.js#L112)

Map a properties to methods and/or functions.

**Params**

* `key` **{String}**: property key to map.
* `fn` **{Function}**: Optional function to call when a config has the given key.
* `returns` **{Object}** `this`: to enable chaining

**Example**

```js
mapper
  .map('baz')
  .map('bang', function(config) {
  });
```

### [.alias](index.js#L134)

Alias properties to methods on the `app`.

**Params**

* `alias` **{String}**: Property being mapped from..
* `key` **{String}**: Property being mapped to on the app.
* `returns` **{Object}** `this`: to enable chaining

**Example**

```js
mapper.alias('foo', 'bar');
```

### [.process](index.js#L150)

Process a configuration object with the already configured `map` and `app`.

**Params**

* `config` **{Object}**: Configuration object to map to application methods.

**Example**

```js
mapper.process(config);
```

## Related projects

* [assemble](https://www.npmjs.com/package/assemble): Static site generator for Grunt.js, Yeoman and Node.js. Used by Zurb Foundation, Zurb Ink, H5BP/Effeckt,… [more](https://www.npmjs.com/package/assemble) | [homepage](http://assemble.io)
* [templates](https://www.npmjs.com/package/templates): System for creating and managing template collections, and rendering templates with any node.js template engine.… [more](https://www.npmjs.com/package/templates) | [homepage](https://github.com/jonschlinkert/templates)
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://www.npmjs.com/package/verb) | [homepage](https://github.com/verbose/verb)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/doowb/map-config/issues/new).

## Author

**Brian Woodward**

+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/doowb)

## License

Copyright © 2015 Brian Woodward
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on November 06, 2015._