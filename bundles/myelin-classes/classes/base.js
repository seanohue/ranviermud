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

        claw: {
          level: 1,
          might: 15,
          quickness: 10,
          cost: 2
        },
        lunge: {
          level: 1,
          quickness: 15,
        },
        secondwind: {
          level: 1,
          might: 15
        },

        // bash, like lunge but damage based on might

        /* Mentalist: */

        mend: {
          level: 1,
          intellect: 13,
          willpower: 12,
          cost: 2
        },
        combust: {
          level: 1,
          intellect: 15,
          willpower: 15,
          cost: 2
        }
        // concentrate: like secondwind but with mental health

      }
    }
  };
};
