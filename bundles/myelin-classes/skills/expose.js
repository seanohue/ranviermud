'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');

  function getMagnitude(player) {
    return Math.min(
      Math.round(player.getAttribute('intellect') / 3),
      10
    );
  }

  function getDuration(player) {
    return Math.max(
      player.getAttribute('intellect') + player.getAttribute('quickness'), 
      45
    ) * 1000;
  }

  function getCrit(player) {
    return Math.ceil(
      player.getAttribute('intellect') + player.getAttribute('quickness') / 10
    );
  }

  const focusCost  = 25;
  const energyCost = 5;

  return {
    name:            'Expose',
    type:            SkillType.FEAT,
    requiresTarget:  true,
    initiatesCombat: true,
    targetSelf:      false,
    cooldown:        60,

    resource: {
      attribute: 'focus',
      cost:      focusCost,
    },

    run: state => function (args, player, target) {
      const magnitude = getMagnitude(player);
      const duration  = getDuration(player);

      const armorEffect = state.EffectFactory.create(
        'debuff',
        target,
        {
          name: 'Exposed',
          duration,
          description: 'Your armor\'s weak spot is exposed.',
        },
        {
          magnitude,
          attributes: ['armor'],
          activated: `<red>Your weak spot is exposed!</red>`,
        }
      );
      armorEffect.skill = this;
      armorEffect.attacker = player;

      target.addEffect(armorEffect);

      const vulnerableEffect = state.EffectFactory.create(
        'vulnerable',
        target,
        {
          duration,
        },
        {
          magnitude: getCrit(player),
        }
      );   

      vulnerableEffect.skill = this;
      vulnerableEffect.attacker = player;
      target.addEffect(vulnerableEffect);


      Broadcast.sayAt(player, `<b>You expose ${target.name}!</b>`);
      Broadcast.sayAtExcept(player.room, `<b>${player.name} has exposed ${target.name}'s weak spot!</b>`, [player, target]);
    },

    info: (player) => {
      const magnitude = getMagnitude(player);
      const duration  = getDuration(player);   
      const crit      = getCrit(player);   
      return `Expose a target's weak spot, decreasing their armor by ${magnitude} points for ${Math.ceil(duration / 1000)} and adding an additional ${crit}% chance of a critical strike against them.`;
    }
  };
};