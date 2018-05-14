'use strict';

/**
 * Damage mitigation skill
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');

  // config placed here just for easy configuration of this skill later on
  const attribute = 'quickness';
  const cooldown = 45;
  const cost = 50;
  
  function getDuration(player) {
    return 1 + (player.getMaxAttribute('quickness')) * 1000;
  }
  
  function getDodgeChance(player) {
    return 10 + player.getMaxAttribute('quickness');
  }

  return {
    name: 'Dodge',
    type: SkillType.SKILL,
    requiresTarget: false,
    resource: [{
      attribute: 'energy',
      cost,
    }, {
      attribute: 'focus',
      cost: Math.floor(cost / 2),
    }],
    cooldown,

    run: state => function (args, player, target) {
      const effect = state.EffectFactory.create(
        'skill.dodge',
        player,
        {
          duration:    getDuration(player),
          description: this.info(player),
        },
        {
          magnitude: getDodgeChance(player)
        }
      );
      effect.skill = this;

      Broadcast.sayAt(player, `<b>You prepare to dodge incoming attacks!</b>`);
      Broadcast.sayAtExcept(player.room, `<b>${player.name} is looking a bit dodgy...</b>`, [player]);
      player.addEffect(effect);
    },

    info: (player) => {
      return `Attempt to dodge attacks for a <bold>${getDodgeChance(player)}%</bold> chance of completely avoiding damage for <bold>${getDuration(player) / 1000}</bold> seconds.`;
    }
  };
};

