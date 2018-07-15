'use strict';

const Combat = require('../../lib/Combat');
/**
 * Example real-time combat behavior for NPCs that goes along with the player's player-combat.js
 * Have combat implemented in a behavior like this allows two NPCs with this behavior to fight without
 * the player having to be involved
 */
module.exports = (srcPath) => {
  const Random = require(srcPath + 'RandomUtil');
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      /**
       * @param {*} config Behavior config
       */
      updateTick: state => function (config) {
        Combat.updateRound(state, this);
      },

      /**
       * Add armor & other combat-related behaviors on spawn.
       * @param {*} config Behavior config
       */
      spawn: state => function (config) {
        let armor = state.EffectFactory.create('armor', this);
        if (this.addEffect(armor)) {
          armor.activate();
        }
        const quicknessDef = state.EffectFactory.create('armor', this, 
          { name: 'Quickness Defense', type: 'quick_def' },
          { attribute: 'quickness', typeMethod: 'isPhysical', multiplier: 0.25 }
        );
        if (this.addEffect(quicknessDef)) {
          quicknessDef.activate();
        }
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
        const health = this.getAttribute('health');
        if (health <= 0 && damage.attacker) {
          this.combatData.killedBy = damage.attacker;
          return;
        }
        const wimpyPercent = config.wimpy;

        if (wimpyPercent && damage.constructor.name !== 'Heal' && damage.attribute === 'health') {
          const healthPercent = (health / this.getMaxAttribute('health'));
          const mustFlee =  healthPercent < (wimpyPercent / 100) && healthPercent > 0.05;
          if (mustFlee) {
            if (this._lastFleeAttempt && Date.now() - this._lastFleeAttempt < 6000) {
              return;
            }

            this._lastFleeAttempt = Date.now();

            let possibleRooms = {};
            for (const possibleExit of this.room.exits) {
              possibleRooms[possibleExit.direction] = possibleExit.roomId;
            }
      
            // TODO: This is in a few places now, there is probably a refactor to be had here
            // but can't be bothered at the moment.
            const coords = this.room.coordinates;
            if (coords) {
              // find exits from coordinates
              const area = this.room.area;
              const directions = {
                north: [0, 1, 0],
                south: [0, -1, 0],
                east:  [1, 0, 0],
                west:  [-1, 0, 0],
                up:    [0, 0, 1],
                down:  [0, 0, -1],
              };
      
              for (const [dir, diff] of Object.entries(directions)) {
                const room = area.getRoomAtCoordinates(coords.x + diff[0], coords.y + diff[1], coords.z + diff[2]);
                if (room) {
                  possibleRooms[dir] = room.entityReference;
                }
              }
            }

            const entries = Object.entries(possibleRooms);
            let direction = null, roomId = null;
            if (entries.length) {
              [direction, roomId] = Random.fromArray(entries);
            }

            const randomRoom = state.RoomManager.getRoom(roomId);

            if (!randomRoom) {
              return;
            }
      
            const door = this.room.getDoor(randomRoom) || randomRoom.getDoor(this.room);
            if (randomRoom && door && (door.locked || door.closed)) {
              return;
            }
            
            Broadcast.sayAt(this.room, `${this.name} flees to${direction !== 'up' && direction !== 'down' ? ' the' : ''} ${direction}!`);
            this.removeFromCombat();
            this.moveTo(randomRoom);
            Broadcast.sayAt(randomRoom, `${this.name} rushes in.`);
          }
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
