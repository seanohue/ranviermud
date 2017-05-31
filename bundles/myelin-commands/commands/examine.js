'use strict';


module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    usage: "examine [thing]",
    command: state => (args, player) => {
      if (!player.room) {
        Logger.error(player.getName() + ' is in limbo.');
        return B.sayAt(player, 'You are in a deep, dark void.');
      }

      if (args && player.room.hasBehavior('examine')) {
        return player.room.emit('examineAttempt', player, args);
      }

      return B.sayAt(player, 'Examine what?');
    }
  };
};
