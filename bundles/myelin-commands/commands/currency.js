'use strict';

// Documentation: http://ranviermud.com/extending/commands/

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    aliases: [ "money", "theans", "purse" ],
    command: state => (args, player) => {
      const playerResources = player.getMeta('currencies');

      if (!playerResources) {
        return B.sayAt(player, "You haven't gathered any currency.");
      }

      B.sayAt(player, '<b>Currency</b>');
      B.sayAt(player, B.line(40));
      let totalAmount = 0;
      for (const resourceKey in playerResources) {
        const amount = playerResources[resourceKey];
        totalAmount += amount;

        B.sayAt(player, `${B.capitalize(resourceKey)} x ${amount}`);
      }

      if (!totalAmount) {
        return B.sayAt(player, "You haven't gathered any resources.");
      }
    }
  };
};