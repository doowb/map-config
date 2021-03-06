'use strict';

var Base = require('base');
var MapConfig = require('../');

/**
 * Set up an example application class that stores related modules.
 */

function App () {
  Base.call(this);
  this.related = [];
}
Base.extend(App);

App.prototype.addRelated = function(name) {
  this.related.push(name);
  return this;
};

/**
 * Initialize the app.
 */

var app = new App();
var pkg = require('../package.json');

/**
 * Create a configuration map to handle `related` object.
 */

var relatedConfig = MapConfig(app)
  .map('list', function (list) {
    if (!Array.isArray(list)) return;
    // `this` is the app instance
    list.forEach(function (item) {
      this.addRelated(item);
    }.bind(this));
  });

/**
 * Create a configuration map to handle the `verb` object.
 */

var verbConfig = MapConfig(app)
  .map('related', function (related, key, config, next) {
    relatedConfig.process(related, next);
  });

/**
 * Create a configuration map and process the package.json
 * file, adding related modules to the `app` instance.
 */

var config = MapConfig(app)
  .map('verb', function (verb, key, config, next) {
    verbConfig.process(verb, next);
  })
  .process(pkg, function(err) {
    if (err) return console.error(err);
    console.log(app);
  });

