module.exports = [{
    _name: 'labyrinth',
    type: 'DividedMaze',
    areaTitle: 'The Spire: Labyrinth',
  
    width: 30,
    height: 20,
  
    regularity: 0.2,
  
    weightedRoomsTable: require('./labyrinth-rooms-table')
  }];