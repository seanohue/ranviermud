'use strict';

const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    const allItems = items.objects;
    player.warn(`UUIDs: ${Object.keys(allItems)}`);
    player.warn(`========`);
    player.warn("GLOBAL ITEMS:\n");
    
    for (let uid in allItems) {
      const item = allItems[uid];

      player.say(item.getShortDesc());
      player.say('\n');
      player.say('vnum: ' + item.getVnum());
      player.say('uuid: ' + item.getUuid());
      player.say('location: ' + item.getRoom());
      player.say('\n')
      player.say(item.isEquipped() ? 'Equipped' : 'Not equipped');

      const container = item.getContainer();
      player.say(container ? 'Container: ' + container : 'No container.');

      const inventory = item.getInventory();
      player.say(inventory ? 'Inventory: ' : 'No inventory.');
      if (inventory) {
        for (let i in inventory) {
          player.say(`${i}: ${inventory[i].getShortDesc()} ${i.getUuid()}`);
        }
      }
      player.warn('========\n');
    }

  }