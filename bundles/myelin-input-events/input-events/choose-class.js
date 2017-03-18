'use strict';

/**
 * Player class selection event
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config     = require(srcPath + 'Config');

  return {
    event: state => (socket, args) => {
      const player = args.player;
      const say = str => Broadcast.sayAt(player, str);
      const at = str => Broadcast.at(player, str);

      /*
        Myelin does not have classes,
        however, players can choose a
        background. This determines
        starting skills, attributes, and
        inventory.
      */
      say('  Choose your background:');
      say(' --------------------------');
      socket.once('data', choice => {
        choice = choice.toString().trim();
        choice = classes.find(([id, config]) => {
          return id.includes(choice) || config.name.toLowerCase().includes(choice);
        });

        if (!choice) {
          return socket.emit('choose-class', socket, args);
        }

        player.setMeta('class', 'base');
        socket.emit('done', socket, { player });
      });
    }
  };
};
