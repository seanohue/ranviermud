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
      heal(player, healRange);
      if (!player.party) return;
      console.log('healing party...');
      [...player.party]
        .filter(ally => ally !== player && ally.room === player.room)
        .forEach(ally => heal(ally, healRange));
      
      function heal(target, range) {
        console.log('healing ', target.name);
        let amount = Random.inRange(range.min, range.max);
        console.log(amount);   
        let attribute = 'health';
        
        const healing = new Heal({
          attribute,
          amount,
          attacker:  player,
          source:    this
        });

        if (target !== player) {
          if (!target.isNpc) Broadcast.sayAt(target, `<bold>${player.name} emits a cloud of nanites, and you can feel your wounds mending themselves.</bold>`);
        } else {
          Broadcast.sayAt(player, "<bold>The healing cloud soothes your own wounds.</bold>");
        }

        healing.commit(target);
      }
    },

    info: (player) => {
      const healRange = getHeal(player);
      return `Emit a cloud of healing nanites to mend yourself and any allies in the vicinity for ${healRange.min} to ${healRange.max} points.`;
    }
  };
};
