'use strict';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');
  const BackgroundGenerator = require('../backgrounds');

  let backgrounds;

  BackgroundGenerator()
    .then((bgs) => {
      backgrounds = bgs;
    }).catch(err) => {
      console.log('Error while loading backgrounds...' , err);
      backgrounds = {};
    });

  return {
    event: state => (socket, args) => {
      // TIP:DefaultAttributes: This is where you can change the default attributes for players
      const attributes = Object.assign({
        health: 100,
        focus: 100,
        energy: 100,
        might: 10,
        quickness: 10,
        intellect: 10,
        willpower: 10,
        armor: 0,
        critical: 0
      }, backgrounds[args.background || "tough"].attributes);

      let player = new Player({
        name: args.name,
        account: args.account,
        attributes
      });

      player.setMeta('background', args.background || "tough");

      args.account.addCharacter(args.name);
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
