'use strict';
const src = '../../src/';
const { Random }           = require(src + 'random.js');
const { chooseRandomExit } = require(src + 'pathfinding.js');

const failureRoll = 5;

exports.listeners = {
  tick: chooseRandomExit(failureRoll)
};
