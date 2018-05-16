module.exports = [{
    _name: 'labyrinth',
    type: 'EllerMaze',
    areaTitle: 'The Spire: Labyrinth',
  
    width: 30,
    height: 20,
  
    areaInfo: {
      levelRange: {
        min: 1,
        max: 15
      }
    },

    weightedRoomsTable: require('./labyrinth-rooms-table')
  }, {
    _name: 'ruins',
    type: 'DividedMaze',
    areaTitle: 'The Ruinous Depths',

    width: 30,
    height: 35,

    areaInfo: {
      levelRange: {
        min: 10,
        max: 99
      },
      respawnInterval: 60
    },

    weightedRoomsTable: require('./depth-rooms-table')
  }];