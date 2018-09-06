'use strict';

/*
  PortalID => PortalDestinations
*/

/*
  Command ideation:
  `node list` shows destinations && metadata
  `node travel <#>` travels to that destination and consumes an Axon
  `travel #` alias for node travel
*/
const PortalDestinations = new Map();

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    listeners: {
      spawn: state => function (config) {
        console.log(config);
        if (!config.destinations) {
          return Logger.error(`No destinations registered for ${this.entityReference} Node.`);
        }

        const destinations = {};

        let number = 1;
        for (const ref of config.destinations) {
          const room = state.RoomManager.getRoom(ref);
          if (!room) {
            Logger.error(`No room found at ${ref} for Node being registered as ${this.entityReference}.`);
            continue;
          }
          
          destinations[number] = room;
          number++;
        }

        PortalDestinations.set(this.entityReference, destinations);
        Logger.log(`Node at ${this.entityReference} registered ${number - 1} destinations.`);  
      },

      listDestinations: state => function(config, player) {
        const destinations = PortalDestinations.get(this.entityReference);
        if (!destinations || !Object.keys(destinations).length) {
          Logger.warn(`Player tried using destinationless Node at ${this.entityReference}.`);
          return Broadcast.sayAt(player, `<b>This Node appears to be broken.</b>`);
        }

        Broadcast.sayAt(player, `<b>Destinations:</b>`);
        for (const [number, destination] of Object.entries(destinations)) {
          Broadcast.sayAt(player, `${number}) <b><green>[${destination.area.title}]</b> ${destination.title}</green> -- levels ${destination.area.getLevelRange()} ${destination.area.getPvpTag()}`);
        }

        Broadcast.sayAt(player);
        Broadcast.sayAt(player, `Use <b>node travel</b> to travel to your destination.`);
        
      },

      playerEnter: state => function (_config, player, args) {
        if (!player.inventory || !player.inventory.size) return;

        const inv = Array.from(player.inventory.values());
        if (inv.find(item => item.entityReference.includes('axon'))) {
          Broadcast.sayAt(player, `<cyan>The Node in this room begins to <b>thrum</b> with light as you approach.</cyan>`);
          if (!player._hadAxonHint) {
            Broadcast.sayAt(player, `<cyan><b>HINT:</b> Try <b>'node list'</b>.</cyan>`);
            player._hadAxonHint = true;
          }
          if (this.players.size > 1) {
            Broadcast.sayAtExcept(this, `<cyan>The Node in this room begins to <b>thrum</b> with light as ${player.name} approaches.`, player)
          }       
        };
      },

      respawnTick: state => function (_config, ...args) {
        if (!this.players.size) return;
        for (const player of this.players) {
          if (!player.inventory || !player.inventory.size) continue;

          const inv = Array.from(player.inventory.values());
          if (inv.find(item => item.entityReference.includes('axon'))) {
            Broadcast.sayAt(this, `<cyan>The portal in this room <b>pulses</b> with light.</cyan>`);
            break;
          };     
        }
      },

      usePortal: state => function(config, player, key, number) {
        const self = this;
        try {
          Logger.log(`Player used ${this.entityReference} to travel to ${number}.`);
          if (player.isInCombat()) {
            return Broadcast.sayAt(player, '<yellow><b>You cannot use Nodes while fighting.</b></yellow>');
          }

          const destinations = PortalDestinations.get(this.entityReference);
          if (!destinations) {
            Broadcast.sayAt(player, '<b>This Node goes nowhere.</b>');
            return Logger.error('Player tried using Node with no destinations at ' + this.entityReference);
          }

          const destinationRoom = destinations[number];

          if (!destinationRoom) {
            Broadcast.sayAt(player, '<b>That is not a valid destination.</b>');
            return Logger.error(`Player tried using Node with wrong destination ${number} at ` + this.entityReference);
          }

          Broadcast.sayAt(player, `<b>You turn the dial to ${number}. The Node emits a low hum...</b>`);
          Broadcast.sayAtExcept(this, `<b>The Node emits a low hum as ${player.name} turns the dial and places an Axon into it.</b>`, player);

          Broadcast.sayAt(player, `<b>You place an Axon into the Node and and your surroundings vanish...</b>`);
          Broadcast.sayAtExcept(this, `<b>${player.name} disappears in a <yellow>flash</yellow> of light...</b>`, player);

          // Have it remove the player from the room, broadcasting such to them and anyone else there.
          //TODO: Do this to entire party... Have them in a limbo of sorts? Have them vote? Idk.
          player._isUsingPortal = true;

          movePlayerToPortalDestination(destinationRoom);

          function movePlayerToPortalDestination(targetRoom) {
            self.removePlayer(player);

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
              Broadcast.sayAt(player, '<b><green>You find yourself somewhere new.</green></b>\r\n');
              Broadcast.sayAtExcept(targetRoom, `<b>${player.name} appears in a <yellow>flash</yellow> of light.</b>`, player);
              state.CommandManager.get('look').execute('', player);
              player._isUsingPortal = false;
              state.ItemManager.remove(key);
            });
          }
        } catch (e) {
          Logger.error(`Failure when using Node at ${this.entityReference}:`);
          Logger.error(e);
          
          Broadcast.sayAt(player, 'Please contact an Admin!');
          player._isUsingPortal = false;
        }
      }
    }
  };
};
