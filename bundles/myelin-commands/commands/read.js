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

      let target = Parser.parseDot(args, player.room.items) ||
        Parser.parseDot(args, player.inventory);

      if (!target) {
        return B.sayAt(player, 'That isn\'t here.');
      }

      console.log('args', args);

      console.log('target', target);
      // Emit read event.

      if (target.hasBehavior('readable')) {
        target.emit('read', player, args)
      }
    }
  };
};