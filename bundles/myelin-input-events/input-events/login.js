'use strict';

module.exports = (srcPath) => {
  const Data = require(srcPath + 'Data');
  const CommonFunctions = require('../lib/CommonFunctions');
  const Logger = require(srcPath + 'Logger');

  return {
    event: state => (socket, args) => {
      if (!args || !args.dontwelcome) {
        socket.write('ENTER YOUR NAME: ');
      }

      socket.once('data', name => {
        name = name.toString().trim();

        const invalid = CommonFunctions.validateName(name, state);
        if (invalid) {
          socket.write(invalid + '\r\n');
          return socket.emit('login', socket);
        }

        name = name[0].toUpperCase() + name.slice(1);

        let account = Data.exists('account', name);

        // That player account doesn't exist so ask if them to create it
        if (!account) {
          Logger.error(`No account found as ${name}.`);
          return socket.emit('create-account', socket, name);
        }

        account = state.AccountManager.loadAccount(name);

        if (account.banned) {
          socket.write('THIS ACCOUNT HAS BEEN BANNED.\r\n');
          socket.end();
          return;
        }

        if (account.deleted) {
          socket.write('THIS ACCOUNT HAS BEEN DELETED.\r\n');
          socket.end();
          return;
        }
        
        return socket.emit('password', socket, { dontwelcome: false, account });
      });
    }
  };
};
