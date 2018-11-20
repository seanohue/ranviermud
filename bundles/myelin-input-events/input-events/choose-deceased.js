'use strict';

/**
 * Deceased character viewer selection event
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config    = require(srcPath + 'Config');
  const Logger    = require(srcPath + 'Logger');

  return {
    event: state => (socket, args) => {
      const { account, deceased } = args;

      const say = EventUtil.genSay(socket);
      const write = EventUtil.genWrite(socket);

      /*
        Deceased selection menu:
      */
      say("\r\n----------------------------------------");
      say("|      DESTROYED VESSELS");
      say("----------------------------------------");


      let options = deceased.map(dead => ({
          display: dead,
          onSelect: () => {
            socket.emit('memorial', socket, { dead, account });
          }
        })
      );

      options.push({
        display: "+=".repeat(14)
      });
      options.push({
        display: "Return to Main Menu",
        onSelect: () => {
          socket.emit('choose-character', socket, { account });
        }
      });

      // Display options menu

      let optionI = 0;
      options.forEach((opt) => {
        if (opt.onSelect) {
          optionI++;
          say(`| <cyan>[${optionI}]</cyan> ${opt.display}`);
        } else {
          say(`| <bold>${opt.display}</bold>`);
        }
      });

      socket.write('|\r\n`-> ');

      socket.once('data', choice => {
        choice = choice.toString().trim();
        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          return socket.emit('choose-deceased', socket, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selected ' + selection.display);
          return selection.onSelect();
        }

        return socket.emit('choose-deceased', socket, args);
      });
    }
  };
};
