'use strict';

/**
 * Crowd control attack example.
 */
module.exports = (srcPath) => {
  const Broadcast  = require(srcPath + 'Broadcast');
  const Damage     = require(srcPath + 'Damage');
  const Random     = require(srcPath + 'RandomUtil');
  const SkillType  = require(srcPath + 'SkillType');
  const DamageType = require('../../myelin-combat/lib/DamageType');
  const Combat     = require('../../myelin-combat/lib/Combat');

  const damagePercent = 300;
  const splashDamagePercent = 150;
  const cost = 90;

  function getDamage(player, isSplash) {
    const percent = isSplash ? splashDamagePercent : damagePercent;
    const defaultMin = isSplash ? (player.level || 1) : 30;
    const defaultMax = isSplash ? 100 : 300;
    return {
      min: Math.min(player.getAttribute('intellect'), defaultMin),
      max: Math.min(player.getAttribute('intellect') * (percent / 100), defaultMax)
    };
  }

  return {
    name: 'Fireball',
    type: SkillType.COMBAT,
    initiatesCombat: true,
    isSplash: true,
    resource: [{
      attribute: 'focus',
      cost
    }, {
      attribute: 'energy',
      cost: 10
    }],
    cooldown: 45,

    run: state => function (args, player, target) {
      const possibleTargets = Combat.getValidSplashTargets(player);
      
      function fireDamageFactory(isSplash) {
        const {min, max} = getDamage(player, isSplash);
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

      Broadcast.sayAt(player, `<bold>You belch forth an <b>enormous</b> <red>ball</red></bold> <yellow>of <bold>flame</bold></yellow><bold>!</bold>`);
      Broadcast.sayAtExcept(player.room, `<bold>${player.name} unleashes a <red>ball</red></bold> <yellow>of <bold>flame</bold></yellow>!</bold>`, [player, ...possibleTargets]);
      possibleTargets.forEach(t => {
        const isMain = target === t;
        const hit = isMain || Random.probability(Combat.getSplashChance(player, t));
        if (!hit) {
          Broadcast.sayAt(player, `<b>Your fireball barely misses ${t.name}!`);
          return Broadcast.sayAt(t, `<bold>${player.name}'s fireball narrowly misses you!</bold>`);
        }

        if (!t.isNpc) {
          Broadcast.sayAt(t, `<bold>${player.name}'s <red>ball</red></bold> <yellow>of <bold>flame</bold></yellow> <bold>hits you!</bold>`);
        }
        const damage = fireDamageFactory.call(this, !isMain);
        damage.commit(t);
      });
    },

    info: (player) => {
      const {min, max} = getDamage(player);
      const chance = Combat.getSplashChance(player, null, true);
      const {min: splashMin, max: splashMax} = getDamage(player, true);
      return `Unleash a ball of fire, dealing ${min} - ${max} Fire damage to your target. This also has a ${chance}% chance to deal ${splashMin} - ${splashMax} splash damage to others in the room. Characters taking splash damage will become hostile!`;
    }
  };
};
