'use strict';

var MapConfig = require('../');
var pkg = require('../package.json');

var config = MapConfig(console)
  .map('name', 'log')
  .process(pkg);
