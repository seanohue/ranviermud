'use strict';

// Minor targeted healing.
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');

  function getMagnitude(player) {
    return Math.ceil(
      Math.min(player.getAttribute('willpower') / 3, 10)
    );
  }

  function getDuration(player) {
    return Math.max(player.getAttribute('intellect'), 30) * 1000;
  }

  const focusCost = 15;

  return {
    name:            'Stupefy',
    type:            SkillType.COMBAT,
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

      const weakeningEffect = state.EffectFactory.create(
        'debuff',
        target,
        {
          name: 'Stupefy',
          duration: duration,
          description: 'Your thoughts feel foggy and sluggish...',
        },
        {
          magnitude: magnitude,
          attributes: ['willpower', 'intellect'],
          activated: `<red>Your mind feels foggy.</red>`,
        }
      );
      weakeningEffect.skill = this;
      weakeningEffect.attacker = player;

      target.addEffect(weakeningEffect);
      Broadcast.sayAt(player, `<b>You weaken ${target.name}!</b>`);
    },

    info: (player) => {
      const magnitude = getMagnitude(player);
      const duration  = getDuration(player);      
      return `Decreases a target's Intellect and Willpower by ${magnitude} points for ${Math.ceil(duration / 1000)} seconds.`;
    }
  };
};