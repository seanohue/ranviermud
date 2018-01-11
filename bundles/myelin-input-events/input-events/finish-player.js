'use strict';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');



  const backgrounds = (async function loadBackgrounds() {
    const fs = require('fs');
    const yaml = require('yaml');
    const readDirAsync = util.promisify(fs.readDir);
    const readFileAsync = util.promisify(fs.readFile);
    const path = '../backgrounds/';

    const backgroundTitles = await readDirAsync(path);
    const _backgrounds = await Promise.all(backgroundTitles)
      .then(title => readFileAsync(`${path}${title}`))
      .then(file => yaml.load(file)) // is this how to do???
    console.log({_backgrounds})

    return _backgrounds;
  }());

  return {
    event: state => (socket, args) => {
      const { name, account, background = 'tough'} = args;
      const backgroundObj = backgrounds.find(bg => bg.id === background);

      // TIP:DefaultAttributes: This is where you can change the default attributes for players
      // TODO:
      const attributes = Object.assign({
        health: 10,
        focus: 10,
        energy: 10,
        might: 5,
        quickness: 5,
        intellect: 5,
        willpower: 5,
        armor: 0,
        critical: 0
      }, backgroundObj.attributes);

      let player = new Player({
        name,
        account,
        attributes
      });

      player.setMeta('background', background);

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
