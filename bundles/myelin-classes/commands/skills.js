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

      const availableAbilities = player.playerClass.getAbilitiesForPlayer(player);
      if (availableAbilities.length > 0) {
        say("<b>" + B.center(80, 'Available Abilities', 'green'));
        say("<b>" + B.line(80, '=', 'green'));
        for (const ability of availableAbilities) {
          console.log("==", ability);
          say(B.center(80, `${B.capitalize(ability.trim())}`, 'white'));
        }
      }
    }
  };
};
