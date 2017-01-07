'use strict';

const util = require('util');

const { CommandTypes } = require('../src/commands.js');

exports.command = (rooms, items, players, npcs, Commands) =>
    (args, player) => {
      const inv = player.getInventory();
      player.warn("ITEMS:\n");
      
      for (let i in inv) {
        const item = inv[i];
        player.say(item.getShortDesc());

        const attrs = item.getAttributes();
        for (let attr in attrs) {
          player.say(attr + ': ' + attrs[attr]);
        }

        const prereqs = item.getPrerequisites();
        for (let prereq in prereqs) {
          player.say(prereq + ': ' + prereqs[prereq]);
        }

        const isContainer = item.isContainer();
        const actualWeight = item.getWeight(items);
        player.say(`Is container: ${isContainer}`);
        player.say(`Total weight: ${actualWeight}`);
        
        if (isContainer) {
          const itemContents   = item.getInventory();
          const spaceLeft      = item.getRemainingSizeCapacity(items);
          const contentsWeight = item.getContainerWeight(items);
          
          player.say(`Contents: ${itemContents}`);
          player.say(`Space left: ${spaceLeft}`);
          player.say(`Contents weight: ${contentsWeight}`);
          player.say(`
          ===========`);
        }

        player.say(item.isEquipped() ? 'Equipped' : 'In inventory');
        player.say(`========`);
        player.say(`Behaviors: ${item.behaviors}, script: ${item.script}`);
        const events = item.eventNames();
        player.say(`Events: ${events.join(', ')}`);
        player.warn('========\n');
        console.log('events for ', item.getShortDesc());
        console.log(events);
      }

    };

exports.type = CommandTypes.ADMIN;
