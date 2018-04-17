const COMMON = 5;
const UNCOMMON = 3;
const RARE = 1;

module.exports = {
  cryocolumn: {
    weight: UNCOMMON,
    title: 'Tube Chamber',
    description: 'A monolithic, circular chamber. Most of the center of this hollow area is obstructed by a mass of opaque tubes emerging from the floor, and traveling along the ceiling in snakelike patterns, only to disappear into the walls.',
    items: ['spire.intro:columntubes']  
  },

  datacenter: {
    weight: RARE,
    title: 'Data Observation Deck',
    description: 'A semi-circular bench juts from the floor in the center of this small room. An eery light fills this otherwise plain room, emanating from four glowing crystals floating in its center, above the bench.',
    items: ['spire.intro:datacrystals']
  },

  tomb: {
    weight: RARE,
    title: 'A Frosted Tomb',
    description: 'An alcove lined with grey, frost-crusted cylinders, jutting from a slate wall. Your surroundings seem to be made of the same dark material, though the ceiling is covered with pipes leading to the cylinders.',
  },

  hall: {
    weight: COMMON,
    title: 'A Cold Hall',
    description: 'A short hallway, cold enough to see one\'s breath.'
  },

  airlock: {
    weight: UNCOMMON,
    title: 'Airlock Chamber',
    description: 'A small room with metal vault doors here and there. Aside from that, this nearly-perfect cube is featureless.'
  }

};