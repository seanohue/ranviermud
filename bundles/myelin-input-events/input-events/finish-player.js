'use strict';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');

  return {
    event: state => (socket, args) => {
      const { name, account, background = 'tough', backgrounds } = args;
      if (background && typeof(background) !== 'object') {
        background = backgrounds.find(bg => bg.id === background);
      }
      // TIP:DefaultAttributes: This is where you can change the default attributes for players
      // TODO:
      const attributes = Object.assign({
        health: 100,
        focus: 100,
        energy: 100,
        might: 5,
        quickness: 5,
        intellect: 5,
        willpower: 5,
        armor: 0,
        critical: 0
      }, background.attributes);

      let player = new Player({
        name,
        account,
        attributes
      });

      player.setMeta('background', background.id);

      args.account.addCharacter(name);
      args.account.save();

      player.setMeta('class', 'base');

      const room = state.RoomManager.startingRoom;
      player.room = room;
      player.save();

      // reload from manager so events are set
      player = state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      socket.emit('done', socket, { player });
    }
  };
};
