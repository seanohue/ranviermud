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


      console.log('Background is ', background);
      /*
        Background is  { id: 'mendicant',
          name: 'Acrid Mendicant',
          description: 'You\'re a wiley sort, surviving on the streets through your own wits, charming alms from strangers.',
          attributes: { quickness: 6, intellect: 11, willpower: 12, might: 11 },
          equipment: 
          [ 'spire.intro:4',
            'spire.intro:5',
            'spire.intro:6',
            'spire.intro:7',
            'spire.intro:8' ],
          skills: [ 'secondwind', 'concentration' ],
          attributePoints: 0,
          abilityPoints: 2,
          tier: 0 }

      */
      args.account.addCharacter(name);
      args.account.save();

      const {name: bgName, abilityPoints, attributes, attributePoints,  equipment, skills} = background

      // TODO:
      const defaultAttributes = Object.assign({
        health: 100,
        focus: 100,
        energy: 100,
        might: 5,
        quickness: 5,
        intellect: 5,
        willpower: 5,
        armor: 0,
        critical: 0
      }, attributes);

      let player = new Player({
        name,
        account,
        defaultAttributes
      });

      //TODO: Custom descs
      const desc = `${name} is here.`;

      player.setMeta('class',            'base');
      player.setMeta('background',       bgName);
      player.setMeta('abilities',        skills);
      player.setMeta('attributePoints',  attributePoints || 0);
      player.setMeta('abilityPoints',    abilityPoints   || 0);
      player.setMeta('description',      desc || '');

      if (equipment && equipment.length) {
        equipment.forEach(itemRef => {
          const area = state.AreaManager.getAreaByReference(itemRef);
          const item = state.ItemFactory.create(area, itemRef);
          item.hydrate(state);
          item.emit('get', player);
          if (item.slot) {
            player.equip(item);
            item.emit('equip', player);
          } else {
            player.addItem(item);
          }
        });
      }

      player.save();

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
