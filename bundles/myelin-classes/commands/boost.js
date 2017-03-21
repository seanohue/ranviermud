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
        player.setMeta('attributePoints', attributePoints - 1);
        const attr = player.attributes.get(targetAttr)
        attr.setBase(attr.base + 1);
        say(`<b>Boosted ${targetAttr.toLowercase()} to ${attr.base + 1}!`);
      } else {
        say('<b>You do not have that attribute.</b>');
        return displayAttrs();
      }

      function displayAttrs() {
        say("<green>Attributes you can boost:</green>");
        for (const attr of player.attributes) {
          say(`<white>${attr}</white>`);
        }
      }

    }
  };
};
