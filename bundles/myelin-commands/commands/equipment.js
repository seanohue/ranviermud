'use strict';

module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const ItemUtil = require(bundlePath + 'myelin-lib/lib/ItemUtil');

  return {
    aliases: ['worn'],
    usage: 'equipment',
    command: (state) => (args, player) => {
      if (!player.equipment.size) {
        return Broadcast.sayAt(player, "You are completely naked!");
      }

      Broadcast.sayAt(player, "Currently Equipped:");
      ItemUtil.renderEquipment(player);
    }
  };
};
