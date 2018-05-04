'use strict';

module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const Random = require(srcPath + 'RandomUtil');
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      spawn: state => function (config) {
        if (config.onSpawn) {
          let onSpawnMessage;

          if (Array.isArray(config.onSpawn)) {
            onSpawnMessage = Random.fromArray(config.onSpawn);
          } else if (typeof config.onSpawn === 'string') {
            onSpawnMessage = config.onSpawn
          } else {
            Logger.log('Invalid spawn message:', this.name, config);
            return;
          }

          Broadcast.sayAt(this.room, onSpawnMessage);
        }
      },

      playerEnter: state => function (config, player) {
        console.log('PLAYER ENTERED', config);
        if (!config.onPlayerEnter) {
          return;
        }

        let message, chance = 50;
        if (typeof config.onPlayerEnter === 'string') {
          message = config.onPlayerEnter;
        } else if (typeof config.onPlayerEnter === 'object') {
          if (!config.onPlayerEnter.message) {
            return;
          }

          message = config.onPlayerEnter.message;
          chance  = config.onPlayerEnter.chance || chance; 
        } else {
          return;
        }

        if (!Random.probability(chance)) {
          console.log('failed luck');
          return;
        }
        const toPlayerMessage = message.replace('%playerName%', 'you').replace('%name%', this.name);
        const toRoomMessage = message.replace('%playerName%', player.name).replace('%name%', this.name);
        Broadcast.sayAt(player, toPlayerMessage);
        Broadcast.sayAtExcept(this.room, toRoomMessage, player);
      },

      playerDropItem: state => function(config, player, item) {
        if (!config.onItemDrop) {
          return;
        }

        let message, chance = 50;
        if (typeof config.onItemDrop === 'string') {
          message = config.onItemDrop;
        } else if (typeof config.onItemDrop === 'object') {
          if (!config.onItemDrop.message) {
            return;
          }

          message = config.onItemDrop.message;
          chance  = config.onItemDrop.chance || chance; 
        } else {
          return;
        }

        if (!Random.probability(chance)) {
          return;
        }
        const toPlayerMessage = message.replace('%playerName%', 'you').replace('%name%', this.name).replace('%itemName%', item.name);
        const toRoomMessage = message.replace('%playerName%', player.name).replace('%name%', this.name).replace('%itemName%', item.name);
        Broadcast.sayAt(player, toPlayerMessage);
        Broadcast.sayAtExcept(this.room, toRoomMessage, player);
      },
    }
  };
};
