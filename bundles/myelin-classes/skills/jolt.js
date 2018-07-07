'use strict';

/**
 * Basic mage spell
 */
module.exports = (srcPath) => {
  const Broadcast  = require(srcPath + 'Broadcast');
  const Damage     = require(srcPath + 'Damage');
  const SkillType  = require(srcPath + 'SkillType');
  const Random     = require(srcPath + 'RandomUtil');
  const DamageType = require('../../myelin-combat/lib/DamageType');

  const damagePercent = 150;
  const cost = 25;

  function getDamage(player) {
    return {
      min: Math.min(player.getAttribute('intellect'), 25),
      max: Math.min(player.getAttribute('intellect') * (damagePercent / 100), 60)
    }
  }

  function getStunChance(player) {
    return Math.min(
      player.getAttribute('intellect') + 
      player.getAttribute('willpower'),
      50
    );
  }

  function getDuration(player) {
    return Math.min(player.getAttribute('willpower'), 20);
  }

  return {
    name: 'Jolt',
    type: SkillType.COMBAT,
    requiresTarget: true,
    initiatesCombat: true,
    resource: [{
      attribute: 'focus',
      cost,
    }, {
      attribute: 'energy',
      cost,
    }],
    cooldown: 15,

    run: state => function (args, player, target) {
      const {min, max} = getDamage(player);

      const damage = new Damage({
        attribute: 'health',
        amount: Random.inRange(min, max),
        attacker: player,
        type: [DamageType.ELECTRICAL],
        source: this
      });
      damage.verb = 'zaps';

      Broadcast.sayAt(player, `<bold>You will forth an <cyan>arc</cyan></bold> <yellow>of <bold>electricity</bold></yellow> <bold>at ${target.name}!</bold>`);
      Broadcast.sayAtExcept(player.room, `<bold>With a gesture and a glare, ${player.name} unleashes an <cyan>arc</cyan></bold> <yellow>of <bold>electricity</bold></yellow> <bold>at ${target.name}!</bold>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<bold>With a clenching of their fist, ${player.name} unleashes an <blue>arc</blue></bold> <yellow>of <bold>electricity</bold></yellow> <bold>at you!</bold>`);
      }

      const isStunned = Random.probability(getStunChance(player));

      //TODO: Refactor into Combat utility function.
      if (isStunned) {
        const effect = state.EffectFactory.create(
          'stun',
          target,
          {
            duration: getDuration(player) * 1000,
            description: "You've been zapped senseless."
          }
        );
        effect.skill = this;
        effect.attacker = player;

        Broadcast.sayAt(player, `<yellow>${target.name} is stunned!</yellow>`);
        Broadcast.sayAtExcept(player.room, `<yellow>${player.name} stuns ${target.name}!</yellow>`, [player, target]);
        if (!target.isNpc) {
          Broadcast.sayAt(target, `<yellow>${player.name}'s <b>Jolt</b> stuns you!</yellow>`);
        }
        target.addEffect(effect);
      }

      damage.commit(target);
    },

    info: (player) => {
      const {min, max} = getDamage(player);
      return `Conjure an arc of electricity at your target dealing ${min} - ${max} Electrical damage, with a ${getStunChance(player)}% chance of stunning them for ${getDuration(player)} seconds.`;
    }
  };
};
