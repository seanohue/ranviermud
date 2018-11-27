'use strict';

const Combat = require('../../ranvier-combat/lib/Combat');

/**
 * Leech life attack
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const Heal = require(srcPath + 'Heal');

  const SkillType = require(srcPath + 'SkillType');
  const Random = require(srcPath + 'RandomUtil');
  const DamageType = require('../../myelin-combat/lib/DamageType');

  const focusCost = 30;

  function getDamage(player) {
    return {
      min: Math.min(player.getMaxAttribute('intellect'), 10),
      max: Math.min(
        player.getMaxAttribute('intellect') + player.getMaxAttribute('willpower') + player.level,
        100
      )
    };
  }

  return {
    name: 'Leech',
    type: SkillType.COMBAT,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'focus',
      cost: focusCost,
    },
    cooldown: 10,

    run: state => function (args, player, target) {
      const damageRange = getDamage(player);
      const attack = Random.inRange(damageRange.min, damageRange.max);
      const defense = target.getAttribute('willpower') || 0;
      const amount = Math.max(
        0,
        Math.min(
          attack - defense,
          target.getMaxAttribute('health')
        )
      );

      const damage = new Damage({
        attribute: 'health',
        amount,
        attacker: player,
        type: [DamageType.PSIONIC],
        source: this
      });

      Broadcast.sayAt(player, `<red>You pry deep into ${target.name}'s soul and consume their lifeforce!</red>`);
      Broadcast.sayAtExcept(player.room, `<red>${player.name} reaches toward ${target.name}, and an eery glow surrounds them both!</red>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<red>${player.name} reaches deep into your soul!</red>`);
      }

      damage.commit(target);

      const heal = new Heal({
        attribute: 'health',
        amount,
        attacker: player,
        source: this
      });

      heal.commit(player);
    },

    info: (player) => {
      const {min, max} = getDamage(player);
      return `Make a psionic attack damaging your target and healing yourself for ${min} to ${max}.`;
    }
  };
};
