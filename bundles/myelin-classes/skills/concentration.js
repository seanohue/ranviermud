'use strict';

/**
 * Passive focus regen if below a certain amount.
 */
module.exports = (srcPath) => {
  const SkillType = require(srcPath + 'SkillType');
  const SkillFlag = require(srcPath + 'SkillFlag');

  const interval = 90;
  const threshold = 40;
  const attrMultiplier = 'willpower';

  return {
    name: 'Concentration',
    type: SkillType.SKILL,
    flags: [SkillFlag.PASSIVE],
    effect: "skill.concentration",
    cooldown: interval,

    configureEffect: effect => {
      effect.config.persists = true;
      effect.state = Object.assign(effect.state, {
        threshold,
        attrMultiplier,
        persists
      });

      return effect;
    },

    info(player) {
      return `Once every ${interval / 60} minutes, when dropping below ${threshold} focus, restore ${Math.min(player.getMaxAttribute(attrMultiplier) * 2, 100)}% of your max focus.`;
    }
  };
};