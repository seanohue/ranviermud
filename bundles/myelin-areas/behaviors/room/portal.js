'use strict';

let PortalDestinations = new Map();
const {generate, addToWorld} = require('../../lib/generator');

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Player = require(srcPath + 'Player');
  const Random = require(srcPath + 'RandomUtil');


  return {
    listeners: {
      playerEnter: state => function (_config, player, args) {
        if (!player.inventory || !player.inventory.size) return;

        const inv = Array.from(player.inventory.values());
        if (inv.find(item => item.entityReference.includes('portalkey'))) {
          Broadcast.sayAt(player, `<cyan>The portal in this room begins to <b>thrum</b> with light as you approach.</cyan>`);
          if (!player._hadPortalKeyHint) {
            Broadcast.sayAt(player, `<cyan><b>HINT:</b> Try <b>'use portal key'</b> to activate the portal.</cyan>`);
            player._hadPortalKeyHint = true;
          }
          if (this.players.size > 1) {
            Broadcast.sayAtExcept(this, `<cyan>The portal in this room begins to <b>thrum</b> with light as ${player.name} approaches.`, player)
          }       
        };
      },

      respawnTick: state => function (_config, ...args) {
        if (!this.players.size) return;
        for (const player of this.players) {
          if (!player.inventory || !player.inventory.size) continue;

          const inv = Array.from(player.inventory.values());
          if (inv.find(item => item.entityReference.includes('portalkey'))) {
            Broadcast.sayAt(this, `<cyan>The portal in this room <b>pulses</b> with light.</cyan>`);
            break;
          };     
        }
      },

      usePortal: state => function(_config, player, key) {
        const self = this;
        try {
          if (_config === true) _config = {};

          const config = Object.assign({
            keyId: 'spire.intro:portalkey',
            flags: []
          }, _config || {});
          console.log(key.entityReference, config.keyId);
          let goToArea = 'labyrinth';
          if (config.keyId.includes('minotaur')) {
            goToArea = 'ruins';
          }

          if (!key || key.entityReference !== config.keyId) {
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
          player._isUsingPortal = true;
          // PortalDestinations = new Map();
          // for (const [areaName, area] of state.AreaManager.areas) {
          //   const nope = ['intro', 'limbo', 'map'];
          //   if (nope.find(bad => area.name.includes(bad))) continue;
          //   PortalDestinations.set(areaName, area);
          // }

          // if (!PortalDestinations.size) {
          //   return generateDestination();
          // }
          
          if (true) {
            console.log(state.AreaManager.areas);
            const destinationRoom = Array.from(state.AreaManager.getArea(goToArea).rooms.values())[0];
            return movePlayerToPortalDestination(destinationRoom.entityReference);
          }

          function generateDestination() {
            self.removePlayer(player);

            console.log('GENERATING NEW AREA....');

            return generate(srcPath, state, player.level)
              .then(({generated, name}) => {
                console.log('Generated!');
                const {firstRoom} = addToWorld(srcPath, state, name, generated);

                movePlayerToPortalDestination(firstRoom);
              })
              .catch(err => {
                console.error('Error', err);
                player._isUsingPortal = false;
                Broadcast.sayAt(player, 'An error has occurred. Please contact an admin.');
              });
          }

          function movePlayerToPortalDestination(firstRoom) {
            console.log({firstRoom});
            self.removePlayer(player);
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
              Broadcast.sayAtExcept(targetRoom, `<b>${player.name} appears in a <yellow>flash</yellow> of light.</b>`, player);
              state.CommandManager.get('look').execute('', player);
              player._isUsingPortal = false;
              state.ItemManager.remove(key);
            });
          }
        } catch (e) {
          Broadcast.sayAt(player, 'Error: ' + e);
          Broadcast.sayAt(player, 'Error: ' + e.stack);
          
          Broadcast.sayAt(player, 'Please contact an Admin!');
          player._isUsingPortal = false;
        }
      }
    }
  };
};
