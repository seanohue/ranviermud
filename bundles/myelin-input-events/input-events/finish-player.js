'use strict';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');

  return {
    event: state => (socket, { playerName, attributes, account, equipment, skills, background, attributePoints, abilityPoints }) => {
      let player = new Player({
        name: playerName,
        account: account.name
      });

      const room = state.RoomManager.startingRoom;
      player.room = room;
      player.save();

      // Myelin meta-stats.
      player.setMeta('class', 'base');
      player.setMeta('background', background);
      player.setMeta('abilities', []);

      //TODO: Set with background.
      player.setMeta('attributePoints',  attributePoints || 2);
      player.setMeta('abilityPoints',    abilityPoints   || 1);

      // Reload from manager so events are set
      player = state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      socket.emit('done', socket, { player, attributes, account, equipment, skills });
    }
  };
};
