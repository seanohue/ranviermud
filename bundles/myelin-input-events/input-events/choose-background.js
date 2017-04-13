'use strict';

/**
 * Player background selection event
 */

//TODO: Have account.karma effect which "tiers" of backgrounds are available.
//      For now it is just starting tier.

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config    = require(srcPath + 'Config');
  const Data      = require(srcPath + 'Data');
  const fs        = require('fs');

  const bgPath = __dirname + '/../backgrounds/';

  const choices = fs
    .readdirSync(bgPath)
    .map(bgFile => {
      return Data.parseFile(bgPath + bgFile);
    });

  return {
    event: state => (socket, args) => {
      const { playerName, account, socket } = args;
      const say = str => Broadcast.sayAt(socket, str);
      const at = str => Broadcast.at(socket, str);
      const wrapDesc = str => Broadcast.sayAt(socket, str, 40);

      /*
        Myelin does not have classes,
        however, players can choose a
        background. This determines
        starting skills, attributes, and
        inventory.
      */

      //TODO: Present menu with more than 1 tier if that is available.

      // List possible backgrounds.
      say("Choose Your Origin:");
      say(`${Broadcast.line(40)}/`);
      choices.forEach((choice, index) => {
        at(`[${index + 1}] `);
        say(`<bold>${choice.name}:</bold> `);
        wrapDesc(`<blue>${choice.description}</blue>`);
        say(""); // Newline to separate.
      });

      socket.once('data', choice => {
        choice = parseInt(choice.toString().trim().toLowerCase(), 10) - 1;

        if (isNaN(choice)) {
          return socket.emit('choose-background', socket, { playerName, account });
        }

        const foundBackground = choices[choice];

        if (foundBackground) {
          const { id, name, description, attributes, equipment, skills, attributePoints, abilityPoints } = foundBackground;
          const background = { id, name, description };

          //TODO: Have a CYOA-esque "flashback" determining some of starting eq., etc.
          socket.emit('finish-player', socket, { playerName, attributes, account, equipment, skills, background, attributePoints, abilityPoints });
        } else {
          return socket.emit('choose-background', socket, { playerName, account });
        }
      });

    }
  };
};
