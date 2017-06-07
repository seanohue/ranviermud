'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    listeners: {
      playerEnter: state => function (config, player) {
        const {
          maxCombatants = Infinity,
          minLevelToAttack = 0,
          maxLevelToAttack = Infinity,
          lag = 0
        } = config;

        const playerInLevelRange = player.level >= minLevelToAttack && player.level <= maxLevelToAttack;
        const npcCanAttack = this.combatants.length < maxCombatants;
        if (playerInLevelRange && npcCanAttack) {
          Logger.log(`${this.name} went aggro and attacked ${player.name}!`);
          B.sayAt(player, `<red><b>${this.name} attacks you!</red></b>`);
          B.sayAtExcept(this.room, `<red><b>${this.name} attacks ${player.name}!</red></b>`, player);
          this.initiateCombat(player, lag);
        }
      }
    }
  };
};
