'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const Player = require(srcPath + 'Player');
  const Flag = require(srcPath + 'EffectFlag');
  //TODO: Fix with damagetypes thing

  return {
    config: {
      name: 'Aethersilk',
      description: "Guards against psionic attacks.",
      type: 'aethersilk',
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 1
    },
    modifiers: {
      outgoingDamage: (damage, current) => current,
      incomingDamage(damage, currentAmount) {
        if (damage.type !== 'psionic') {
          return currentAmount;
        }

        const absorbed = Math.min(this.state.magnitude, currentAmount);
        currentAmount -= absorbed;

        return currentAmount;
      }
    },
  };
};