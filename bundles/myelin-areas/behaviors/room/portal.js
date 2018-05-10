'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Player = require(srcPath + 'Player');

  return {
    listeners: {
      playerEnter: state => function (_config, player, args) {
        console.log('ENTERED PORTAL ROOM, ', {_config, player, args});
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
        console.log('tick in  PORTAL ROOM, ', {_config, args});
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
          return Broadcast.sayAt(player, 'This portal wants a different key...');
        }

        if (player.isInCombat()) {
          return Broadcast.sayAt(player, 'You cannot use the portal while fighting.');
        }

        // Have it say some cool stuff

        // Have it remove the player from the room, broadcasting such to them and anyone else there.

        // Emit input event on player????  (how do that work??)

      }
    }
  };
};
