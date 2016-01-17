'use strict';

var MapConfig = require('../');
var pkg = require('../package.json');

var config = MapConfig(console)
  .alias('name', 'log')
  .process(pkg, function(err) {
    if (err) return console.error(err);
  });
