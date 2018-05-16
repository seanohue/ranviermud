const axolemma = require('axolemma');
const path = require('path');

const configs = require('./configs');

const baseFilePath = path.join(__dirname, '/../areas/');
const bundle = 'myelin-areas';

const defaults = {
  writeToFile: true,
  areaInfo: {
    isGenerated: true
  }
};

module.exports = {
  // teleport(srcPath, state, player) {
  //   const min = Math.max(1, player.level - 2);
  //   const max = Math.min(99, player.level + 5);
  //   const levelRange = {min, max};

  //   return Generator.generate(srcPath, state, levelRange)
  //     .then(({generated, name}) => {
  //       console.log('Generated!');
  //       const {firstRoom} = Generator.addToWorld(srcPath, state, name, generated);

  //       const targetRoom = state.RoomManager.getRoom(firstRoom);
  //       if (!targetRoom) {
  //         return Broadcast.sayAt(player, 'Teleportation failed. No such room entity reference exists. Contact an admin.');
  //       } else if (targetRoom === player.room) {
  //         return Broadcast.sayAt(player, 'Teleportation failed. Teleported to same room. Contact an admin.');
  //       }
    
  //       player.followers.forEach(follower => {
  //         // TODO: Change to send followers as well.
  //         follower.unfollow();
  //         if (!follower.isNpc) {
  //           Broadcast.sayAt(follower, `You stop following ${player.name}.`);
  //         }
  //       });
  
  //       if (player.isInCombat()) {
  //         player.removeFromCombat();
  //       }
  
  //       player.moveTo(targetRoom, () => {
  //         Broadcast.sayAt(player, '<b><green>You find yourself in a strange new world...</green></b>\r\n');
  //         Broadcast.sayAtExcept(targetRoom, `<b>${player.name} appears in a <yellow>flash</yellow> of light.</b>`, player);
  //         state.CommandManager.get('look').execute('', player);
  //         //TODO: Remove key
  //       });
  //     })
  //     .catch(err => {
  //       console.error('Error', err);
  //       Broadcast.sayAt(player, 'An error has occurred. Please contact an admin.');
  //     });
  // },

  generate(srcPath, state, level) {
    level = level || 10;
    const Random = require(srcPath + 'RandomUtil');
    const config = Random.fromArray(
      configs.filter(config => {
        const range = config.areaInfo.levelRange || {min: 5, max: 15};
        return range.min <= level && range.max >= level;
      })
    );
    const filename = `${config._name}_${Date.now()}`;

    const axolemmaOptions = Object.assign({},  
      defaults, 
      config, 
      { filepath: baseFilePath + filename });

    return axolemma.generate(axolemmaOptions)
      .then((generated) => {
        console.log('generated...', generated.graphic); 
        return { generated, name: config._name };
      });
  },

  addToWorld(srcPath, state, name, generated) {
    const Area = require(srcPath + 'Area');
    const Room = require(srcPath + 'Room');

    if (!generated) {
      throw new Error ('Pass generated area to generator.addToWorld!');
    }

    const { manifest, graphic, rooms} = generated;
    if (!manifest || !rooms) { 
      console.log(generated);
      throw new Error('Invalid generated area!'); 
    }

    console.log(graphic);
    const newArea = new Area(bundle, name, manifest);
    const newRooms = rooms.map(room =>
      new Room(
        newArea,
        Object.assign(
          room,
          {metadata: { isGenerated: true }})
      )
    );

    newRooms.forEach(room =>{
      newArea.addRoom(room);
      state.RoomManager.addRoom(room);
      room.hydrate(state);
    });

    state.AreaManager.addArea(newArea);

    return {firstRoom: newRooms[0].entityReference};
  }
};