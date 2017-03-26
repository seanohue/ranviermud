'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const { sayAt, center, line } = Broadcast;
  return {
    aliases: [ "learn", "train" ],
    command : state => (args, player) => {
      const say = (message, wrapWidth) => sayAt(player, message, wrapWidth);

      if (!args.length) {
        return say("What ability do you want to add to your repertoire? Use 'skills' to view all skills/abilities.");
      }

      let available = player.playerClass.getAbilitiesForPlayer(player)
      let purchaseable = available.filter(ability => player.playerClass.canPurchaseAbility(player, ability));

      let skill = purchaseable.filter(name => args === name);

      if (skill.length !== 1) {
        return say("You cannot gain that ability.");
      }

      if (!skill) {
        return say("No such skill or ability.");
      }

      let abilityPoints = player.getMeta('abilityPoints') || 0;

      if (!abilityPoints) {
        return say("You are not ready to earn new abilities yet...");
      }

      const cost = player.playerClass.abilityTable.skills[skill].cost || 1;
      player.setMeta('abilityPoints', abilityPoints - cost);

      //TODO: Remember to set abilities to empty array on char create.
      const newAbilities = player.getMeta('abilities') ?
        player.getMeta('abilities').concat(skill) :
        [].concat(skill);
      player.setMeta('abilities', newAbilities);

      say(`You now have ${skill} as an ability.`);
    }
  };
};


