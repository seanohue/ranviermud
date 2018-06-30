'use strict';

const Combat = require('../../ranvier-combat/lib/Combat');

/**
 * Buff physical attrs
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');
  const cost = 75;

  const getMagnitude = player => {
    return Math.ceil(player.getAttribute('willpower') / 2);
  };

  const getDuration = player => {
    return player.getAttribute('willpower') * 2000;
  }

  const cooldown = 40;

  return {
    name: 'Empower',
    type: SkillType.SKILL,
    requiresTarget: true,
    targetSelf: true,
    resource: {
      attribute: 'focus',
      cost,
    },
    cooldown,

    run: state => function (args, player, target) {
      const effect = state.EffectFactory.create(
        'buff',
        target,
        {
          duration: getDuration(player),
          description: this.info(player),
          persists: true,
        },
        {
          magnitude: getMagnitude(player),
          attributes: ['quickness', 'might']
        }
      );
      effect.skill = this;
      effect.attacker = player;

      if (target === player) {
        Broadcast.sayAt(player, `<red>You let out a scream as you're filled with superhuman power!</red>`);
        Broadcast.sayAtExcept(player.room, `<red>${player.name} lets out a primal scream!</red>`, [player]);
      } else {
        Broadcast.sayAt(target, `<red>You let out a scream as you're filled with superhuman power!</red>`);
        Broadcast.sayAt(target, `${player.name} has <b>Empowered</b> you!`);

        Broadcast.sayAtExcept(player.room, `<red>${target.name} lets out a primal scream!</red>`, [target]);        
      }
      
      target.addEffect(effect);
    },

    info: (player) => {
      return `Increase your (or an ally's) Might and Quickness by ${getMagnitude(player)} points for <bold>${getDuration(player) / 1000}</bold> seconds.`;
    }
  };
};