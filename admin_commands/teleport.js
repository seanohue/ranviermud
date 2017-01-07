'use strict';

const { CommandTypes } = require('../src/commands.js');

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    
    if (!player || !player.say || !args) { return; }
    
    const vnum = parseInt(args, 10);
    
    if (isNaN(vnum)) {
      return player.say("<red>ADMIN: Invalid vnum.</red>");
    }

    if (rooms.getAt(vnum)) {
      player.setLocation(vnum);
      player.say("<red>ADMIN: You have teleported.");
      return Commands[CommandTypes.PLAYER].look(null, player);
    }

    player.say("<red>ADMIN: 404: Room not found.</red>");

  };

exports.type = CommandTypes.ADMIN;
