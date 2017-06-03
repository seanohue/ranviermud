'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Random = require(srcPath + 'RandomUtil');

  return  {
    listeners: {
      spawn: state => function () {
        Broadcast.sayAt(this.room, "A tiny, spider-like automaton scurries from a hatch in the wall, which seamlessly closes behind it.");
        Logger.log(`Spawned ${this.name} into Room [${this.room.title}]`);
      },

      playerEnter: state => function (player) {
        if (this.combatants.length || Random.probability(75)) {
          return;
        }

        const flavorEvents = [
          {
            room: `The tiny automaton lets out a <b>hissing jet of <cyan>steam</cyan></b> as ${player.name} enters the room.`,
            individual: `The tiny automaton lets out a <b>hissing jet of <cyan>steam</cyan></b> as you enter the room.`
          },
          {
            room: `The tiny automaton scurries <b>away</b> from ${player.name}.`,
            individual: `The tiny automaton scurries <b>away</b> from you as you enter the room.`
          },
          {
            room: `The lights on top of the tiny automaton <b>blink</b> <yellow>yellow</yellow> as ${player.name} steps into view.`,
            individual: 'The lights on top of the tiny automaton <b>blink</b> <yellow>yellow</yellow> as you enter the room.'
          }
        ];

        const event = Random.fromArray(flavorEvents);
        if (this.room.players.size > 1) {
          Broadcast.sayAtExcept(room, event.room, player);
        }

        Broadcast.sayAt(player, event.individual);
      }
    }
  };
};
