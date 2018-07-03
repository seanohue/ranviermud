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

  const damagePercent = 400;
  const cost = 50;

  function getDamage(player) {
    return {
      min: Math.min(player.getAttribute('intellect'), 20),
      max: Math.min(player.getAttribute('intellect') * (damagePercent / 100), 160)
    };
  }

  function getStunChance(player, factor = 1) {
    return Math.min(
        player.getAttribute('intellect') + 
        player.getAttribute('willpower'), 50
      ) / factor;
  }

  function getDuration(player) {
    return Math.min(player.getAttribute('willpower'), 20);
  }

  return {
    name: 'Bolt',
    type: SkillType.COMBAT,
    requiresTarget: true,
    initiatesCombat: true,
    resource: [{
      attribute: 'focus',
      cost,
    }, {
      attribute: 'energy',
      cost
    }],
    cooldown: 35,

    run: state => function (args, player, target) {

      function electricalDamageFactory(dam) {
        const damage = new Damage({
          attribute: 'health',
          amount: dam || getDamage(player),
          attacker: player,
          type: [DamageType.ELECTRICAL],
          source: this
        });
        damage.verb = 'electrocutes';
        return damage;
      }

      const damage = electricalDamageFactory.call(this);

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

      const otherTargets = [...player.combatants].filter(com => com !== target);
      if (!otherTargets.length) return;
      console.log('CHAINING...');
      otherTargets.forEach((t, i) => {
        const factor = (i + 1) * 2;
        const newDamageAmount = Math.ceil(getDamage(player) / factor);
        const isStunned = Random.probability(Math.ceil(getStunChance(player, factor)));
        const newDamage = electricalDamageFactory.call(this, newDamageAmount);

        if (isStunned) {
          const effect = state.EffectFactory.create(
            'stun',
            t,
            {
              duration: getDuration(player),
              description: "You've been zapped senseless."
            }
          );
          effect.skill = this;
          effect.attacker = player;
  
          Broadcast.sayAt(player, `<yellow>${t.name} is stunned!</yellow>`);
          Broadcast.sayAtExcept(player.room, `<yellow>${player.name} stuns ${t.name}!</yellow>`, [player, t]);
          if (!t.isNpc) {
            Broadcast.sayAt(t, `<yellow>${player.name}'s <b>Jolt</b> stuns you!</yellow>`);
          }
          t.addEffect(effect);

          Broadcast.sayAt(player, `<bold>Your <cyan>bolt</cyan></bold> <yellow>of <bold>lightning</bold></yellow> arcs<bold> to ${target.name}!</bold>`);
          Broadcast.sayAtExcept(player.room, `<bold>${player.name}'s <cyan>bolt</cyan></bold> <yellow>arcs<bold></bold></yellow> to<bold> ${target.name}!</bold>`, [player, target]);
          if (!target.isNpc) {
            Broadcast.sayAt(target, `<bold>${player.name}'s <blue>bolt</blue></bold> <yellow>of <bold>lightning</bold> arcs</yellow> <bold> to you!</bold>`);
          }

          t.commit(newDamage);
        }   
      });
    },

    info: (player) => {
      return `Conjure a bolt of lightning at your foes dealing ${getDamage(player)} Electrical damage, with a ${getStunChance(player)}% chance of stunning them for ${getDuration(player)} seconds for the first target. This bolt then travels to other combatants you are fighting, doing half damage and half chance to stun each time.`;
    }
  };
};
