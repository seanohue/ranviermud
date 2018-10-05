'use strict';

// Minor targeted healing.
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal      = require(srcPath + 'Heal');
  const SkillType = require(srcPath + 'SkillType');
  const Random    = require(srcPath + 'RandomUtil');

  const healPercent = 100;
  const focusCost   = 40;

  function getHeal(player) {
    return {
      min: Math.min(player.getAttribute('willpower') + (player.level || 0), 20),
      max: Math.min(player.getAttribute('willpower') * (healPercent / 100) 
           + (player.getAttribute('intellect') * 0.5) 
           + (player.level * 2 || 1), 100)
    };  
  }

  return {
    name:            'Cloudmend',
    type:            SkillType.FEAT,
    initiatesCombat: false,
    targetSelf:      true,
    cooldown:        20,

    resource: {
      attribute: 'focus',
      cost:      focusCost,
    },

    run: state => function (args, player) {
      const healRange = getHeal(player);
      heal(player, range);
      if (!player.party) return;
      
      [...player.party]
        .filter(ally => ally !== player && ally.room === player.room)
        .forEach(ally => heal(ally, range));
      
      function heal(target, range) {
        const maxHealth = target.getMaxAttribute('health');
        const currentHealth = target.getAttribute('health');
        let amount = Random.inRange(range.min, range.max);
        
        let attribute = 'health';

        // Handle full health
        const atFullHealth = currentHealth >= maxHealth;
        if (atFullHealth) {
          attribute = 'focus';
          amount = focusCost;
        }
        
        const healing = new Heal({
          attribute,
          amount,
          attacker:  player,
          source:    this
        });

        if (atFullHealth) {
          healing.hidden = true;
          healing.commit(player); // restore focus cost.
          return Broadcast.sayAt(player, `<bold>${target.name} is already fully healed.`);
        }

        if (target !== player) {
          Broadcast.sayAt(player, `<bold>You concentrate on mending ${target.name}'s wounds.</bold>`);
          Broadcast.sayAtExcept(player.room, `bold>${player.name} closes their eyes, concentrating on ${target.name}'s wounds.</bold>`, [target, player]);
          if (!target.isNpc) Broadcast.sayAt(target, `<bold>${player.name} closes their eyes,and you can feel your wounds mending themselves.</bold>`);
        } else {
          Broadcast.sayAt(player, "<bold>You concentrate on soothing your own wounds.</bold>");
          Broadcast.sayAtExcept(player.room, `<bold>${player.name} concentrates, and their wounds mend themselves before your eyes.</bold>`, [player, target]);
        }

        healing.commit(target);
      }
    },

    info: (player) => {
      const healRange = getHeal(player);
      return `Emit a cloud of healing nanites to mend yourself and any allies in the vicinity.`;
    }
  };
};
