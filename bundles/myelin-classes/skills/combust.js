'use strict';

/**
 * Basic mage spell
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');
  const Random = require(srcPath + 'RandomUtil');

  const DamageType = require('../../myelin-combat/lib/DamageType');

  const damagePercent = 300;
  const cost = 65;

  function getDamage(player) {
    return {
      min: Math.min(player.getAttribute('intellect'), 20),
      max: Math.min(player.getAttribute('intellect') * (damagePercent / 100), 90)
    };
  }

  return {
    name: 'Combust',
    type: SkillType.COMBAT,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'focus',
      cost,
    },
    cooldown: 10,

    run: state => function (args, player, target) {
      const {min, max} = getDamage(player);

      const amount = Random.inRange(min, max);

      const damage = new Damage({
        attribute: 'health',
        amount,
        attacker: player,
        type: [DamageType.FIRE],
        source: this
      });
      damage.verb = 'burns';

      // TOSO:  To avoid this, make a very similar 'flamethrower' skill that can also be added to weapons.
      if (!player.isNpc) {
        Broadcast.sayAt(player, `<bold>You will forth a <red>burst</red></bold> <yellow>of <bold>flame</bold></yellow> <bold>at ${target.name}!</bold>`);
        Broadcast.sayAtExcept(player.room, `<bold>With a gesture and a glare, ${player.name} unleashes a <red>burst</red></bold> <yellow>of <bold>flame</bold></yellow> <bold>at ${target.name}!</bold>`, [player, target]);
        if (!target.isNpc) {
          Broadcast.sayAt(target, `<bold>With a wave of their hand, ${player.name} unleashes a <red>burst</red></bold> <yellow>of <bold>flame</bold></yellow> <bold>at you!</bold>`);
        }
      } else {
        const {fireBroadcast = {}} = player.metadata;
        const {
          atTarget = `<bold>${player.name} shoots a <red>burst</red></bold> <yellow>of <bold>flame</bold></yellow> at you!</bold>`,
          atOthers = `<bold>${player.name} shoots a  <red>burst</red></bold> <yellow>of <bold>flame</bold></yellow> at ${target.name}!</bold>`
        } = fireBroadcast;

        Broadcast.sayAt(target, atTarget);
        Broadcast.sayAtExcept(target.room, atOthers, [player, target]);
      }

      // TODO: Check for dodge.
      // TODO: Potentially add 'on fire' effect.

      damage.commit(target);
    },

    info: (player) => {
      const {min, max} = getDamage(player);
      return `Conjure a burst of flame at your target, dealing ${min} - ${max} Fire damage.`;
    }
  };
};
