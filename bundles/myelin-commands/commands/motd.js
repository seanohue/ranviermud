'use strict';

/**
 * Show player MOTD
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Data = require(srcPath + 'Data');
  return {
    usage: 'motd',
    aliases: ['changelog'],
    command : (state) => (args, player) => {
      Broadcast.sayAt(player, Data.loadMotd());
    }
  };
};