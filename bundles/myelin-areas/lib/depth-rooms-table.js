const COMMON = 50;
const UNCOMMON = 30;
const RARE = 10;

module.exports = {
  rough_hewn_hall_empty: {
    weight: COMMON,
    title: 'A Rough-Hewn Hall',
    description: 'This corridor has been hewn or blasted from rock. It varies slightly in width and height, and bits of rubble lay here and there.',
  },

  rough_hewn_hall_arbiter: {
    weight: COMMON,
    title: 'A Rough-Hewn Hall',
    description: 'This corridor has been hewn or blasted from rock. It varies slightly in width and height, and bits of rubble lay here and there.',
    npcs: ['spire.labyrinth:arbiter']
  },

  murky_water_empty: {
    weight: UNCOMMON,
    title: 'A Pool of Murky Water',
    description: 'This space is a bit wider than the surrounding halls and chambers. In the center is a pool of murky water. It is impossible to tell how deep it is. Water drips from stalactites that have formed above it.'
  },

  murky_water_blupe: {
    weight: UNCOMMON - 5,
    title: 'A Pool of Murky Water',
    description: 'This space is a bit wider than the surrounding halls and chambers. In the center is a pool of murky water. It is impossible to tell how deep it is. Water drips from stalactites that have formed above it.',
    npcs: ['depths:blupe']
  },

  rough_hewn_hall_minotaur: {
    weight: COMMON,
    title: 'A Rough-Hewn Hall',
    description: 'This corridor has been hewn or blasted from rock. It varies slightly in width and height, and bits of rubble lay here and there.',
    npcs: ['spire.labyrinth:minotaur'],
    items: ['spire.labyrinth:pilebones'],
  },

  waypoint_shrine: {
    weight: RARE,
    title: 'Shrine (Waypoint)',
    description: 'In the center of this space is a raised obsidian dais. It pulses with an obscene red light and is streaked with blood.',
    npcs: ['depths:gug'],
    behaviors: { waypoint: true }
  }
};