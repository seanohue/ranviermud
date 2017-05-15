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

    configureEffect: effect => {
      effect.state = Object.assign({}, effect.state, {
        damageToMultiply: 'health',
        damageMultiplier: 2,
        description: 'They are horrifically disfigured, their limbs bending at unnatural angles, and their face eerily inhuman.',
        shouldBroadcast: false
      });

      effect.config = Object.assign({}, effect.config, {
        name: 'Disfigured',
        persists: false // because it will be added again by the skill.
      });

      return effect;
    },

    info(player) {
      return `You have disfiguring, painful mutations and thus are prone to injury and debilitation. In addition, some beings will not want to interact with you, or will attack you on sight.`;
    }
  };
};
