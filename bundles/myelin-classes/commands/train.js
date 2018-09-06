'use strict';

const sprintf = require('sprintf-js').sprintf;

const pools = ['health', 'energy', 'focus'];

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    usage: 'train [attribute] [amount]',
    aliases: ['levelup', 'advance', 'boost', 'practice'],

    command: state => (args, player) => {
      const say = message => B.sayAt(player, message);
      const attributePoints = player.getMeta('attributePoints');
      const splitArgs  = args.split(' ')
      const targetAttr = (splitArgs[0] || '').trim();
      const amount = splitArgs.length > 1 ? 
        Math.floor(Math.max(Number(splitArgs[1].trim()) || 1, 1)) :
        1;

      if (!attributePoints) {
        return say(`You are not able to boost your attributes.`);
      }

      if (amount > attributePoints) {
        return say(`You only have ${attributePoints} points for boosting your attributes.`);
      }

      if (!targetAttr || !targetAttr.length) {
        say('<b>Which attributes would you like to boost?</b>');
        say(`You have <b>${attributePoints} points</b> to spend on attributes.`);
        return displayAttrs();
      }

      const findAttrKey = (str) => [...player.attributes.keys()].find(key => key.startsWith(str));
      const attrKey = player.attributes.has(targetAttr) ? targetAttr : findAttrKey(targetAttr);
      const attr = player.attributes.get(attrKey);

      if (attr) {
        const increment = pools.includes(attrKey) ? (15 * amount) : amount;
        player.setMeta('attributePoints', attributePoints - amount);
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
          say(`<white>${name}</white> <b>${pools.includes(name) ? '(+15 per point)' : '(+1 per point)'}</b>`);
        }
      }
    }
  };
};
