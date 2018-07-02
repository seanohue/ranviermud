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
    return player.getAttribute('intellect') * (damagePercent / 100);
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
    type: SkillType.SKILL,
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
      const damage = new Damage({
        attribute: 'health',
        amount: getDamage(player),
        attacker: player,
        type: [DamageType.ELECTRICAL],
        source: this
      });
      damage.verb = 'zaps';

      Broadcast.sayAt(player, `<bold>You will forth a <cyan>bolt</cyan></bold> <yellow>of <bold>lightning</bold></yellow> <bold>at ${target.name}!</bold>`);
      Broadcast.sayAtExcept(player.room, `<bold>With a gesture and a glare, ${player.name} unleashes a <cyan>bolt</cyan></bold> <yellow>of <bold>lightning</bold></yellow> <bold>at ${target.name}!</bold>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<bold>With a clenching of their fist, ${player.name} unleashes a <blue>bolt</blue></bold> <yellow>of <bold>lightning</bold></yellow> <bold>at you!</bold>`);
      }

      const isStunned = Random.probability(getStunChance(player));

      //TODO: Refactor into Combat utility function.
      if (isStunned) {
        const effect = state.EffectFactory.create(
          'stun',
          target,
          {
            duration: getDuration(player),
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
      return `Conjure a bolt of lightning at your target dealing ${getDamage(player)} Electrical damage, with a ${getStunChance(player)}% chance of stunning them for ${getDuration(player)} seconds.`;
    }
  };
};
