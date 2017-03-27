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
      const player = args.player;
      const say = str => Broadcast.sayAt(player, str);
      const at = str => Broadcast.at(player, str);

      /*
        Myelin does not have classes,
        however, players can choose a
        background.
      */

      player.setMeta('class', 'base');
      player.setMeta('attributePoints', 2);
      player.setMeta('abilityPoints', 1);
      socket.emit('choose-background', socket, { player });
    }
  };
};
