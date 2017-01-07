'use strict';

const _    = require('../src/helpers');
const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    args = _.splitArgs(args);

    const attributes = player.getAttributes();
    const attr = args[0];

    if (attr in attributes) {
      const score = parseInt(args[1], 10);
      if (!score || isNaN(score)) {
        return player.say('<red>ADMIN: Not a real number.</red>');
      }

      player.setAttribute(attr, score);
      util.log("@@Admin: " + player.getName() + " set attr " + attr + " to " + score + ".");
      return player.say("<red>ADMIN: Set " + attr + " to " + score + ".</red>");
    }

    player.say('<red>ADMIN: No such attribute.</red>');
  };