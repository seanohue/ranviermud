const COMMON = 50;
const UNCOMMON = 30;
const RARE = 10;

module.exports = {
  cryocolumn: {
    weight: UNCOMMON,
    title: 'Tube Chamber',
    description: 'A monolithic, circular chamber. Most of the center of this hollow area is obstructed by a mass of opaque tubes emerging from the floor, and traveling along the ceiling in snakelike patterns, only to disappear into the walls.',
    items: ['spire.intro:columntubes']  
  },

  tomb: {
    weight: RARE,
    title: 'A Frosted Tomb',
    description: 'An alcove lined with grey, frost-crusted cylinders, jutting from a slate wall. Your surroundings seem to be made of the same dark material, though the ceiling is covered with pipes leading to the cylinders.',
    items: ['spire.intro:cylinders', 'spire.intro:masstubes']
  },

  hall_maint: {
    weight: COMMON,
    title: 'A Cold Hall',
    description: 'A short hallway, cold enough to see one\'s breath.',
    npcs: ['spire.intro:maintenanceauto']
  },

  hall: {
    weight: COMMON,
    title: 'A Cold Hall',
    description: 'A short hallway, cold enough to see one\'s breath.',
  },

};