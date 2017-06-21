'use strict';

/**
 * Quickness & Focus based attack skill, causing stun.
 * //TODO: Temporarily reduces target's armor.
 * High critical chance.
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');
  const Random = require(srcPath + 'RandomUtil');

  const damagePercent = 100;
  const focusCost = 30;
  const stunPercent = 60;
  const critPercent = 80;

  function totalDamage(player) {
    return player.calculateWeaponDamage() * (damagePercent / 100) + player.getMaxAttribute('quickness');
  }

  function getDuration(player) {
    return 2 + Math.ceil(player.getMaxAttribute('quickness') / 5);
  }

  return {
    name: 'Nervestrike',
    type: SkillType.SKILL,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'focus',
      cost: focusCost,
    },
    cooldown: 12,

    run: state => function (args, player, target) {
      this.verb = 'jabbed';
      const damage = new Damage({
        attribute: 'health',
        amount: totalDamage(player),
        attacker: player,
        type: 'piercing',
        source: this,
        critical: Random.probability(critPercent)
      });

      const duration = getDuration(player, damage);

      const effect = state.EffectFactory.create(
        'stun',
        target,
        {
          duration,
          description: "You are paralyzed by a nerve strike!"
        }
      );
      effect.skill = this;
      effect.attacker = player;

      const isStunned = Random.probability(stunPercent + player.getMaxAttribute('quickness'));

      Broadcast.sayAt(player, `<red>You jab ${target.name} in a pressure point!</red>`);
      Broadcast.sayAtExcept(player.room, `<red>${player.name} quickly jabs ${target.name}!</red>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<red>${player.name} jabs you in a pressure point!</red>`);
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

    info(player) {
      return `Make a pinpoint attack against your target, dealing <bold>${damagePercent}%</bold> weapon damage, plus your Quickness, with a <bold>${stunPercent + player.getMaxAttribute('quickness')}%</bold> chance to stun for <bold>${getDuration(player)}</bold> seconds. A nerve strike has an extra <b>${critPercent}%</b> chance of a critical strike!`;
    }
  };
};