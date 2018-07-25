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

  function getSplashChance(player, t) {
    const chance = Combat.getSplashChance(player, t);
    return Math.min(chance + 10, 95);
  }

  function getDuration(t) {
    return Math.max(60 - t.getAttribute('willpower'), 15);
  }


  return {
    name: 'Scrapbomb',
    type: SkillType.COMBAT,
    initiatesCombat: true,
    isSplash: true,
    cooldown: 15,

    run: state => function (args, player, target) {
      const possibleTargets = Combat.getValidSplashTargets(player);

      function fireDamageFactory() {
        const min = 5;
        const max = 50;
        const damage = new Damage({
          attribute: 'health',
          amount: Random.inRange(min, max),
          attacker: player,
          type: [DamageType.FIRE],
          source: this
        });
        damage.verb = 'burns';  
        return damage;    
      }

      function bleed(t) {
        const duration = getDuration(t) * 1000;
        const min = 10;
        const max = Math.max(
          20,
          Math.min(40 - t.getAttribute('quickness') || 0)
        );
        const totalDamage = Random.inRange(min, max);
        const effect = state.EffectFactory.create(
          'skill.rend',
          t,
          {
            name: 'Scrapbomb',
            type: 'scrapbomb.bleed',
            tickInterval: Math.max(Math.ceil(duration / 5000), 6),
            duration,
            description: "You've caught some shrapnel.",
          },
          {
            totalDamage
          }
        );
        effect.skill = this;
        effect.attacker = player;
        t.addEffect(effect);
      }

      const message = 'You toss the bomb'

      Broadcast.sayAt(player, `<bold>${message} and an <yellow>explosion</yellow> shakes the room!</bold>`);
      Broadcast.sayAtExcept(player.room, `<bold>${player.name} tosses a bomb and an <yellow>explosion <bold>fills the room with fire and shrapnel</bold></yellow>!</bold>`, [player, ...possibleTargets]);
      possibleTargets.forEach(t => {
        const isMain = target === t;
        const hit = isMain || Random.probability(getSplashChance(player, t));
        if (!hit) {
          Broadcast.sayAt(player, `<b>${t.name} is unaffected!`);
          return Broadcast.sayAt(t, `<bold>${player.name}'s bomb misses you!</bold>`);
        }

        Broadcast.sayAt(player, `${t.name} is hit by the blast!`);

        if (!t.isNpc) {
          Broadcast.sayAt(t, `<bold>${player.name}'s <red>bomb <bold>blast</bold></red> <bold>coats you with fire and shrapnel!</bold>`);
        }
        const damage = fireDamageFactory.call(this)
        bleed.call(this, t);
        damage.commit(t);
      });
    },

    info: (player) => {
      return `A bomb!`;
    }
  };
};
