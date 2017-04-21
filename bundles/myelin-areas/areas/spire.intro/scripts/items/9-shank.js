'use strict';

/**
 * Small chance of bleed self or opponent on hit.
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');

  return  {
    listeners: {
      hit: state => function (damage, target) {
        if (!damage.attacker || damage.attacker.isNpc) {
          return;
        }

        const player = damage.attacker;

        // Have to be careful in weapon scripts. If you have a weapon script that causes damage and
        // it listens for the 'hit' event you will have to check to make sure that `damage.source
        // !== this` otherwise you could create an infinite loop the weapon's own damage triggering
        // its script
        const quickness = player.getMaxAttribute('quickness') || 0;
        const chanceOfBleedOther = Math.min(quickness + 5, 10); // 10 - quickness+5%
        const chanceOfBleedSelf = Math.min(Math.max(20 - quickness, 15), 1); // 1 - 15%
        if (Random.probability(chanceOfBleedOther)) {
          const duration = Math.min(Math.ceil(quickness / 2), 10) * 1000;
          const effect = state.EffectFactory.create(
            'skill.claw',
            target,
            {
              name: 'Shank',
              type: 'shank.other',
              tickInterval: Math.max(15 - quickness, 2),
              duration,
              description: "You've been stabbed... and it's a deep one.",
            },
            {
              totalDamage: Math.min(quickness, 30)
            }
          );
          effect.skill = this;
          effect.attacker = player;
          if (!target.isNpc) {
            Broadcast.sayAt(target, `<b><red>You have been stabbed by ${player.name}!</red></b>`);
          }
          target.addEffect(effect);
          Broadcast.sayAt(player, `<b><red>You stab <blue>${target.name}</blue> with the <blue>${this.name}</blue>, and blood pulses from the wound.</red></b>`, 80);
        }

        if (Random.probability(chanceOfBleedSelf)) {
          const duration = Math.min(Math.ceil(quickness / 2), 10) * 1000;
          const effect = state.EffectFactory.create(
            'skill.claw',
            player,
            {
              name: 'Shank',
              duration,
              type: 'shank.self',
              tickInterval: 3,
              description: "You've accidentally slit yourself... and it's a deep one.",
            },
            {
              totalDamage: Math.min(Math.ceil(quickness / 2), 30)
            }
          );
          effect.skill = this;
          effect.attacker = player;
          player.addEffect(effect);
          Broadcast.sayAt(player, `<b><red>Your shank's ragged cloth guard slips and you slice yourself!</red></b>`, 80);
        }
      }
    }
  };
};
