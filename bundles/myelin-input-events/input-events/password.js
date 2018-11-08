'use strict';

/**
 * Account password event
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');

  let passwordAttempts = {};
  const maxFailedAttempts = 2;

  return {
    event: state => (socket, args) => {
      const write = EventUtil.genWrite(socket);

      let name = args.account.name;

      if (!passwordAttempts[name]) {
        passwordAttempts[name] = 0;
      }

      // Boot and log any failed password attempts
      if (passwordAttempts[name] > maxFailedAttempts) {
        write("PASSWORD ATTEMPTS EXCEEDED. . .\r\n");
        passwordAttempts[name] = 0;
        socket.end();
        return false;
      }

      if (!args.dontwelcome) {
        write("ENTER PASSWORD: ");
        socket.command('toggleEcho');
      }

      socket.once('data', pass => {
        socket.command('toggleEcho');

        if (!args.account.checkPassword(pass.toString().trim())) {
          write("<red>INCORRECT.</red>\r\n");
          passwordAttempts[name]++;

          return socket.emit('password', socket, args);
        }

        passwordAttempts[name] = 0;
        return socket.emit('choose-character', socket, { account: args.account });
      });
    }
  };
};
