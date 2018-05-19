'use strict';

/**
 * Basic cleric spell
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const SkillType = require(srcPath + 'SkillType');

  const healPercent = 300;
  const focusCost = 40;

  function getHeal(player) {
    return {
      min: player.getAttribute('intellect') * (healPercent / 100),
      max: player.getAttribute('intellect') * (healPercent / 100) + player.getAttribute('willpower');
    }
  }

  return {
    name: 'Enervate',
    type: SkillType.SKILL,
    requiresTarget: true,
    initiatesCombat: false,
    targetSelf: true,
  
    resource: {
      attribute: 'focus',
      cost: focusCost,
    },
    cooldown: 10,

    run: state => function (args, player, target) {
      let attribute = 'energy';

      const healRange = getHeal(player);
      const max = target.getMaxAttribute(attribute);
      const current = target.getAttribute(attribute);
      let amount = Random.inRange(healRange.min, healRange.max);

      const atFullEnergy = current>= max;
      if (atFullEnergy) {
        attribute = 'focus';
        amount = focusCost;
      }

      const heal = new Heal({
        attribute,
        amount,
        attacker: player,
        source: this
      });

      if (atFullHealth) {
        heal.hidden = true;
        heal.commit(player); // restore focus cost.
        return Broadcast.sayAt(player, `<bold>${target.name} is already fully energized.`);
      }

      if (target !== player) {
        Broadcast.sayAt(player, `<b>You call upon to the light to heal ${target.name}'s wounds.</b>`);
        Broadcast.sayAtExcept(player.room, `<b>${player.name} calls upon to the light to heal ${target.name}'s wounds.</b>`, [target, player]);
        Broadcast.sayAt(target, `<b>${player.name} calls upon to the light to heal your wounds.</b>`);
      } else {
        Broadcast.sayAt(player, "<b>You call upon to the light to heal your wounds.</b>");
        Broadcast.sayAtExcept(player.room, `<b>${player.name} calls upon to the light to heal their wounds.</b>`, [player, target]);
      }

      heal.commit(target);
    },

    info: (player) => {
      return `Call upon the light to heal your target's wounds for ${healPercent}% of your Intellect.`;
    }
  };
};
