'use strict';

/**
 * Account character selection event
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config    = require(srcPath + 'Config');
  const Logger    = require(srcPath + 'Logger');

  return {
    event: state => (socket, args) => {
      let { name } = args;
      const say = EventUtil.genSay(socket);

      // Get pfile of deceased to show stats.

      say("\r\n------------------------------");
      say("|      " + name);
      say("------------------------------");
      say("Press enter to pay respects.");


      socket.once('data', _ => {
        return socket.emit('choose-character', socket, args);
      });
    }
  };
};
