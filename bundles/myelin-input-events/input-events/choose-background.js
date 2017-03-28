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
    id: mendicant
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

      //TODO: Present menu with more than 1 tier if that is available.

      // List possible backgrounds.
      say(`,.${Broadcast.line(40)}/`);
      choices.forEach((choice, index) => {
        at(`[${index}] `);
        say(`${choice.name}: `);
        say(choice.description);
      });

      //TODO: Allow choosing of background.
      //TODO: Have a CYOA-esque "flashback" determining some of starting eq., etc.
      socket.once('data', data => {
        data = data.trim().toLowerCase();

        let found;
        for (const choice of choices) {
          if (data === choice.name) {
            found = choice;
            break;
          }
        }

        if (found) {
          player.setMeta('background', choices[choice]);
          //TODO: Do the other backgroundy stuff here.
          socket.emit('done', socket, { player });
        } else {
          return socket.emit('choose-background', socket, { player });
        }

      });

    }
  };
};
