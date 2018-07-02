'use strict';

/**
 * Crowd control attack example.
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const Random = require(srcPath + 'RandomUtil');
  const SkillType = require(srcPath + 'SkillType');
  const DamageType = require('../../myelin-combat/lib/DamageType');

  const damagePercent = 90;
  const cost = 40;

  function getDamage(player) {
    return {
      min: player.getAttribute('intellect'),
      max: player.getAttribute('intellect') * (damagePercent / 100)
    };
  }

  return {
    name: 'Flare',
    type: SkillType.SKILL,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'focus',
      cost,
    },
    cooldown: 20,

    run: state => function (args, player, target) {
      if (player.combatants.size === 0) {
        Broadcast.sayAt(player, 'You are not fighting anyone.');
        Broadcast.sayAt(player, 'You can only use <b>Flare</b> on a group of enemies.');
        return false;
      }
      
      function fireDamageFactory() {
        const {min, max} = getDamage(player);
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

      const targets = [...player.combatants];

      Broadcast.sayAt(player, `<bold>You spin and a <red>fan</red></bold> <yellow>of <bold>flame</bold></yellow> <bold>hits your foes!</bold>`);
      Broadcast.sayAtExcept(player.room, `<bold>With a gesture and a glare, ${player.name} unleashes a <red>fan</red></bold> <yellow>of <bold>flame</bold></yellow> <bold>at their foes!</bold>`, [player, ...player.combatants]);
      targets.forEach(t => {
        if (!t.isNpc) {
          Broadcast.sayAt(t, `<bold>With a gesture and a glare, ${player.name} unleashes a <red>fan</red></bold> <yellow>of <bold>flame</bold></yellow> <bold>at you!</bold>`);
        }
        const damage = fireDamageFactory.call(this);
        damage.commit(t);
      });
    },

    info: (player) => {
      const {min, max} = getDamage(player);
      return `Unleash a fan of flame at your target and all other enemy combatants, dealing ${min} - ${max} Fire damage to each.`;
    }
  };
};
