'use strict';

// Syntax: take [item] from [container] (from is optional)

// When finding container/item:
// - Look in room's containers first (looting!)
// - Then look in worn containers.

// When deciding where item goes:
// - If taken from worn container:
// - - Hold in hand if hand is free.
// - - Warn player otherwise.
// - - ?
//TODO: Have drop command search containers for items to drop?

// - If taken from room's container...
// - - Hold in hand if hand is free.
// - - Put in a worn/held container if one is free.
// - - Warn player otherwise.


const util        = require('util');
const _           = require('../src/helpers');
const CommandUtil = require('../src/command_util').CommandUtil;
const Broadcast   = require('../src/broadcast').Broadcast;

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    args = args.trim();

    if (!args) {
      return player.warn('Take which item from which container?');
    }

    const room = rooms.getAt(player.getLocation());
    const toRoom = Broadcast.toRoom(room, player, null, players);

    const [ itemTarget, containerTarget ] = _.getTargets(args);

    const container = findContainer(containerTarget);

    if (!container) {
      return player.warn('Take ' + itemTarget + ' from which container?');
    }

    const item = findItemInContainer(itemTarget, container);
    const containerDesc = container.getShortDesc();

    if (!item) {
      toRoom({ thirdPartyMessage: player.getName() + ' roots around in ' + containerDesc + ' and comes up empty-handed.' });
      return player.warn('Could not find ' + itemTarget + ' in ' + containerDesc + '.');
    }

    takeFromContainer(item, container)

    // do a thing

    function findContainer(containerTarget) {
      return CommandUtil.findItemInInventory(containerTarget, player, true) || CommandUtil.findItemInRoom(items, containerTarget, room, player, true);
    }

    function findItemInContainer(itemTarget, container) {
      return container.getInventory()
        .map(uid => items.get(uid))
        .filter(item => item.hasKeyword(itemTarget))[0];
  };

  function takeFromContainer(item, container) {
    container.removeItem(item.getUuid());
    item.setContainer(null);
    item.setHolder(player.getName());
    player.addItem(item);
    
    const itemName = item.getShortDesc();
    toRoom({
      firstPartyMessage: `You reach into the ${containerDesc} and take the ${itemName}.`,
      thirdPartyMessage: `${player.getName()} reaches into the ${containerDesc} and takes the ${itemName}.`
    });
  }

  /* Use this in take and get eventually, maybe put in item utils? */
  //TODO: SAVE THIS FOR TAKE/GET?
  function findOptimalContainer(item) {
    const inventory  = player.getInventory();
    const itemSize   = item.getAttribute('size')   || 1;
    const itemWeight = item.getAttribute('weight') || 1;

    const availableContainers = inventory
      .filter(item => item.isContainer());

    return availableContainers[0] || null;
    // TODO: Then filter for ones that can fit the item.
  }
}