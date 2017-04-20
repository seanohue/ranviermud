'use strict';

/**
 * Player background selection event
 */

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config    = require(srcPath + 'Config');
  const Data      = require(srcPath + 'Data');
  const fs        = require('fs');
  const wrap      = require('wrap-ansi');

  return {
    event: state => (socket, args) => {
      const { playerName, background } = args;
      const say      = EventUtil.genSay(socket);
      const at       = EventUtil.genWrite(socket);
      const wrapDesc = str => say(wrap(str, 40));

      /*
        Myelin does not have classes,
        however, players can choose a
        background. This determines
        starting skills, attributes, and
        inventory.
      */

      const choices = {
        'nose': ['crooked', 'bulbous', 'long', 'large-nostriled', 'button'],
        'mouth': ['thin-lipped', 'thick-lipped', 'crooked', 'smirking', 'toothy'],
        'eyes': ['saucer-like', 'hooded', 'piercing', 'melancholy', 'gleeful'],
        'jawline': ['gaunt', 'hairy', 'angular', 'jowled', 'square', 'weak'],
        'cheekbones': ['gaunt', 'hairy', 'harsh', 'delicate', 'dimpled'],
        'brow': ['furrowed', 'wrinkled', 'smooth', 'tall', 'peaked', 'sloped']
      };
      const desc = {};

      // List possible features.
      say("Appearance:");
      say(`What stands out about ${playerName}'s face?`);
      say(`${Broadcast.line(40)}/`);
      Object.keys(choices).forEach((choice, index) => {
        at(`[${index + 1}] `);
        say(`<bold>${choice}</bold> `);
        say(""); // Newline to separate.
      });

      socket.once('data', choice => {
        choice = parseInt(choice.toString().trim().toLowerCase(), 10) - 1;

        if (isNaN(choice)) {
          return socket.emit('choose-facial-appearance', socket, args);
        }

        const feature = Object.keys(choices)[choice];
        const featureAdjectives = choices[feature];

        if (feature) {
          // List possible adjectives for the chosen feature.
          say("Appearance:");
          say(`How would you describe ${playerName}'s ${feature}?`);
          say(`${Broadcast.line(40)}/`);
          featureAdjectives.forEach((choice, index) => {
            at(`[${index + 1}] `);
            say(`<bold>${choice}:</bold> `);
            say(""); // Newline to separate.
          });
          say("[B] to go back.");

          socket.once('data', adjChoice => {
            if (isNaN(choice)) {
              return socket.emit('choose-facial-appearance', socket, args);
            }

            const adjective = featureAdjectives[adjChoice];
            if (adjective) {
              desc.face = { feature, adjective };
            } else {
              return socket.emit('choose-facial-appearance', socket, args);
            }
          });

          args.desc = desc;
          socket.emit('finish-player', socket, args);
        } else {
          return socket.emit('choose-background', socket, { playerName, account });
        }
      });

    }
  };
};
