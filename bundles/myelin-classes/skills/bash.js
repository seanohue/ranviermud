'use strict';

/**
 * Might & Stamina based active attack skill
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');
  const Random = require(srcPath + 'RandomUtil');
  const Combat = require(srcPath + '../bundles/myelin-combat/lib/Combat');

  const damagePercent = 150;
  const energyCost = 75;
  const stunPercent = 20;

  function totalDamage(player) {
    return Combat.calculateWeaponDamage(player) * (damagePercent / 100) + player.getMaxAttribute('might');
  }

  function getDuration(player) {
    return 1000 * Math.ceil(player.getMaxAttribute('might') / 5);
  }

  return {
    name: 'Bash',
    type: SkillType.SKILL,
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
        amount: totalDamage(player),
        attacker: player,
        type: 'crushing',
        source: this
      });
      damage.verb = 'crushes';

      const duration = Math.ceil(player.getMaxAttribute('might') / 5);
      const isStunned = Random.probability(stunPercent + player.getMaxAttribute('might'));

      Broadcast.sayAt(player, `<red>You bash ${target.name} viciously, knocking them back!</red>`);
      Broadcast.sayAtExcept(player.room, `<red>${player.name} viciously bashes ${target.name}!</red>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<red>${player.name} bashes you with their weapon!</red>`);
      }

      if (isStunned) {
        const effect = state.EffectFactory.create(
          'stun',
          target,
          {
            duration: getDuration(player),
            description: "You've been bashed senseless."
          }
        );
        effect.skill = this;
        effect.attacker = player;

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
      return `Make a strong attack against your target dealing <bold>${damagePercent}%</bold> weapon damage, plus your Might, with a <bold>${stunPercent + player.getMaxAttribute('might')}</bold> chance to stun for <bold>${getDuration(player) / 1000}</bold> seconds.`;
    }
  };
};