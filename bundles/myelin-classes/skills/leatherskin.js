'use strict';

const Combat = require('../../ranvier-combat/lib/Combat');

/**
 * Buff armor
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');
  const cost = 30;

  const getMagnitude = player => {
    return Math.ceil(player.getAttribute('willpower') / 2);
  };

  const getDuration = player => {
    return player.getAttribute('willpower') * 2000;
  }

  const cooldown = 60;

  return {
    name: 'Leatherskin',
    type: SkillType.SKILL,
    requiresTarget: true,
    targetSelf: true,
    resource: [{
      attribute: 'focus',
      cost,
    }, {
      attribute: 'energy',
      cost,
    }],
    cooldown,

    run: state => function (args, player, target) {
      const effect = state.EffectFactory.create(
        'buff',
        target,
        {
          name: 'Leatherskin',
          duration: getDuration(player),
          description: this.info(player),
        },
        {
          magnitude: getMagnitude(player),
          attributes: ['armor']
        }
      );
      effect.skill = this;
      effect.attacker = player;

      if (target === player) {
        Broadcast.sayAt(player, `<red>You feel your skin toughen!</red>`);
      } else {
        Broadcast.sayAt(target, `<red>You feel your skin toughen as ${player.name} grants you Leatherskin!</red>`);
      }
      
      target.addEffect(effect);
    },

    info: (player) => {
      return `Increase your Armor by ${getMagnitude(player)} for ${getDuration(player) / 1000} seconds.`;
    }
  };
};