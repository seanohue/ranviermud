'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const PlayerRoles = require(srcPath + 'PlayerRoles');
  const Logger = require(srcPath + 'Logger');
  return {
    requiredRole: PlayerRoles.ADMIN,
    command: (state) => (args, player) => {
      let list = [...player.combatants].map(c => c.name).join(', ');
      if(!list) list = 'No one.';
      Broadcast.sayAt(player, list);
      Logger.warn('Combatants of ' + player.name + ': ' + list);
    }
  };
};
