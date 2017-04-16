'use strict';

/**
 * Small chance of stun on hit.
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');
  const Heal = require(srcPath + 'Heal');

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
        const might = player.getMaxAttribute('might') || 0;

        if (Random.probability(might)) {
          const duration = Math.min(Math.ceil(might / 3), 10),
          const effect = state.EffectFactory.create(
            'stun',
            target,
            {
              duration,
              description: "You've been bashed senseless.",
            }
          );
          effect.skill = this;
          effect.attacker = player;

          Broadcast.sayAt(player, `<b><yellow>You bash <blue>${target.name}</blue> with the <blue>${this.name}</blue>, knocking them silly.</yellow></b>`, 80);
        }
      }
    }
  };
};
