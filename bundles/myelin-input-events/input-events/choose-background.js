'use strict';

/**
 * Player background selection event
 */

//TODO: Have account.karma effect which "tiers" of backgrounds are available.
//      For now it is just starting tier.

module.exports = (srcPath, bundlePath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config    = require(srcPath + 'Config');
  const Data      = require(srcPath + 'Data');
  const fs        = require('fs');

  const bgPath = bundlePath + 'backgrounds/';

  /* Yaml files
    id: 1
    name: 'Acrid Mendicant'
    description: 'blah blah'
    karmaLevel: 0
    attributes: # attr: number
    equipment: # slot: id
    skills: array<stringId>

    At end of this script, emit 'bg-${id}-choice' for flashback stuff.
  */

  const choices = fs
    .readdirSync(bgPath)
    .map(bgFile => {
      return Data.parseFile(bgPath + bgFile);
    });

  return {
    event: state => (socket, args) => {
      const player = args.player;
      const say = str => Broadcast.sayAt(player, str);
      const at = str => Broadcast.at(player, str);

      /*
        Myelin does not have classes,
        however, players can choose a
        background. This determines
        starting skills, attributes, and
        inventory.
      */

      //TODO: Choose a "background".
      


      //TODO: Present menu with more than 1 tier if that is available.
      //TODO: Allow choosing of background.
      //TODO: Have a CYOA-esque "flashback" determining some of starting eq., etc.
      socket.once('data', choice => {
        socket.emit('done', socket, { player });

      });

    }
  };
};
