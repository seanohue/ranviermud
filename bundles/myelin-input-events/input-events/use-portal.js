'use strict';
const Axolemma = require('axolemma');

/**
 * View stats of deceased character
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    event: state => (player, args) => {
      Broadcast.sayAt(player, 'PORTAL!!!!!');
    }
  };
};