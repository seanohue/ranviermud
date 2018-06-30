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
    return Math.ceil(player.getAttribute('intellect') / 2);
  };

  const getDuration = player => {
    return player.getAttribute('intellect') * 2000;
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
          attributes: ['willpower', 'intellect']
        }
      );
      effect.skill = this;
      effect.attacker = player;

      if (target === player) {
        Broadcast.sayAt(player, `<cyan>Your mind reels as you see the full scope of the universe!</cyan>`);
      } else {
        Broadcast.sayAt(target, `<red>Your mind reels as you see the full scope of the universe!</red>`);
        Broadcast.sayAt(target, `${player.name} has <b>Enlightened</b> you!`);
      }
      
      target.addEffect(effect);
    },

    info: (player) => {
      return `Increase your (or an ally's) Might and Quickness by ${getMagnitude(player)} points for <bold>${getDuration(player) / 1000}</bold> seconds.`;
    }
  };
};