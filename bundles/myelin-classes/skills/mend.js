'use strict';

// Minor targeted healing.
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const SkillType = require(srcPath + 'SkillType');

  const healPercent = 120;
  const mentalCost = 40;

  function getHeal(player) {
    return player.getAttribute('intellect') * (healPercent / 100);
  }

  return {
    name: 'Mend',
    type: SkillType.FEAT,
    requiresTarget: true,
    initiatesCombat: false,
    targetSelf: true,
    resource: {
      attribute: 'mental',
      cost: mentalCost,
    },
    cooldown: 10,

    run: state => function (args, player, target) {
      const heal = new Heal({
        attribute: 'physical',
        amount: getHeal(player),
        attacker: player,
        source: this
      });

      if (target !== player) {
        Broadcast.sayAt(player, `bold>You concentrate on mending ${target.name}'s wounds.</bold>`);
        Broadcast.sayAtExcept(player.room, `bold>${player.name} closes their eyes, concentrating on ${target.name}'s wounds.</bold>`, [target, player]);
        Broadcast.sayAt(target, `bold>${player.name} closes their eyes,and you can feel your wounds mending themselves.</bold>`);
      } else {
        Broadcast.sayAt(player, "<bold>You concentrate on soothing your own wounds.</bold>");
        Broadcast.sayAtExcept(player.room, `bold>${player.name} concentrates, and their wounds mend themselves before your eyes.</bold>`, [player, target]);
      }

      heal.commit(target);
    },

    info: (player) => {
      return `Psionically heal your target's wounds for ${healPercent}% of your Intellect.`;
    }
  };
};
