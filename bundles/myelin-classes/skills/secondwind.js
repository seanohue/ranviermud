'use strict';

/**
 * Passive energy regen if below a certain amount.
 */
module.exports = (srcPath) => {

  const SkillType = require(srcPath + 'SkillType');
  const SkillFlag = require(srcPath + 'SkillFlag');

  const interval = 2 * 60;
  const threshold = 30;
  const attrMultiplier = 'willpower';

  return {
    name: 'Second Wind',
    type: SkillType.FEAT,
    flags: [SkillFlag.PASSIVE],
    effect: "skill.secondwind",
    cooldown: interval,

    configureEffect: effect => {
      effect.state = Object.assign(effect.state, {
        threshold: threshold,
        attrMultiplier: attrMultiplier,
      });

      return effect;
    },

    info: function (player) {
      return `Once every ${interval / 60} minutes, when dropping below ${threshold} energy, restore ${player.getMaxAttribute(attrMultiplier) * 2}% of your max energy.`;
    }
  };
};
