'use strict';

module.exports = srcPath => {
  const Heal = require(srcPath + 'Heal');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Machinist',
      type: 'skill.machinist',
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 2
    },
    modifiers: {
      incomingDamage(damage, currentAmount) {
        if (damage instanceof Heal ||
          damage.attribute !== 'health' ||
          !damage.source || !damage.source.isNpc
        ) {
          return currentAmount;
        }

        if (damage.source.keywords.some(keyword => keyword.includes('auto'))) {
          return Math.max(currentAmount - 5, 0);
        }

        return currentAmount;
      },
      outgoingDamage(damage, currentAmount) { return currentAmount; }
    },
  }
};