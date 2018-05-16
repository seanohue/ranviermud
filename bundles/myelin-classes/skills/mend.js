'use strict';

// Minor targeted healing.
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal      = require(srcPath + 'Heal');
  const SkillType = require(srcPath + 'SkillType');
  const Random    = require(srcPath + 'RandomUtil');

  const healPercent = 120;
  const focusCost   = 40;

  function getHeal(player) {
    return {
      min: player.getAttribute('willpower'),
      max: player.getAttribute('willpower') * (healPercent / 100) + (player.getAttribute('intellect') * 0.5)
    };  
  }

  return {
    name:            'Mend',
    type:            SkillType.FEAT,
    requiresTarget:  true,
    initiatesCombat: false,
    targetSelf:      true,
    cooldown:        10,

    resource: {
      attribute: 'focus',
      cost:      focusCost,
    },

    run: state => function (args, player, target) {
      const healRange = getHeal(player);
      const heal = new Heal({
        attribute: 'health',
        amount:    Random.inRange(healRange.min, healRange.max),
        attacker:  player,
        source:    this
      });

      if (target !== player) {
        Broadcast.sayAt(player, `<bold>You concentrate on mending ${target.name}'s wounds.</bold>`);
        Broadcast.sayAtExcept(player.room, `bold>${player.name} closes their eyes, concentrating on ${target.name}'s wounds.</bold>`, [target, player]);
        Broadcast.sayAt(target, `<bold>${player.name} closes their eyes,and you can feel your wounds mending themselves.</bold>`);
      } else {
        Broadcast.sayAt(player, "<bold>You concentrate on soothing your own wounds.</bold>");
        Broadcast.sayAtExcept(player.room, `<bold>${player.name} concentrates, and their wounds mend themselves before your eyes.</bold>`, [player, target]);
      }

      heal.commit(target);
    },

    info: (player) => {
      const healRange = getHeal(player);
      return `Psionically heal your target's wounds for ${healRange.min} to ${healRange.max} health.`;
    }
  };
};