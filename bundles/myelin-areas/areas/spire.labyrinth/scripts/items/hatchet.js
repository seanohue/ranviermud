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
        if (!damage.attacker || damage.attacker.isNpc || damage.source === this) {
          return;
        }

        const player = damage.attacker;

        // Have to be careful in weapon scripts. If you have a weapon script that causes damage and
        // it listens for the 'hit' event you will have to check to make sure that `damage.source
        // !== this` otherwise you could create an infinite loop the weapon's own damage triggering
        // its script
        const quickness = player.getMaxAttribute('quickness') || 0;
        const chanceOfBleedOther = damage.critical ? 100 : Math.min(quickness + 5, 10); // 10 - quickness+5%
        if (Random.probability(chanceOfBleedOther)) {
          const duration = ((damage.critical ? 5 : 0) + Math.min(Math.ceil(quickness * 2, 60))) * 1000;
          const effect = state.EffectFactory.create(
            'skill.rend',
            target,
            {
              name: 'Hatchet',
              type: 'hatchet.other',
              tickInterval: Math.max(15 - quickness, 2),
              duration,
              description: "You've been hacked open... and it's a deep one.",
            },
            {
              totalDamage: Math.min(quickness * 2, 60) + (damage.critical ? 20 : 0)
            }
          );
          effect.skill = this;
          effect.attacker = player;
          if (!target.isNpc) {
            Broadcast.sayAt(target, `<b><red>You have been hacked open by ${player.name}! Blood gushes forth.</red></b>`);
          }
          target.addEffect(effect);
          const bleeds = target.metadata.bleeds || 'blood';
          Broadcast.sayAt(player, `<b><red>You hack open <blue>${target.name}</blue> with the <blue>${this.name}</blue>, and ${bleeds} pulses from the wound.</red></b>`, 80);
        }
      }
    }
  };
};