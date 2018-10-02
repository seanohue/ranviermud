'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  return {
    usage: 'prompt',
    aliases: ['pools'],
    command: state => (args, player) => {
      Broadcast.prompt(player, true);
    }
  };
};