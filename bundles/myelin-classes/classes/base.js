'use strict';

/**
 * This example definition of a class file is a guideline. The class system is
 * left intentionally vague so as to not be too opinionated. Class files are
 * assumed to be js files instead of blank yaml files just to future proof the
 * bundle-loading of class files in case someone wants extra functionality in
 * their classes.
 */
module.exports = srcPath => {
  return {

    // Set up player prompt and other business:
    setupPlayer(player) {
      player.prompt = 'health: [ %physical.current%/%physical.max% <b>physical</b> %mental.current%/%mental.max% <b>mental</b> %energy.current%/%energy.max% <b>energy</b> ]';
    },

    abilityTable: {
      skills: {

        /* Physicalist: */

        rend: {
          level: 3,
          might: 12,
        },
        lunge: {
          level: 4,
          quickness: 12,
          might: 12
        },
        secondwind: {
          level: 6,
          willpower: 16
        },

        /* Mentalist: */

        heal: {
          level: 5,
          cleverness: 12,
          willpower: 11
        },
        fireball: {
          level: 8,
          cleverness: 15
        }

      }
    }
  };
};
