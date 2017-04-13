'use strict';

/**
 * Player class selection event
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config     = require(srcPath + 'Config');

  return {
    event: state => (socket, args) => {
      console.log(args);
      const player = args.player;
      const say = str => Broadcast.sayAt(player, str);
      const at = str => Broadcast.at(player, str);

      /*
        Myelin does not have classes,
        however, players can choose a
        background.
      */

      player.setMeta('class', 'base');

      socket.emit('choose-background', socket, { player, account: args.account });
    }
  };
};
