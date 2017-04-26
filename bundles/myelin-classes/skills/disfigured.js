'use strict';

/**
 * Cosmetic effect and passive debuff (a la cursed).
 * Increase to incoming damage.
 * NPCs may be more likely to attack or less likely to
 * interact.
 * This is a skill rather than an effect so that it can be added
 * to certain backgrounds on chargen.
 */
module.exports = (srcPath) => {

  const SkillType = require(srcPath + 'SkillType');
  const SkillFlag = require(srcPath + 'SkillFlag');

  return {
    name: 'Disfigured',
    type: SkillType.MUTATION,
    flags: [SkillFlag.PASSIVE],
    effect: "skill.curse",
    cooldown: interval,

    configureEffect: effect => {
      effect.state = Object.assign(effect.state, {
        threshold,
        attrMultiplier,
      });

      return effect;
    },

    info: function (player) {
      return `Once every ${interval / 60} minutes, when dropping below ${threshold} energy, restore ${player.getMaxAttribute(attrMultiplier) * 2}% of your max energy.`;
    }
  };
};
