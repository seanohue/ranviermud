'use strict';

/**
 * Passive mental health regen if below a certain amount.
 */
module.exports = (srcPath) => {

  const SkillType = require(srcPath + 'SkillType');
  const SkillFlag = require(srcPath + 'SkillFlag');

  const interval = 90;
  const threshold = 40;
  const attrMultiplier = 'willpower';

  return {
    name: 'Concentration',
    type: SkillType.FEAT,
    flags: [SkillFlag.PASSIVE],
    effect: "skill.concentration",
    cooldown: interval,

    configureEffect: effect => {
      effect.state = Object.assign(effect.state, {
        threshold,
        attrMultiplier,
      });

      return effect;
    },

    info(player) {
      return `Once every ${interval / 60} minutes, when dropping below ${threshold} mental health, restore ${player.getMaxAttribute(attrMultiplier) * 2}% of your max mental health.`;
    }
  };
};
