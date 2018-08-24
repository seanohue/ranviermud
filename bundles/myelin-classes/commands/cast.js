'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    command : state => (args, player) => {
      Broadcast.sayAt(player, 'But there\'s nowhere to fish.');
    }
  };
};
