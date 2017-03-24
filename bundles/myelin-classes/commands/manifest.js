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

      let purchaseable = player.playerClass.getAbilitiesForPlayer(player);

      //TODO: Get rid of spells.
      let skill = purchaseable.filter(name => args === name);

      if (skill.length !== 1) {
        return say("You'll have to be more specific than that...");
      }

      if (!skill) {
        return say("No such skill or ability.");
      }

      let abilityPoints = player.getMeta('abilityPoints') || 0;

      if (!abilityPoints) {
        return say("You are not ready to earn new abilities yet...");
      }

      player.setMeta('abilityPoints', abilityPoints - 1);

      //TODO: Remember to set purchasedAbilities to '' or empty array on char create.
      const newAbilities = this.getMeta('purchasedAbilities').concat(skill);
      player.setMeta('purchasedAbilities', newAbiltiies);

      say(`You now have ${skill} as an ability.`);
    }
  };
};


