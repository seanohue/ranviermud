'use strict';

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    usage: 'read <readable> [page/section]',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return B.sayAt(player, 'What do you want to read?');
      }

      const [targetName, ...restArgs] = args.split(' ');

      const target = Parser.parseDot(targetName, player.room.items) ||
        Parser.parseDot(targetName, player.inventory);

      if (!target) {
        return B.sayAt(player, 'That isn\'t here.');
      }

      if (target.hasBehavior('readable')) {
        return target.emit('read', player, restArgs)
      }

      B.sayAt(player, `You don't know how to read ${target.name}.`);
    }
  };
};