'use strict';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');

  return {
    event: state => (socket, { player: playerDef, attributes, account, equipment, skills }) => {
      let player = new Player({
        name: playerDef.name,
        account: playerDef.account
      });

      const room = state.RoomManager.startingRoom;
      player.room = room;
      player.save();

      // Myelin meta-stats.
      player.setMeta('abilities', []);

      //TODO: Set with background.
      player.setMeta('attributePoints', 2);
      player.setMeta('abilityPoints', 1);

      // Reload from manager so events are set
      player = state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      socket.emit('done', socket, { player, attributes, account, equipment, skills });
    }
  };
};
