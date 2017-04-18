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
        const chanceOfBleedOther = Math.min(quickness, 5) // 5 - quickness%
        const chanceOfBleedSelf = Math.min(Math.max(20 - quickness, 15), 1) // 1 - 15%
        if (Random.probability(chanceOfBleedOther)) {
          const duration = Math.min(Math.ceil(quickness / 2), 10);
          const effect = state.EffectFactory.create(
            'skill:claw',
            target,
            {
              name: 'Shanked',
              tickInterval: Math.min(15 - quickness, 2),
              duration,
              description: "You've been stabbed... and it's a deep one.",
            },
            {
              totalDamage: quickness
            }
          );
          effect.skill = this;
          effect.attacker = player;
          if (!target.isNpc) {
            Broadcast.sayAt(target, `<b><red>You have been stabbed by ${player.name}!</red></b>`);
          }
          Broadcast.sayAt(player, `<b><red>You stab <blue>${target.name}</blue> with the <blue>${this.name}</blue>, and blood pulses from the wound.</red></b>`, 80);
        }

        if (Random.probability(chanceOfBleedSelf) || true) {
          const duration = Math.min(Math.ceil(quickness / 2), 10);
          const effect = state.EffectFactory.create(
            'skill:claw',
            target,
            {
              name: 'Shanked',
              duration,
              tickInterval: 3,
              description: "You've accidentally slit yourself... and it's a deep one.",
            },
            {
              totalDamage: Math.ceil(quickness / 2)
            }
          );
          effect.skill = this;
          effect.attacker = player;
          Broadcast.sayAt(player, `<b><red>Your shank's ragged cloth guard slips and you slice yourself!.</red></b>`, 80);
        }
      }
    }
  };
};
