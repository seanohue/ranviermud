'use strict';

const _         = require('../src/helpers.js');
const util      = require('util');

const { Feats }        = require('../src/feats');
const { CommandTypes } = require('../src/commands.js');


exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    args = _.splitArgs(args);

    if (!player || !args) { return; }

    const feat = Feats[args[0]];

    if (feat) {
      player.gainFeat(feat);
      player.say("<red>ADMIN: Added " + feat.id + ".</red>");
    } else {
      return player.say("<red>ADMIN: No such feat.</red>");
    }
    util.log("@@Admin: " + player.getName() + " added feat:", feat.name);
  };

  exports.type = CommandTypes.ADMIN;
