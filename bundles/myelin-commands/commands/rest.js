'use strict';

/**
 * Show player MOTD
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  return {
    usage: 'rest',
    aliases: ['sleep'],
    command : (state) => (args, player) => {
      Broadcast.sayAt(player, '<b><red>No rest for the wicked.</b></red>');
    }
  };
};