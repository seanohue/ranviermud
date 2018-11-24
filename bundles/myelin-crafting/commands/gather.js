'use strict';

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const { CommandParser } = require(srcPath + 'CommandParser');
  const Random = require(srcPath + 'RandomUtil');
  const ItemUtil = require(bundlePath + 'myelin-lib/lib/ItemUtil');

  return {
    usage: 'gather <resource>',
    aliases: ['salvage', 'collect', 'scavenge'],
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, "Gather what?");
      }

      let node = CommandParser.parseDot(args, player.room.items);

      if (!node) {
        return B.sayAt(player, "You don't see anything like that here.");
      }

      const resource = node.getBehavior('resource');
      if (!resource) {
        return B.sayAt(player, "You can't gather anything from that.");
      }

      if (!player.getMeta('resources')) {
        player.setMeta('resources', {});
      }

      for (const material in resource.materials) {
        const entry = resource.materials[material];
        const amount = Random.inRange(entry.min, entry.max);
        if (amount) {
          player.emit('resources', material, amount);

        }
      }

      if (resource.keepItem) {
        return node.behaviors.delete('resources');
      } 
      // destroy node, will be respawned
      state.ItemManager.remove(node);
      B.sayAt(player, `${ItemUtil.display(node)} ${resource.depletedMessage}`);
      node = null;
    }
  };
};
