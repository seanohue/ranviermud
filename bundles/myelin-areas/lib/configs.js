module.exports = [{
    _name: 'labyrinth',
    type: 'DividedMaze',
    areaTitle: 'The Spire: Labyrinth',
  
    width: 40,
    height: 40,
  
    regularity: 0.2,
  
    weightedRoomsTable: require('./labyrinth-rooms-table')
  }];