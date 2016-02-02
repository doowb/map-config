'use strict';

var Base = require('base');
var MapConfig = require('../');

/**
 * Set up an example application class that stores dependenices.
 */

function App () {
  Base.call(this);
  this.dependencies = {};
}
Base.extend(App);

App.prototype.addDependency = function(name, version) {
  this.dependencies[name] = version;
  return this;
};

App.prototype.addDependencies = function(dependencies) {
  return this.visit('addDependency', dependencies);
};


/**
 * Initialize the app.
 */

var app = new App();
var pkg = require('../package.json');

/**
 * Create a configuration map and process the package.json
 * file, adding dependencies to the `app` instance.
 */

var config = MapConfig(app)
  .alias('devDependencies', 'addDependencies')
  .process(pkg, function(err) {
    if (err) return console.error(err);
    console.log(app);
  });

