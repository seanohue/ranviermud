'use strict';

/**
 * Player facial feature (for description) event
 * First description event, it creates desc as an empty obj then passes that along in args.
 */

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const wrap      = require('wrap-ansi');

  return {
    event: state => (socket, args) => {
      const { playerName } = args;
      const say      = EventUtil.genSay(socket);
      const at       = EventUtil.genWrite(socket);
      const wrapDesc = str => say(wrap(str, 40));

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
      say("");
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
            say(`<bold>${choice}</bold> `);
            say(""); // Newline to separate.
          });
          say("[B] to go back.");

          socket.once('data', adjChoice => {
            adjChoice = parseInt(adjChoice.toString().trim().toLowerCase(), 10) - 1;

            if (isNaN(adjChoice)) {
              return socket.emit('choose-facial-appearance', socket, args);
            }

            const adjective = featureAdjectives[adjChoice];
            if (adjective) {
              desc.face = { feature, adjective };
              args.desc = desc;
              socket.emit('choose-body-type', socket, args);
            } else {
              return socket.emit('choose-facial-appearance', socket, args);
            }
          });
        } else {
          return socket.emit('choose-facial-appearance', socket, { playerName, account });
        }
      });

    }
  };
};
