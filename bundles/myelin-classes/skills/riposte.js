'use strict';

/**
 * Damage mitigation skill
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');

  // config placed here just for easy configuration of this skill later on
  const attribute = 'quickness';
  const cooldown  = 60;
  const cost      = 50;
  const maximum   = 100;
  const duration  = 30 * 1000;

  function getMagnitude(player) {
    return Math.min(Math.ceil(player.getAttribute(attribute) / 2), 30);
  }

  function getMaximum(player) {
    return Math.min(
      player.getAttribute(attribute) + player.getAttribute('willpower') + player.getAttribute('might'),
      maximum
    );
  }

  function getMinimum(player) {
    return Math.min(
      player.getAttribute(attribute),
      player.getAttribute('willpower'),
      player.getAttribute('might'),
      20
    );
  }
  
  return {
    name: 'Riposte',
    type: SkillType.SKILL,
    requiresTarget: false,
    resource: {
      attribute: 'energy',
      cost,
    },
    cooldown,

    run: state => function (args, player, target) {
      const effect = state.EffectFactory.create(
        'skill.riposte',
        player,
        {
          duration,
          description: this.info(player),
        },
        {
          magnitude: getMagnitude(player),
          minimum: getMinimum(player),
          maximum: getMaximum(player)
        }
      );
      effect.skill = this;

      Broadcast.sayAt(player, `<b>You prepare to riposte attacks!</b>`);
      Broadcast.sayAtExcept(player.room, `<b>${player.name} raises their weapon, ready to riposte incoming attacks.</b>`, [player]);
      player.addEffect(effect);
    },

    info: (player) => {
      const times = getMagnitude(player);
      return `Raise your weapon to riposte up to <bold>${times}</bold> attacks for <bold>${duration / 1000}</bold> seconds. Each riposte can block and reflect <b>${getMinimum(player)} - ${getMaximum(player)}</b> damage.`;
    }
  };
};

