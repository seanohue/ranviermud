'use strict';

const Combat = require('../../lib/Combat');
/**
 * Example real-time combat behavior for NPCs that goes along with the player's player-combat.js
 * Have combat implemented in a behavior like this allows two NPCs with this behavior to fight without
 * the player having to be involved
 */
module.exports = (srcPath) => {
  return  {
    listeners: {
      /**
       * @param {*} config Behavior config
       */
      updateTick: state => function (config) {
        Combat.updateRound(state, this);
      },

      /**
       * NPC was killed
       * @param {*} config Behavior config
       * @param {Character} killer
       */
      killed: state => function (config, killer) {
        // Broadcast to players that NPC has been killed.
        if (!this.room.players.size) return;

        const Broadcast = require(srcPath + 'Broadcast');
        [...this.room.players].forEach(player => {
          if (player === killer) return;
          if (!killer) {
            return Broadcast.sayAt(player, `<red><b>${this.name} has died!</b></red>`);
          }
          Broadcast.sayAt(player, `<red><b>${this.name} was killed by ${killer.name}!</b></red>`);
        });
      },

      /**
       * NPC hit another character
       * @param {*} config Behavior config
       * @param {Damage} damage
       * @param {Character} target
       */
      hit: state => function (config, damage, target) {
      },

      damaged: state => function (config, damage) {
        if (this.getAttribute('health') <= 0 && damage.attacker) {
          this.combatData.killedBy = damage.attacker;
        }
      },

      /**
       * NPC killed a target
       * @param {*} config Behavior config
       * @param {Character} target
       */
      deathblow: state => function (config, target) {
        if (!this.isInCombat()) {
          Combat.startRegeneration(state, this);
        }
        const targetLevel = target ? target.level || (target.metadata ? target.metadata.level : 1) : 1;
        this._xp = (this._xp || 0) + targetLevel; // maybe use later to determine xp bonus from kill?
      }

      // refer to bundles/ranvier-combat/player-events.js for a further list of combat events
    }
  };
};
