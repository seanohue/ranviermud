'use strict';

const PortalDestinations = new Map();
const {generate, addToWorld} = require('../../lib/generator');

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
            for (const [areaName, area] of state.AreaManager.areas) {
              if (!area.info.isGenerated) continue;
              PortalDestinations.set(areaName, area);
            }
          }
          if (!PortalDestinations.size) {
            const min = Math.max(1, player.level - 2);
            const max = Math.min(99, player.level + 5);
            const levelRange = {min, max};

            const {generated, name} = generate(srcPath, state, levelRange);

            const {firstRoom} = addToWorld(srcPath, state, name, generated);

            // SEND THERE
            const targetRoom = state.RoomManager.getRoom(firstRoom);
            if (!targetRoom) {
              return Broadcast.sayAt(player, 'Teleportation failed. No such room entity reference exists. Contact an admin.');
            } else if (targetRoom === player.room) {
              return Broadcast.sayAt(player, 'Teleportation failed. Teleported to same room. Contact an admin.');
            }
        
            player.followers.forEach(follower => {
              // TODO: Change to send followers as well.
              follower.unfollow();
              if (!follower.isNpc) {
                Broadcast.sayAt(follower, `You stop following ${player.name}.`);
              }
            });
      
            if (player.isInCombat()) {
              player.removeFromCombat();
            }
      
            player.moveTo(targetRoom, () => {
              Broadcast.sayAt(player, '<b><green>You find yourself in a strange new world...</green></b>\r\n');
              state.CommandManager.get('look').execute('', player);
            });
      
            Broadcast.sayAtExcept(targetRoom, `<b>${player.name} appears in a <yellow>flash</yellow> of light.</b>`, player);
          }
        } 
        
        if (PortalDestinations.size > 1 || !PortalDestinations.has(player.room.area.name)) {
          console.log('unimplemented...');
        }

        // ELSE CHOOSE AT RANDOM...
        // 20% chance of new? Less and less once there are more pocket worlds.
      }
    }
  };
};
