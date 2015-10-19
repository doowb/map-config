'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;
require('for-own');
require('define-property', 'define');

require = fn;
module.exports = utils;
