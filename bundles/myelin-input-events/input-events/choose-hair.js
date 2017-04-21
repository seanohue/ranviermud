'use strict';

/**
 * Player hair style/color (for description) event
 */

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');

  return {
    event: state => (socket, args) => {
      const { playerName } = args;
      const say = EventUtil.genSay(socket);
      const at  = EventUtil.genWrite(socket);

      const styles = [
        'braided', 'curled', 'wavy', 'cropped',
        'matted', 'patchy', 'shaved', 'parted',
        'spiked', 'combed-over', 'ponytailed',
        'in a bun'
      ];
      const colors = [
        'black', 'brunette', 'blonde', 'ginger', 'blue', 'purple',
        'grey', 'many-colored', 'white'
      ];

      // List possible hair styles.
      say("");
      say("Appearance:");
      say(`What style is ${playerName}'s hair?`);
      say(`${Broadcast.line(40)}/`);
      styles.forEach((choice, index) => {
        at(`[${index + 1}] `);
        say(`<bold>${choice}</bold> `);
        say(""); // Newline to separate.
      });

      socket.once('data', choice => {
        choice = parseInt(choice.toString().trim().toLowerCase(), 10) - 1;

        if (isNaN(choice)) {
          return socket.emit('choose-hair', socket, args);
        }

        const style = styles[choice];

        if (style) {
          // List possible colors for hair.
          say("Appearance:");
          say(`Which color is ${playerName}'s hair?`);
          say(`${Broadcast.line(40)}/`);
          colors.forEach((choice, index) => {
            at(`[${index + 1}] `);
            say(`<bold>${choice}</bold> `);
            say(""); // Newline to separate.
          });
          say("[B] to go back.");

          socket.once('data', colorChoice => {
            colorChoice = parseInt(colorChoice.toString().trim().toLowerCase(), 10) - 1;

            if (isNaN(colorChoice)) {
              return socket.emit('choose-hair', socket, args);
            }

            const color = colors[colorChoice];
            if (color) {
              args.desc.hair = { style, color };
              socket.emit('choose-distinguishing-feature', socket, args);
            } else {
              return socket.emit('choose-hair', socket, args);
            }
          });
        } else {
          return socket.emit('choose-hair', socket, { playerName, account });
        }
      });

    }
  };
};
