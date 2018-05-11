'use strict';

const PortalDestinations = new Map();
const {generate} = require('../../lib/generator');

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Player = require(srcPath + 'Player');

  let loaded = false;

  return {
    listeners: {
      playerEnter: state => function (_config, player, args) {
        if (!player.inventory.size) return;

        const inv = Array.from(player.inventory.values());
        if (inv.find(item => item.entityReference.includes('portalkey'))) {
          Broadcast.sayAt(player, `<cyan>The portal in this room begins to <b>thrum</b> with light as you approach.</cyan>`);
          if (this.players.size > 1) {
            Broadcast.sayAtExcept(this, `<cyan>The portal in this room begins to <b>thrum</b> with light as ${player.name} approaches.`, player)
          }       
        };
      },

      respawnTick: state => function (_config, ...args) {
        if (!this.players.size) return;

        for (const player of this.players) {
          if (!player.inventory.size) continue;

          const inv = Array.from(player.inventory.values());
          if (inv.find(item => item.entityReference.includes('portalkey'))) {
            Broadcast.sayAt(this, `<cyan>The portal in this room <b>pulses</b> with light.</cyan>`);
            break;
          };     
        }
      },

      usePortal: state => function(_config, player, key) {
        if (_config === true) _config = {};

        const config = Object.assign(_config || {}, {
          keyId: 'spire.intro:portalkey',
          flags: []
        });

        if (key.entityReference !== config.keyId) {
          return Broadcast.sayAt(player, '<yellow><b>This portal wants a different key...</b></yellow>');
        }

        if (player.isInCombat()) {
          return Broadcast.sayAt(player, '<yellow><b>You cannot use the portal while fighting.</b></yellow>');
        }

        Broadcast.sayAt(player, `<b>The portal emits a low hum...</b>`);
        Broadcast.sayAtExcept(this, `<b>The portal emits a low hum as ${player.name} uses their key...</b>`, player);

        Broadcast.sayAt(player, `<b>There is a <yellow>flash</yellow> of light, and your surroundings vanish...</b>`);
        Broadcast.sayAtExcept(this, `<b>${player.name} disappears in a <yellow>flash</yellow> of light...</b>`, player);

        
        // Have it remove the player from the room, broadcasting such to them and anyone else there.
        //TODO: Do this to entire party... Have them in a limbo of sorts? Have them vote? Idk.
        this.removePlayer(player);
        player._isUsingPortal = true;

        if (!PortalDestinations.size) {
          // LOAD
          if (!loaded) {
            for (const area of state.AreaManager.areas) {
              if (!area.manifest.isGenerated) continue;
              PortalDestinations.set(area.name, area);
            }
          }
          if (!PortalDestinations.size) {
            // GEN AREA
            const generatedArea = generate();
          }
        } 
        
        if (PortalDestinations.size > 1 || !PortalDestinations.has(player.room.area.name)) {
          
        }

        // ELSE CHOOSE AT RANDOM...
        // 20% chance of new?

        // TODO EVENTUALLY:
        // Emit input event on player????  (how do that work??)
        //  - Remove command listener
        
        //  - Emit new input event and pass it player along with other data.
        // - Quitting or going linkdead should maybe result in them ending back up in this room... 
      }
    }
  };
};
