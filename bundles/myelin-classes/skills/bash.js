'use strict';

/**
 * Might & Stamina based active attack skill
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');

  const damagePercent = 150;
  const energyCost = 50;
  const stunPercent = 20;

  function getDamage(player, energyBonus) {
    return player.calculateWeaponDamage() * (damagePercent / 100) + player.getMaxAttribute('might');
  }

  return {
    name: 'Bash',
    type: SkillType.SKILL,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'energy',
      cost: 50,
    },
    cooldown: 6,

    run: state => function (args, player, target) {
      const damage = new Damage({
        attribute: 'physical',
        amount: getDamage(player),
        attacker: player,
        type: 'physical',
        source: this
      });

      const duration = Math.ceil(player.getMaxAttribute('might') / 5);

      const effect = state.EffectFactory.create(
        'stun',
        target,
        {
          duration,
          description: this.info(player),
          tickInterval,
        },
        {
          totalDamage: totalDamage(player),
        }
      );
      effect.skill = this;
      effect.attacker = player;

      Broadcast.sayAt(player, '<red>You shift your feet and let loose a mighty attack!</red>');
      Broadcast.sayAtExcept(player.room, `<red>${player.name} lets loose a lunging attack on ${target.name}!</red>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<red>${player.name} lunges at you with a fierce attack!</red>`);
      }
      damage.commit(target);
    },

    info: (player) => {
      return `Make a strong attack against your target dealing <bold>${damagePercent}%</bold> weapon damage, plus your Might, with a <bold>${stunPercent}</bold> chance to stun.`;
    }
  };
};
