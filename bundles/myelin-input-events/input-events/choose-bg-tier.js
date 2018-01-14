'use strict';

/**
 * Player background tier selection event
 */

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config    = require(srcPath + 'Config');
  const Data      = require(srcPath + 'Data');

  const fs        = require('fs');
  const wrap      = require('wrap-ansi');

  const tiers  = require(__dirname + '/../tiers');
  const bgPath = __dirname + '/../backgrounds/';

  return {
    event: state => (socket, args) => {
      const { playerName, account } = args;
      const say = EventUtil.genSay(socket);
      const at  = EventUtil.genWrite(socket);

      // List tiers they can afford.
      const memoryPoints = account.getMeta('memories');

      say("Choose A Lineage:");
      say(`${Broadcast.line(40)}/`);
      tiers.filter(tier => tier.cost <= memoryPoints)
        .forEach((tier, index) => {
          at(`[${index + 1}] `);
          at(`<bold>${tier.label}</bold> `);
          at(`<blue>(${tier.cost ? tier.cost + " memories" : "Free"})</blue>`);
          say(""); // Newline to separate.
      });
      say(`Your Memories: ${memoryPoints}`);

      socket.once('data', choice => {
        choice = parseInt(choice.toString().trim().toLowerCase(), 10) - 1;

        if (isNaN(choice)) {
          return socket.emit('choose-bg-tier', socket, { playerName, account });
        }

        return socket.emit('choose-background', socket, { playerName, account, tier: choice, cost: tiers[choice].cost });
      });

    }
  };
};