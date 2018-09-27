'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const CommandParser = require(srcPath + 'CommandParser').CommandParser;
  const { sayAt, center, line } = Broadcast;
  return {
    usage: 'node list | node travel [destination]',
    aliases: ['travel', 'dial'],

    command : state => (args, player, arg0) => {
      const say = (message) => sayAt(player, message);
      if (!player.room.getBehavior('portal')) {
        Logger.warn(`Player trying node command in ${player.room.entityReference}.`);
        return say('<b>There is no Node here.</b>');
      }

      if (arg0 === 'travel' || (arg0 === 'dial' && !args.includes('list'))) {
        args = 'travel ' + args;
      }

      if (!args.length) {
        return say(`Invalid command. Try <b>'node list'</b>`);
      }

      const split = args.trim().split(' ');
      const [subcommand, destination] = split;
      if (subcommand === 'list') {
        return player.room.emit('listDestinations', player);
      }

      if (subcommand !== 'travel') {
        return say(`Invalid command. Try <b>'node list'</b>`);
      }

      const key = CommandParser.parseDot('axon', player.inventory);
      if (!key || key.entityReference !== 'spire.intro:axon') {
        return say('You need an <b>Axon</b> to be able to activate a Node.');
      }

      player.room.emit('usePortal', player, key, destination);
    }
  };
};

