'use strict';

/**
 * Might & Stamina based active attack skill
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');
  const Random = require(srcPath + 'RandomUtil');

  const damagePercent = 150;
  const energyCost = 50;
  const stunPercent = 20;

  function getDamage(player) {
    return player.calculateWeaponDamage() * (damagePercent / 100) + player.getMaxAttribute('might');
  }

  function getDuration(player) {
    return Math.ceil(player.getMaxAttribute('might') / 5);
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

      const isStunned = Random.probability(20);

      Broadcast.sayAt(player, `<red>You bash ${target.name} viciously, knocking them back!</red>`);
      Broadcast.sayAtExcept(player.room, `<red>${player.name} viciously bashes ${target.name}!</red>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<red>${player.name} bashes you with their weapon!</red>`);
      }

      if (isStunned) {
        Broadcast.sayAt(player, `<yellow>${target.name} is stunned!</yellow>`);
        Broadcast.sayAtExcept(player.room, `<yellow>${player.name} stuns ${target.name}!</yellow>`, [player, target]);
        if (!target.isNpc) {
          Broadcast.sayAt(target, `<yellow>${player.name}'s attack stuns you!</yellow>`);
        }
        target.addEffect(effect);
      }

      damage.commit(target);
    },

    info: (player) => {
      return `Make a strong attack against your target dealing <bold>${damagePercent}%</bold> weapon damage, plus your Might, with a <bold>${stunPercent}</bold> chance to stun for <bold>${getDuration(player)}</bold> seconds.`;
    }
  };
};
