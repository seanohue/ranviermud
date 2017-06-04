'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'quit',
    command: (state) => (args, player) => {
      if (player.isInCombat()) {
        return Broadcast.sayAt(player, "You're too busy fighting for your life!");
      }

      player.save(() => {
        player.room.emit('playerQuit', player);
        Broadcast.sayAt(player, "Goodbye!");
        Broadcast.sayAt(player.room, `${player.name} disappears.`);
        player.socket.emit('close');
      });
    }
  };
};
