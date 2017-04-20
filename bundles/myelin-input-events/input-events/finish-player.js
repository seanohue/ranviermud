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
        account
      });

      const room = state.RoomManager.startingRoom;
      player.room = room;

     // Myelin meta-stats.
      player.setMeta('class',            'base');
      player.setMeta('background',       background);
      player.setMeta('abilities',        []);
      player.setMeta('attributePoints',  attributePoints || 0);
      player.setMeta('abilityPoints',    abilityPoints   || 0);

      player.save();

      // Reload from manager so events are set
      player = state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      socket.emit('done', socket, { player, attributes, account, equipment, skills });
    }
  };
};
