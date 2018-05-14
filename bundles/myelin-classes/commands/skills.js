'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    aliases: [ 'abilities', 'feats' ],
    command: state => (args, player) => {
      const say = message => B.sayAt(player, message);
      say("<b>" + B.center(80, 'Your Abilities', 'green'));
      say("<b>" + B.line(80, '=', 'green'));
      const ownAbilities = player.playerClass.getOwnAbilitiesForPlayer(player);
      console.log({ownAbilities});
      if (ownAbilities.length > 0) {
        for (const ability of ownAbilities) {
          say(B.center(80, `${B.capitalize(ability.trim())}`, "white"));
        }
      } else {
        say(B.center(80, "None", "white"));
      }

      say(""); // Divide with newline

      const learnableAbilities = player.playerClass
        .getAbilitiesForPlayer(player)
        .filter(ability => player.playerClass.canPurchaseAbility(player, ability));
      console.log({learnableAbilities});

      if (learnableAbilities.length > 0) {
        say("<b>" + B.center(80, 'Learnable Abilities', 'green'));
        say("<b>" + B.line(80, '=', 'green'));
        for (const ability of learnableAbilities) {
          const cost = player.playerClass.abilityTable.skills[ability].cost || 1;
          say(B.center(80, `${B.capitalize(ability.trim())} (cost: ${cost})`, 'white'));
        }
      }

      const abilityPoints = player.getMeta('abilityPoints') || 0;

      say("<b>" + B.line(80, '=', 'green') + "</b>");
      say("");
      say(`<b>You have <white>${abilityPoints} points</white> to spent on abilities.`);
    }
  };
};