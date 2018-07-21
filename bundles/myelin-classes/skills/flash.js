'use strict';

/**
 * Crowd control no damage (stun everyone in room)
 */
module.exports = (srcPath) => {
  const Broadcast  = require(srcPath + 'Broadcast');
  const Damage     = require(srcPath + 'Damage');
  const Random     = require(srcPath + 'RandomUtil');
  const SkillType  = require(srcPath + 'SkillType');
  const DamageType = require('../../myelin-combat/lib/DamageType');
  const Combat     = require('../../myelin-combat/lib/Combat');

  function getSplashChance(player, target) {
    const chance = Combat.getSplashChance(player, target);
    return Math.min(chance + 10, 95);
  }

  function getDuration(player) {
    return Math.min(16, 
      Math.ceil(player.getAttribute('intellect') / 2)
    );
  }

  const cost = 15;

  return {
    name: 'Flash',
    type: SkillType.SKILL,
    initiatesCombat: true,
    isSplash: true,
    resource: [{
      attribute: 'focus',
      cost
    }, {
      attribute: 'energy',
      cost
    }],
    cooldown: 45,

    run: state => function (args, player, target) {
      console.log({args, target})
      const possibleTargets = Combat.getValidSplashTargets(player);
      
      function stun(t, isSplash) {
        const chance = isSplash ? getSplashChance(player) : 100;
        const stunned = Random.probability(chance);
        if (!stunned) return null;

        // Create stun effect with duration, apply it to target.
        const effect = state.EffectFactory.create(
          'stun',
          target,
          {
            duration: (this.options && this.options.duration || getDuration(player)) * 1000,
            description: "You've been stunned."
          }
        );
        effect.skill = this;
        effect.attacker = player;


        Broadcast.sayAt(player, `<yellow>${t.name} is stunned!</yellow>`);
        Broadcast.sayAtExcept(player.room, `<yellow>${player.name} stuns ${t.name}!</yellow>`, [player, t]);
        if (!t.isNpc) {
          Broadcast.sayAt(t, `<yellow>${player.name}'s attack stuns you!</yellow>`);
        }
        t.addEffect(effect);
      }
      const message = Boolean(this.options) ?
        `You toss the flashbomb` :
        `You gesture`;

      Broadcast.sayAt(player, `<bold>${message} and a <yellow>bright light</yellow> fills the room!</bold>`);
      Broadcast.sayAtExcept(player.room, `<bold>${player.name} unleashes a <yellow>flash of <bold>light</bold></yellow>!</bold>`, [player, ...possibleTargets]);
      possibleTargets.forEach(t => {
        const isMain = target === t;
        const hit = isMain || Random.probability(getSplashChance(player, t));
        if (!hit) {
          Broadcast.sayAt(player, `<b>${t.name} is unaffected!`);
          return Broadcast.sayAt(t, `<bold>${player.name}'s flash doesn't affect you!</bold>`);
        }

        if (!t.isNpc) {
          Broadcast.sayAt(t, `<bold>${player.name}'s <yellow>flash of <bold>light</bold></yellow> <bold>fills your vision with stars!</bold>`);
        }
        stun.call(this, t, !Boolean(this.options));
      });
    },

    info: (player) => {
      const chance = getSplashChance(player);
      return `Create a bright flash of light. This has a ${chance}% chance to stun everyone in the room! The stun effect lasts for ${getDuration(player)} seconds.`;
    }
  };
};
