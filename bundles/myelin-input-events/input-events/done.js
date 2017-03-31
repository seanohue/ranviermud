'use strict';


/**
 * Login is done, allow the player to actually execute commands
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    event: state => (socket, args) => {
      let { player, attributes, account, equipment, skills } = args;
      player.hydrate(state);

      // Coming from chargen, set starting attributes.
      if (attributes) {
        for (const attr in attributes) {
          const stat = attributes[attr];
          player.attributes.get(attr).setBase(stat);
        }

        // Set up starting equipment.
        if (equipment) {
          equipment.forEach(itemRef => {
            const area = state.AreaManager.getAreaByReference(itemRef);
            const item = state.ItemFactory.create(area, itemRef);
            item.hydrate(state);
            if (item.slot) {
              player.equip(item);
            } else {
              player.addItem(item);
            }
          });
        }

        // Set up starting skills.
        if (skills) {
          const newAbilities = player.getMeta('abilities') ?
            player.getMeta('abilities').concat(skills) :
            [].concat(skills);
          player.setMeta('abilities', newAbilities);
        }

        // Save player to account.
        account.addCharacter(player.name);
        account.save();
      }

      // Allow the player class to modify the player (adding attributes, changing default prompt, etc)
      player.playerClass.setupPlayer(player);

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
