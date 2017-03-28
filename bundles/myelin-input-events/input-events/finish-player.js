'use strict';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');

  return {
    event: state => (socket, args) => {
      let player = new Player({
        name: args.name,
        account: args.account
      });

      const room = state.RoomManager.startingRoom;
      player.room = room;
      player.save();

      // Myelin meta-stats.
      player.setMeta('abilities', []);
      player.setMeta('abilityPoints', 0);
      player.setMeta('attributePoints', 0);

      // Reload from manager so events are set
      player = state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      socket.emit('choose-class', socket, { player, account: args.account });
    }
  };
};
