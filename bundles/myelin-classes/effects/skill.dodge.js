'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const Random = require(srcPath + 'RandomUtil');
  const Player = require(srcPath + 'Player');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Dodge',
      description: "You are actively dodging incoming attacks!",
      type: 'skill:dodge',
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 1,
    },
    modifiers: {
      outgoingDamage: (damage, current) => current,
      incomingDamage: function (damage, currentAmount) {
        if (damage instanceof Heal || damage.type === 'psionic') {
          return currentAmount;
        }

        const dodged = Random.probability(this.magnitude);
        if (dodged) {
          Broadcast.sayAt(this.target, `You dodge the attack completely!`);
          return 0;
        } else if (Random.probability(this.magnitude)) {
          Broadcast.sayAt(this.target, 'You nearly dodge the attack, but it still grazes you...');
          return Math.ceil(currentAmount / 2);
        }

        return currentAmount;
      }
    },
    listeners: {
      effectDeactivated: function () {
        Broadcast.sayAt(this.target, 'You are no longer actively dodging attacks.');
      }
    }
  };
};
