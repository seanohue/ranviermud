'use strict';

// Minor targeted healing.
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal      = require(srcPath + 'Heal');
  const SkillType = require(srcPath + 'SkillType');
  const Random    = require(srcPath + 'RandomUtil');

  function getMagnitude(player) {
    return Math.ceil(
      Math.min(player.getAttribute('intellect') / 3, 10)
    );
  }

  function getDuration(player) {
    return Math.max(player.getAttribute('willpower'), 30) * 1000;
  }

  const focusCost = 15;

  return {
    name:            'Weaken',
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

      const weakeningEffect = state.EffectFactory.create(
        'debuff',
        target,
        {
          name: 'Weakness',
          duration: duration,
          description: 'Your muscles feel unresponsive and atrophied...',
        },
        {
          magnitude: magnitude,
          attributes: ['quickness', 'might'],
          activated: `<red>You feel weak and slow.</red>`,
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
      return `Decreases a target's Might and Quickness by ${magnitude} points for ${Math.ceil(duration / 1000)} seconds.`;
    }
  };
};