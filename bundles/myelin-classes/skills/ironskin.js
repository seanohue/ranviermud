'use strict';

/**
 * Buff armor
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');
  const focusCost = 45;
  const energyCost = 30;

  const getMagnitude = player => {
    return Math.ceil(player.getAttribute('willpower') / 2) 
      + Math.floor(player.getAttribute('might') / 2);
  };

  const getDebuffMagnitude = (player, target) => {
    const magnitude = Math.max(10, player.getAttribute('might'));
    const safeguard = target.getAttribute('quickness') - 1;
    return (Math.min(magnitude, safeguard));
  }

  const getDuration = player => {
    return Math.min(player.getAttribute('willpower') + 5, 45) * 2000;
  }

  const cooldown = 60;

  return {
    name: 'Ironskin',
    type: SkillType.SKILL,
    requiresTarget: true,
    targetSelf: true,
    resource: [{
      attribute: 'focus',
      cost: focusCost,
    }, {
      attribute: 'energy',
      cost: energyCost,
    }],
    cooldown,

    run: state => function (args, player, target) {
      const armorEffect = state.EffectFactory.create(
        'buff',
        target,
        {
          name: 'Ironskin Armor',
          type: 'buff.ironskin',
          duration: getDuration(player),
          description: this.info(player),
          persists: true,
          refreshes: true,
          listeners: {
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
      armorEffect.skill = this;
      armorEffect.attacker = player;

      const quicknessEffect = state.EffectFactory.create(
        'debuff',
        target,
        {
          name: 'Ironskin Slowness',
          duration: getDuration(player),
          description: this.info(player),
          listeners: {
            look: state => function(observer) {
              return Broadcast.sayAt(observer, 'Their skin has a metallic appearance.');
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
          magnitude: getDebuffMagnitude(player, target),
          attributes: ['quickness'],
          activated: `<red>You feel incredibly heavy!</red>`,
        }
      );
      quicknessEffect.skill = this;
      quicknessEffect.attacker = player;


      if (target !== player) {
        Broadcast.sayAt(target, `<cyan>${player.name} grants you Ironskin!</cyan>`);
      }

      Broadcast.sayAt(target.room, `<cyan>A resounding <b>clunk</b> fills the air.</cyan>`);

      target.addEffect(armorEffect);
      target.addEffect(quicknessEffect);
    },

    info: (player) => {
      return `Increase your Armor or that of an ally by ${getMagnitude(player)}, at a cost of as much as ${player.getAttribute('might')} Quickness, for ${getDuration(player) / 1000} seconds.`;
    }
  };
};