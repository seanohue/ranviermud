'use strict';


/**
 * Login is done, allow the player to actually execute commands
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    event: state => (socket, args) => {
      let player = args.player;
      player.hydrate(state);

      // Allow the player class to modify the player (adding attributes, changing default prompt, etc)
      player.playerClass.setupPlayer(player);

      player.save();

      player._lastCommandTime = Date.now();

      player.socket.on('close', () => {
        Logger.warn(player.name + ' has gone linkdead.');
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
      Broadcast.prompt(player);

      let armor = state.EffectFactory.create('armor', player);
      if (player.addEffect(armor)) {
        armor.activate();
      }

      let psionicArmor = state.EffectFactory.create('armor', player, 
        { name: 'Psionic Resistance', type: 'psionic_armor', hidden: false }, 
        { attribute: 'willpower', typeMethod: 'isPsionic' }
      );

      if (player.addEffect(psionicArmor)) {
        psionicArmor.activate();
      }
      // All that shit done, let them play!
      player.socket.emit('commands', player);


      Logger.warn(`Player ${player.name} has logged on.`);
    }
  };
};
