'use strict';

const _          = require('../src/helpers.js');
const { Skills } = require('./skills');

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    args = _.splitArgs(args);

    if (!player || !args || !args.length) { 
      return; 
    }

    const skill  = Skills[args[0]];
    const number = parseInt(args[1], 10) > 0 ? 
      args[1] : 
      1;

    if (skill) {
      player.setSkill(skill, number);
      player.say("<red>ADMIN: Added " + args + ".</red>");
    } else { 
      player.say("<red>ADMIN: No such skill.</red>"); 
    }

    util.log("@@Admin: " + player.getName() + " added skill:", skill);
  };