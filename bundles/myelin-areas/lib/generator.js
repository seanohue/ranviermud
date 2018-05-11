const axolemma = require('axolemma');
const configs = require('./configs');

const baseFilePath = __dirname + '../areas/';
const bundle = 'myelin-areas';

const defaults = {
  writeToFile: true,
  areaInfo: {
    isGenerated: true
  }
};

module.exports = {
  generate(srcPath, state, levelRange) {
    levelRange = levelRange || {min: 3, max: 10};
    const Random = require(srcPath + 'RandomUtil');
    const config = Random.fromArray(configs);
    const filename = `${config._name}_${Date.now()}`;

    const axolemmaOptions = Object.assign({},  
      defaults, 
      config, 
      { filePath: baseFilePath + filename });
    axolemmaOptions.areaInfo.levelRange = levelRange;

    return { generated: axolemma.generate(axolemmaOptions), name: config._name};
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
      console.log('Finished with: ', room);
    });

    state.AreaManager.addArea(newArea);

    return {firstRoom: newRooms[0].entityReference};
  }
};