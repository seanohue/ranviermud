'use strict';

/**
 * Passive combat-stat bonuses based on level.
 */
module.exports = (srcPath) => {

  const SkillType = require(srcPath + 'SkillType');
  const SkillFlag = require(srcPath + 'SkillFlag');

  function getMagnitude(player) {
    return Math.min(Math.max(Math.ceil(player.level / 5), 2), 10);
  }

  return {
    name: 'Tactics',
    type: SkillType.FEAT,
    flags: [SkillFlag.PASSIVE],
    effect: "skill.tactics",

    configureEffect: effect => {
      effect.state = Object.assign(effect.state, {
        magnitude: getMagnitude(effect.target)
      });

      return effect;
    },

    info(player) {
      return `Due to your tactical mind, you gain +${getMagnitude(player)} to armor and critical chance.`;
    }
  };
};
