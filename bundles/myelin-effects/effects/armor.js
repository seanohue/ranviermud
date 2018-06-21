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
      typeMethod: 'isPhysical'
    },
    flags: [Flag.BUFF],
    modifiers: {
      incomingDamage(damage, currentAmount) {
        if (DamageType[this.state.typeMethod](damage.type)) {
          return currentAmount - this.target.getAttribute(this.state.attribute || 'armor') || 0;
        }

        return currentAmount;
      }
    },
  };
};
