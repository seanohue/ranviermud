'use strict';

/**
 * Generic effect used for equipment's stats
 */

const DamageType = require('../../myelin-combat/lib/DamageType');
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Armor',
      description: '',
      type: 'armor',
      hidden: true,
    },
    state: {
      attribute: 'armor',
      typeMethod: 'isPhysical',
      multiplier: 1
    },
    flags: [Flag.BUFF],
    modifiers: {
      incomingDamage(damage, currentAmount) {
        if (DamageType[this.state.typeMethod](damage.type)) {
          const attr = this.state.attribute || 'armor';
          const isCrushing = damage.type.includes(DamageType.CRUSHING);
          const soak = (this.target.getAttribute(attr) || 0) * this.state.multiplier;
          return isCrushing 
          ? currentAmount - Math.ceil(soak * 0.75)
          : currentAmount - soak;
        }

        return currentAmount;
      }
    },
  };
};
