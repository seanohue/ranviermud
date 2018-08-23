'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const PlayerRoles = require(srcPath + 'PlayerRoles');

  return {
    requiredRole: PlayerRoles.ADMIN,
    command: (state) => (args, player) => {
      const list = [...player.combatants].map(c => c.name).join(', ');
      Broadcast.sayAt(player, list);
      Logger.warn('Combatants of ' + player.name + ': ' + list);
    }
  };
};
