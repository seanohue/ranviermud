'use strict';

const leftPad = require('left-pad');
const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };
const {sprintf} = require('sprintf-js');

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const CommandParser = require(srcPath + 'CommandParser').CommandParser;
  const Item = require(srcPath + 'Item');
  const ItemType = require(srcPath + 'ItemType');
  const Logger = require(srcPath + 'Logger');
  const Player = require(srcPath + 'Player');
  const ItemUtil = require(bundlePath + 'myelin-lib/lib/ItemUtil');

  return {
    usage: "look [thing]",
    aliases: ['inspect', 'examine'],
    command: state => (args, player) => {
      if (!player.room) {
        Logger.error(player.getName() + ' is in limbo.');
        return B.sayAt(player, 'You are in a deep, dark void.');
      }

      if (args) {
        return lookEntity(state, player, args);
      }

      lookRoom(state, player);
    }
  };

  function lookRoom(state, player) {
    const room = player.room;
    room.emit('look', player);
  }

  function lookEntity(state, player, args) {
    const room = player.room;

    args = args.split(' ');
    let search = null;

    if (args.length > 1) {
      search = args[0] === 'in' ? args[1] : args[0];
    } else {
      search = args[0];
    }

    let entity = CommandParser.parseDot(search, room.items);
    entity = entity || CommandParser.parseDot(search, room.players);
    entity = entity || CommandParser.parseDot(search, room.npcs);
    entity = entity || CommandParser.parseDot(search, player.inventory);

    if (!entity) {
      return B.sayAt(player, "You don't see anything like that here.");
    }

    if (entity instanceof Player) {
      // TODO: Show player equipment?
      B.sayAt(player, `You see ${entity.name}.`);
      entity.emit('look', player); // yay
      return;
    }

    B.sayAt(player, entity.description, 80);

    if (entity.timeUntilDecay) {
      B.sayAt(player, `You estimate that ${entity.name} will rot away in ${humanize(entity.timeUntilDecay)}.`);
    }

    const usable = entity.getBehavior('usable');
    if (usable) {
      if (usable.spell) {
        const useSpell = state.SpellManager.get(usable.spell);
        if (useSpell) {
          useSpell.options = usable.options;
          B.sayAt(player, useSpell.info(player));
        }
      }

      if (usable.effect && usable.config.description) {
        B.sayAt(player, usable.config.description);
      }

      if (usable.charges) {
        B.sayAt(player, `There are ${usable.charges} charges remaining.`);
      }
    }

    if (entity instanceof Item) {
      switch (entity.type) {
        case ItemType.WEAPON:
        case ItemType.ARMOR:
          B.sayAt(player, ItemUtil.renderItem(state, entity, player));
          break
        case ItemType.CONTAINER: {
          if (!entity.inventory || !entity.inventory.size) {
            B.sayAt(player, `${entity.name} is empty.`);
            break;
          }

          if (entity.closed) {
            B.sayAt(player, `It is closed.`);
            break;
          }

          B.at(player, 'Contents');
          if (isFinite(entity.inventory.getMax())) {
            B.at(player, ` (${entity.inventory.size}/${entity.inventory.getMax()})`);
          }
          B.sayAt(player, ':');

          for (const [, item ] of entity.inventory) {
            B.sayAt(player, '  ' + ItemUtil.display(item));
          }
          break;
        }
      }
    }

    // For room-specific descriptiony things.
    room.emit('itemLook', player, entity.entityReference);
    entity.emit('look', player);
  }
};
