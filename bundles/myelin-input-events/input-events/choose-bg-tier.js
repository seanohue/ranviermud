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
  const wrap      = require('wrap-ansi');

  const bgPath = __dirname + '/../backgrounds/';

  const tiers = [
    {
      cost: 0,
      label: "The Deprived"
    },
    {
      cost: 3,
      label: "The Abandoned"
    },
  ];

  return {
    event: state => (socket, args) => {
      const { playerName, account } = args;
      const say      = EventUtil.genSay(socket);
      const at       = EventUtil.genWrite(socket);

      // List tiers they can afford.
      const karma = account.getMeta('karma');
      say("Choose A Lineage:");
      say(`${Broadcast.line(40)}/`);
      tiers.filter(tier => tier.cost >= karma)
        .forEach((tier, index) => {
          at(`[${index + 1}] `);
          at(`<bold>${tier.label}:</bold> `);
          at(`<blue>(${tier.cost ? tier.cost + " karma" : "Free"})</blue>`);
          say(""); // Newline to separate.
      });

      socket.once('data', choice => {
        choice = parseInt(choice.toString().trim().toLowerCase(), 10) - 1;

        if (isNaN(choice)) {
          return socket.emit('choose-bg-tier', socket, { playerName, account });
        }

        return socket.emit('choose-background', socket, { playerName, account, choice });
      });

    }
  };
};
