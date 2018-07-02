'use strict';

/**
 * Damage mitigation skill
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');

  // config placed here just for easy configuration of this skill later on
  const attribute = 'might';
  const cooldown = 45;
  const cost = 50;
  const healthPercent = 15;
  const duration = 20 * 1000;
  
  return {
    name: 'Block',
    type: SkillType.SKILL,
    requiresTarget: false,
    resource: {
      attribute: 'energy',
      cost,
    },
    cooldown,

    run: state => function (args, player, target) {
      const effect = state.EffectFactory.create(
        'skill.block',
        player,
        {
          duration,
          description: this.info(player),
        },
        {
          magnitude: Math.round(player.getMaxAttribute('health') * (healthPercent / 100))
        }
      );
      effect.skill = this;

      Broadcast.sayAt(player, `<b>You brace for incoming attacks!</b>`);
      Broadcast.sayAtExcept(player.room, `<b>${player.name} raises their defenses, bracing for incoming damage.</b>`, [player]);
      player.addEffect(effect);
    },

    info: (player) => {
      return `Raise your defenses to block damage up to <bold>${healthPercent}%</bold> of your maximum health for <bold>${duration / 1000}</bold> seconds.`;
    }
  };
};

