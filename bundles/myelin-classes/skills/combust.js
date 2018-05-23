'use strict';

/**
 * Basic mage spell
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');

  const damagePercent = 300;
  const cost = 65;

  function getDamage(player) {
    return player.getAttribute('intellect') * (damagePercent / 100);
  }

  return {
    name: 'Combust',
    type: SkillType.SKILL,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'focus',
      cost,
    },
    cooldown: 10,

    run: state => function (args, player, target) {
      const damage = new Damage({
        attribute: 'health',
        amount: getDamage(player),
        attacker: player,
        type: 'fire', // eventually, fire
        source: this
      });
      damage.verb = 'burns';

      Broadcast.sayAt(player, `<bold>You will forth a <red>burst</red></bold> <yellow>of <bold>flame</bold></yellow> <bold>at ${target.name}!</bold>`);
      Broadcast.sayAtExcept(player.room, `<bold>With a gesture and a glare, ${player.name} unleashes a <red>burst</red></bold> <yellow>of <bold>flame</bold></yellow> <bold>at ${target.name}!</bold>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<bold>With a wave of their hand, ${player.name} unleashes a <red>burst</red></bold> <yellow>of <bold>flame</bold></yellow> <bold>at you!</bold>`);
      }

      // TODO: Check for dodge.
      // TODO: Potentially add 'on fire' effect.

      damage.commit(target);
    },

    info: (player) => {
      return `Hurl a magical fireball at your target dealing ${getDamage(player)} Fire damage.`;
    }
  };
};
