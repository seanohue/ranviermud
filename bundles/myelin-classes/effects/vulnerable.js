// Vulnerability to critical hits increases by %

'use strict';

module.exports = srcPath => {
  const Heal       = require(srcPath + 'Heal');
  const Flag       = require(srcPath + 'EffectFlag');
  const Random     = require(srcPath + 'RandomUtil');
  const DamageType = require('../../myelin-combat/lib/DamageType');


  return {
    config: {
      name: 'Vulnerable',
      description: "You are more vulnerable to critical hits!",
      type: 'vulnerable',
    },
    flags: [Flag.DEBUFF],
    state: {
      magnitude: 1,
      // criticalMultiplier: 1.5, //[optional] override critical multiplier
      // type: "isPhysical", // [optional] type check fn for damageType
    },
    modifiers: {
      outgoingDamage: (damage, current) => current,
      incomingDamage(damage, currentAmount) {
        if (damage instanceof Heal || 
            damage.attribute !== 'health' || 
            damage.critical || 
            (this.state.type in DamageType && !DamageType[this.state.type](damage.type))
          ) {
          return currentAmount;
        }

        if (Random.probability(this.state.magnitude)) {
          return (currentAmount * (this.state.criticalMultipler || this.criticalMultipler || 1.5)); 
        }

        return currentAmount;
      }
    },
  };
};
