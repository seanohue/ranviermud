'use strict';


/**
 * Login is done, allow the player to actually execute commands
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    event: state => (socket, args) => {
      let { player, attributes, account } = args;
      player.hydrate(state);

      // Coming from chargen, set starting attributes.
      if (attributes) {
        for (const attr in attributes) {
          const stat = attributes[attr];
          player.attributes.get(attr).setBase(stat);
        }
      }

      // Allow the player class to modify the player (adding attributes, changing default prompt, etc)
      player.playerClass.setupPlayer(player);

      // Save player to account.
      args.account.addCharacter(player.name);
      args.account.save();

      player.save();

      player.socket.on('close', () => {
        Logger.log(player.name + ' has gone linkdead.');
        // TODO: try to fetch the person the player is fighting and dereference the player
        //if (player.inCombat.inCombat) {
        //  player.inCombat.inCombat = null;
        //}

        player.save(() => {
          player.room.removePlayer(player);
          state.PlayerManager.removePlayer(player, true);
        });
      });

      state.CommandManager.get('look').execute(null, player);

      player.room.emit('playerEnter', player);
      for (const npc of player.room.npcs) {
        npc.emit('playerEnter', player);
      }

      Broadcast.prompt(player);

      // All that shit done, let them play!
      player.socket.emit('commands', player);
    }
  };
};
