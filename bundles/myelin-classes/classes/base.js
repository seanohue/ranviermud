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

        // Defensive
        block: {
          level: 4,
          might: 10,
          willpower: 8,
        },
        dodge: {
          level: 4,
          quickness: 10,
          intellect: 8
        },
        riposte: {
          cost: 2,
          level: 8,
          quickness: 12,
          intellect: 10,
          might: 12,
          skills: ['block', 'dodge']
        },

        // Offensive
        lunge: {
          level: 1,
          quickness: 12,
        },
        bash: {
          level: 1,
          might: 12
        },
        nervestrike: {
          level: 4,
          quickness: 15,
          might: 8,
          willpower: 8
        },
        rend: {
          level: 4,
          quickness: 12,
          might: 12
        },

        // Phys. Regen
        secondwind: {
          level: 1,
          might: 9,
          willpower: 9,
          quickness: 9,
          cost: 1
        },

        /* Mentalist: */

        // Knowledge-based
        machinist: {
          level: 1,
          intellect: 18,
          cost: 2
        },

        // Armor
        leatherskin: {
          level: 4,
          willpower: 16
        },
        ironskin: {
          cost: 2,
          level: 8,
          willpower: 16,
          might: 10,
          skills: ['leatherskin']
        },

        // Healing
        mend: {
          level: 1,
          intellect: 10,
          willpower: 12,
          cost: 1
        },
        enervate: {
          level: 1,
          intellect: 14,
          willpower: 11
        },
        
        cloudheal: {
          level: 4,
          intellect: 12,
          willpower: 13,
          cost: 2
        },

        // Active buffs
        empower: {
          level: 4,
          willpower: 18
        },
        enlighten: {
          level: 4,
          intellect: 18
        },

        // Active debuffs
        stupefy: {
          level: 1,
          willpower: 12,
          intellect: 10
        },
        flash: {
          level: 4,
          intellect: 16
        },
        weaken: {
          level: 4,
          intellect: 12,
          willpower: 10
        },
        expose: {
          level: 4,
          intellect: 12,
          quickness: 10,
        },

        // Elemental tracks
        // FIRE:
        combust: {
          level: 1,
          intellect: 15,
          willpower: 7,
          cost: 1
        },
        flare: {
          level: 4,
          intellect: 15,
          willpower: 7,
          cost: 1,
          skills: ['combust']
        },
        fireball: {
          cost: 2,
          level: 8,
          intellect: 18,
          willpower: 10,
          quickness: 8,
          skills: ['combust', 'flare']
        },

        // ELECTRICAL
        jolt: {
          level: 2,
          intellect: 16,
          willpower: 7,
          cost: 1
        },
        bolt: {
          cost: 2,
          level: 6,
          intellect: 16,
          willpower: 10,
          cost: 1,
          skills: ['jolt']
        },

        // Mental regen
        concentration: {
          level: 1,
          intellect: 9,
          willpower: 12,
          cost: 1
        },

        // Passive buff
        tactics: {
          cost: 2,
          level: 5,
          intellect: 13,
          quickness: 10
        },

      }
    }
  };
};
