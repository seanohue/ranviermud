'use strict';

/**
 * Player class selection event
 */
module.exports = (srcPath) => {

  return {
    event: state => (socket, args) => {
      args.playerClass = 'base';
      socket.emit('bg-ascetic', socket, { socket, args }); // FOR TESTING
    }
  };
};
