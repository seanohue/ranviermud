'use strict';

/**
 * Player body type (for description) selection event
 */

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const wrap      = require('wrap-ansi');
  const Random    = require(srcPath + 'RandomUtil');
  return {
    event: state => (socket, args) => {
      const { playerName } = args;
      const say      = EventUtil.genSay(socket);
      const at       = EventUtil.genWrite(socket);
      const wrapDesc = str => say(wrap(str, 40));

      let choices = [
        'have esoteric tattoos running up and down their arms.',
        'have scars criss-crossing their face',
        'are covered with coarse body hair',
        'have a splotchy birthmark',
        'have one arm that is shorter than the other',
        'are alarmingly tall',
        'are quite short',
        'have heterochromic eyes',
        'are freckled',
        'have an oddly-shaped mole ',
        'are all torso',
        'have obscenely long legs'
      ];

      // In case players are lazy and tempted to pick from the first few choices.
      choices = Random.coinflip() ? choices.reverse() : choices;

      // List possible features.
      say("Appearance:");
      say(`Finally, choose a distinguishing feature for ${playerName}.`);
      say(`${Broadcast.line(40)}/`);
      say('They...');
      choices.forEach((choice, index) => {
        at(`[${index + 1}] `);
        say(`...<bold>${choice}</bold> `);
        say(""); // Newline to separate.
      });
      at("[0] None.");
      say("");

      socket.once('data', choice => {
        choice = parseInt(choice.toString().trim().toLowerCase(), 10) - 1;

        if (isNaN(choice)) {
          return socket.emit('choose-distinguishing-feature', socket, args);
        }

        const feature = choices[choice];

        if (feature) {
          args.desc.feature = feature;
          socket.emit('finish-player', socket, args);
        } else if (choice === 0) {
          socket.emit('finish-player', socket, args);
        } else {
          return socket.emit('choose-distinguishing-feature', socket, args);
        }
      });
    }
  };
};
