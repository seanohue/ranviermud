'use strict';

/**
 * This class file is the base "class" for myelin.
 * Since there aren't classes, this is used as a
 * definition for the skill tree and prompt.
 */
module.exports = srcPath => {
  return {
    // Set up player prompt and other business:
    setupPlayer(player) {
      player.prompt = '[ %health.current%/%health.max% <b>health</b> %focus.current%/%focus.max% <b>focus</b> %energy.current%/%energy.max% <b>energy</b> ]';
    },

    abilityTable: {
      skills: {

        /* Physicalist: */

        // claw: {
        //   level: 1,
        //   might: 15,
        //   quickness: 10,
        //   cost: 2
        // },
        lunge: {
          level: 1,
          quickness: 15,
        },
        secondwind: {
          level: 1,
          might: 8,
          willpower: 8,
          quickness: 10,
          cost: 2
        },
        bash: {
          level: 1,
          might: 15
        },
        nervestrike: {
          level: 5,
          quickness: 20,
          might: 10,
          willpower: 10
        },

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
          willpower: 7,
          cost: 2
        },
        concentration: {
          level: 1,
          intellect: 11,
          willpower: 12,
          cost: 2
        },
        tactics: {
          level: 5,
          intellect: 18,
          willpower: 12,
          quickness: 12
        }
      }
    }
  };
};