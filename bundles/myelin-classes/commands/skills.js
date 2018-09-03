'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    aliases: [ 'abilities', 'feats', 'spells', 'powers' ],
    command: state => (args, player) => {
      const width = 40;
      const say = message => B.sayAt(player, message);
      say("<b>" + B.center(width, 'Your Abilities', 'green'));
      say("<b>" + B.line(width, '=', 'green'));
      const ownAbilities = player.playerClass.getOwnAbilitiesForPlayer(player);
      if (ownAbilities.length > 0) {
        for (const ability of ownAbilities) {
          say(B.center(width, `${B.capitalize(ability.trim())}`, "white"));
        }
      } else {
        say(B.center(width, "None", "white"));
      }


      const learnableAbilities = player.playerClass
        .getAbilitiesForPlayer(player)
        .filter(ability => player.playerClass.canPurchaseAbility(player, ability));

      if (learnableAbilities.length > 0) {
        say(""); // Divide with newline
        say("<b>" + B.center(width, 'Learnable Abilities', 'green'));
        say("<b>" + B.line(width, '=', 'green'));
        for (const ability of learnableAbilities) {
          const cost = player.playerClass.abilityTable.skills[ability].cost || 1;
          say(B.center(width, `${B.capitalize(ability.trim())} (cost: ${cost})`, 'white'));
        }
      }

      const abilityPoints = player.getMeta('abilityPoints') || 0;

      say("<b>" + B.line(width, '=', 'green') + "</b>");
      say("");
      say(`<b>You have <white>${abilityPoints} points</white> to spent on abilities.`);
    }
  };
};