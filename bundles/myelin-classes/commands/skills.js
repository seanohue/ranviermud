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

      if (learnableAbilities.length > 0) {
        say("<b>" + B.center(80, 'Learnable Abilities', 'green'));
        say("<b>" + B.line(80, '=', 'green'));
        for (const ability of learnableAbilities) {
          const cost = player.playerClass.abilityTable.skills[ability].cost || 1;
          say(B.center(80, `${B.capitalize(ability.trim())} (cost: ${cost})`, 'white'));
        }
      }

      say(""); // Divide with newline

      const otherAbilities = player.playerClass.abilityList
        .filter(ability => !(learnableAbilities.includes(ability) || ownAbilities.includes(ability)));

        if (otherAbilities.length > 0) {
          say("<b>" + B.center(80, 'Other Abilities', 'cyan'));
          say("<b>" + B.line(80, '=', 'cyan'));
          for (const ability of otherAbilities) {
            const abilityDef = player.playerClass.abilityTable.skills[ability] || {};
            if (abilityDef.level > player.level) {
              continue;
            }
            const prereqs = Object.entries(abilityDef);
            say(B.center(80, `${B.capitalize(ability.trim())}`, 'white'));
    
            if (prereqs.length || prereqs.size) say(B.center(80, 'Prerequisites:', 'cyan'));
            for (const [prereq, value] of prereqs) {
              say(B.center(80, `${prereq}: ${value}`, 'cyan'));
            }
            say("");
          }
        }

      const abilityPoints = player.getMeta('abilityPoints') || 0;

      say("<b>" + B.line(80, '=', 'green') + "</b>");
      say("");
      say(`<b>You have <white>${abilityPoints} points</white> to spent on abilities.`);
    }
  };
};