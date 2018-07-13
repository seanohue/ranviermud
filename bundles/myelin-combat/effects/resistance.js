'use strict';

module.exports = srcPath => {
  const Flag = require(srcPath + 'EffectFlag');
  const DamageType = require('../../myelin-combat/lib/DamageType');

  return {
    config: {
      name: 'Resistance',
      description: "Resists certain types of damage.",
      hidden: true,
      persists: true,
      type: 'resistance',
    },
    flags: [Flag.BUFF],
    state: {
      resistance: {}
    },
    modifiers: {
      outgoingDamage: (damage, current) => current,
      incomingDamage(damage, currentAmount) {
        for (const [typeName, percentage] of Object.entries(this.state.resistance)) {
          if (currentAmount <= 0) break;
          const damageType = DamageType[typeName.toUpperCase()];
          if (!damageType) continue;

          let resists = false;
          if (typeof damageType === 'function') {
            resists = damageType(damage.type);
          } else {
            resists = damage.type.includes(damageType);
          }

          if (resists) {
            currentAmount = Math.max(0, Math.round(((100 - percentage) / 100) * currentAmount));
          }
        }

        return currentAmount;
      }
    },
  };
};