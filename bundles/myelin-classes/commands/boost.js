'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    command: state => (args, player) => {
      const say = message => B.sayAt(player, message);
      const attributePoints = player.getMeta('attributePoints');

      if (!attributePoints) {
        return say(`You are not able to boost your attributes.`);
      }

      if (!args.length) {
        say("Attributes you can boost:");
        for (const attr of player.attributes) {
          say(`<white>${attr}</white>`);
        }
        return;
      }

      //TODO: Actually boost attribute if valid.

      const availableAbilities = player.playerClass.getAbilitiesForPlayer(player);
      if (availableAbilities.length > 0) {
        say("<b>" + B.center(80, 'Available Abilities', 'green'));
        say("<b>" + B.line(80, '=', 'green'));
        for (const ability of availableAbilities) {
          say(`<white>${ability}</white>`);
        }
      }
    }
  };
};
