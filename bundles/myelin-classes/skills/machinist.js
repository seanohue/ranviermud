'use strict';

/**
 * Technician passive skill. 
 * So far does nothing but lets you make neutral automatons join your party.
 * Also automatons do slightly less damage to you.
 */
module.exports = (srcPath) => {
  const SkillType = require(srcPath + 'SkillType');
  const SkillFlag = require(srcPath + 'SkillFlag');

  return {
    name: 'Machinist',
    type: SkillType.SKILL,
    flags: [SkillFlag.PASSIVE],
    effect: 'skill.machinist',
    
    configureEffect: effect => {
      effect.config.persists = true;

      return effect;
    },

    info: function (player) {
      return `Due to your affinity with machines, you can turn neutral automatons into allies. You also take less damage from hostile automatons.`;
    }
  };
};
