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
    return Math.min(player.getAttribute('willpower'), 30) * 2000;
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
          type: 'buff.leatherskin',
          duration: getDuration(player),
          description: this.info(player),
          persists: true,
          refreshes: true,
          listeners: {
            look: state => function(observer) {
              return Broadcast.sayAt(observer, 'Their skin has a leathery appearance.');
            },
            effectAdded: state => function(effect) {
              if (effect !== this) {
                if (effect.type === 'buff.leatherskin') {
                  this.deactivate();
                }
              }
            }
          }
        },
        {
          magnitude: getMagnitude(player),
          attributes: ['armor'],
          activated: `<red>You feel your skin toughen!</red>`,
          deactivated: `<red>Your skin returns to normal.</red>`
        }
      );
      effect.skill = this;
      effect.attacker = player;

      if (target !== player) {
        Broadcast.sayAt(target, `<cyan>${player.name} grants you Leatherskin!</cyan>`);
      }
      
      target.addEffect(effect);
    },

    info: (player) => {
      return `Increase your Armor or that of an ally by ${getMagnitude(player)} for ${getDuration(player) / 1000} seconds.`;
    }
  };
};