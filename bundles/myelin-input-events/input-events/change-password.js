'use strict';

/**
 * Password change event
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');

  return {
    event: state => (socket, args) => {
      const say = EventUtil.genSay(socket);
      const write = EventUtil.genWrite(socket);

      say("PASSWORDS MUST BE AT LEAST 8 CHARACTERS.");
      write('<cyan>ENTER PASSWORD:</cyan> ');

      socket.command('toggleEcho');
      socket.once('data', pass => {
        socket.command('toggleEcho');
        say('');

        pass = pass.toString().trim();

        if (!pass) {
          say('NO PASSWORD ENTERED.');
          return socket.emit('change-password', socket, args);
        }

        if (pass.length < 8) {
          say('PASSWORD TOO SHORT.');
          return socket.emit('change-password', socket, args);
        }

        // setPassword handles hashing
        args.account.setPassword(pass);
        state.AccountManager.addAccount(args.account);
        args.account.save();

        socket.emit('confirm-password', socket, args);
      });
    }
  };
};
