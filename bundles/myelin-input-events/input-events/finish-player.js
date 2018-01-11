'use strict';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');

  let backgrounds = [];
  (async function loadBackgrounds() {
    const fs = require('fs');
    const util = require('util');
    const yaml = require('js-yaml');
    const path = require('path');

    const readdirAsync = util.promisify(fs.readdir);
    const readFileAsync = util.promisify(fs.readFile);
    const pathToBg = path.resolve(__dirname, '../backgrounds');

    const backgroundTitles = await readdirAsync(pathToBg);
    await Promise.all(backgroundTitles)
      .then(files => files.map(file => console.log({file}) || readFileAsync(`${pathToBg}/${file}`)))
      .then(files => files.map(promise => promise.then(file => yaml.load(file))))
      .then(parsed => console.log({parsed}) || parsed.forEach(thing => console.log({thing}) || thing.then(bg => backgrounds.push(bg))))
  }());

  return {
    event: state => (socket, args) => {
      const { name, account, background = 'tough'} = args;
      if (background && typeof(background) !== 'object') {
        background = backgrounds.find(bg => bg.id === background);
      }
      console.log({backgrounds, background});
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
      console.log({player}, player.name);
      player = state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      socket.emit('done', socket, { player });
    }
  };
};
