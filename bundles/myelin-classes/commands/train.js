'use strict';

const sprintf = require('sprintf-js').sprintf;

const pools = ['health', 'energy', 'focus'];

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    usage: 'train [attribute]',
    aliases: ['boost', 'practice'],

    command: state => (args, player) => {
      const say = message => B.sayAt(player, message);
      const attributePoints = player.getMeta('attributePoints');
      const targetAttr = args.split(' ')[0].trim();

      if (!attributePoints) {
        return say(`You are not able to boost your attributes.`);
      }

      if (!targetAttr || !targetAttr.length) {
        say('<b>Which attributes would you like to boost?</b>');
        say(`You have <b>${attributePoints} points</b> to spend on attributes.`);
        return displayAttrs();
      }

      if (player.attributes.has(targetAttr)) {
        const attr = player.attributes.get(targetAttr);
        const increment = pools.includes(targetAttr) ? 15 : 1;
        player.setMeta('attributePoints', attributePoints - 1);
        attr.setBase(attr.base + increment);
        say(`<b>Training has boosted ${attr.name} to ${attr.base}!`);
        say(`<b>You have ${player.getMeta('attributePoints')} attribute points remaining.</b>`);
      } else {
        say('<b>You do not have that attribute.</b>');
        return displayAttrs();
      }

      function displayAttrs() {
        say("<green>Attributes you can boost:</green>");
        for (const [name, attr] of player.attributes) {
          say(`<white>${name}</white> <b>${pools.includes(name) ? '(+15)' : '(+1)'}</b>`);
        }
      }
    }
  };
};