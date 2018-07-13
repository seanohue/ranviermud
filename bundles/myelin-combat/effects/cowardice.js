// Vulnerability to critical hits increases by %

'use strict';

module.exports = srcPath => {
  const Heal       = require(srcPath + 'Heal');
  const Flag       = require(srcPath + 'EffectFlag');
  const Random     = require(srcPath + 'RandomUtil');
  const DamageType = require('../../myelin-combat/lib/DamageType');


  return {
    config: {
      name: 'Cowardice',
      description: "You are in a bad state after fleeing. You heal less, take more damage from critical hits, and have lowered willpower and critical chance.",
      type: 'cowardice',
      maxStacks: 3,
      persists: true
    },
    flags: [Flag.DEBUFF],
    state: {
      magnitude: 1,
    },
    modifiers: {
      outgoingDamage: (damage, current) => current,
      incomingDamage(damage, currentAmount) {
        if (damage instanceof Heal) {
          return Math.max(currentAmount - this.state.magnitude, 0);
        }

        if (damage.critical) {
          return currentAmount + this.state.magnitude;
        }
        return currentAmount;
      },
      attributes: {
        willpower(current) {
          return Math.max(current - this.state.magnitude, 1);
        },

        critical(current) {
          return Math.max(current - this.state.magnitude, 0);
        }
      }
    },
  };
};
