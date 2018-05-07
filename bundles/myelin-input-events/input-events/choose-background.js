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

  const bgPath = __dirname + '/../backgrounds/';

  // Load in and parse background definitions.
  const choices = fs
    .readdirSync(bgPath)
    .map(bgFile => {
      return Data.parseFile(bgPath + bgFile);
    });

  return {
    event: state => (socket, args) => {
      const { playerName, account, tier, cost = 0 } = args;
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

      const tierBackgrounds = choices.filter(choice => choice.tier === tier);

      // List possible backgrounds.
      say("Choose Your Origin:");
      say(`${Broadcast.line(40)}/`);
      tierBackgrounds.forEach((choice, index) => {
        at(`[${index + 1}] `);
        say(`<bold>${choice.name}:</bold> `);
        wrapDesc(`<cyan>${choice.description}</cyan>`);
        say(""); // Newline to separate.
      });

      socket.once('data', choice => {
        choice = parseInt(choice.toString().trim().toLowerCase(), 10) - 1;

        if (isNaN(choice)) {
          return socket.emit('choose-background', socket, { playerName, account });
        }

        const foundBackground = tierBackgrounds[choice];

        if (foundBackground) {
          const { id } = foundBackground;

          //TODO: Have a CYOA-esque "flashback" determining some of starting eq., etc.
          const memoryPoints = account.getMeta('memories');
          account.setMeta('memories', (memoryPoints - cost) || 0);

          // Temporarily skip the background choices thing.
          socket.emit('finish-player', socket, { name: playerName, account, background: foundBackground, backgrounds: choices });
          // socket.emit(`bg-${id}`, socket, { playerName, foundBackground });
        } else {
          return socket.emit('choose-background', socket, { playerName, account });
        }
      });

    }
  };
};