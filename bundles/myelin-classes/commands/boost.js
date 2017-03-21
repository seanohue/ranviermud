'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    command: state => (args, player) => {
      const say = message => B.sayAt(player, message);
      const attributePoints = player.getMeta('attributePoints');
      const targetAttr = args.split(' ')[0].trim();

      if (!attributePoints) {
        return say(`You are not able to boost your attributes.`);
      }

      if (!targetAttr || !targetAttr.length) {
        say('<b>Which attributes would you like to boost?</b>');
        return displayAttrs();
      }

      if (player.attributes.has(targetAttr)) {
        const attr = player.attributes.get(targetAttr)

        if (attr.isDerived) {
          say('<b>That specific attribute cannot be boosted directly...</b>');
          return displayAttrs();
        }

        player.setMeta('attributePoints', attributePoints - 1);
        attr.setBase(attr.base + 1);
        say(`<b>Boosted ${attr.name} to ${attr.base}!`);
        say(`<b>You have ${player.getMeta('attributePoints')} attribute points remaining.</b>`);
      } else {
        say('<b>You do not have that attribute.</b>');
        return displayAttrs();
      }

      function displayAttrs() {
        say("<green>Attributes you can boost:</green>");
        for (const [name, attr] of player.attributes) {
          if (attr.isDerived) {
            continue;
          }
          say(`<white>${name}</white>`);
        }
      }

    }
  };
};
