'use strict';

const Combat = require('../../ranvier-combat/lib/Combat');

/**
 * Basic warrior attack
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');

  const DamageType = require('../../myelin-combat/lib/DamageType');

  const damagePercent = 150;
  const energyCost = 20;

  function getDamage(player) {
    return Combat.calculateWeaponDamage(player) * (damagePercent / 100) + player.getMaxAttribute('quickness') || 0;
  }

  return {
    name: 'Lunge',
    type: SkillType.COMBAT,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'energy',
      cost: energyCost,
    },
    cooldown: 6,

    run: state => function (args, player, target) {

      const damage = new Damage({
        attribute: 'health',
        amount: getDamage(player) - (target.getAttribute('armor') || 0),
        attacker: player,
        type: [DamageType.PIERCING],
        source: this
      });

      Broadcast.sayAt(player, '<red>You shift your feet and let loose a fierce attack!</red>');
      Broadcast.sayAtExcept(player.room, `<red>${player.name} lets loose a lunging attack on ${target.name}!</red>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<red>${player.name} lunges at you with a fierce attack!</red>`);
      }
      damage.commit(target);
    },

    info: (player) => {
      return `Make a piercing attack against your target dealing <bold>${damagePercent}%</bold> weapon damage, plus your Quickness.`;
    }
  };
};
