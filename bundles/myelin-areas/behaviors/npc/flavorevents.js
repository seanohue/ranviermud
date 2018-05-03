'use strict';

module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const Random = require(srcPath + 'RandomUtil');

  return  {
    listeners: {
      spawn: state => function (config) {

      },

      playerEnter: state => function (config, player) {
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
          return;
        }
        const toPlayerMessage = message.replace('%playerName%', 'you').replace('%name%', this.name);
        const toRoomMessage = message.replace('%playerName%', player.name).replace('%name%', this.name);
        Broadcast.sayAt(player, toPlayerMessage);
        Broadcast.sayAtExcept(this.room, toRoomMessage, player);
      },

      playerDropItem: state => function(config, player, item) {
      },
    }
  };
};

'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');
  return {
    listeners: {
      respawnTick: state => function ({messages = [], cooldown = 60 * 1000, color = 'white'}) {
        if (!this.players.size || !messages.length || !Array.isArray(messages)) {
          return;
        }

        if (!this.__lastEventEmitted) {
          this.__lastEventEmitted = Date.now();
        }

        if (cooldown < 1000) cooldown = cooldown * 1000; // Accidental use of seconds.
        if (cooldown < 30 * 1000) cooldown = 30 * 1000; // 30 is a good minimum.

        const pastCooldown = (Date.now() - this.__lastEventEmitted) > cooldown;
        if (pastCooldown) {
          let message = Random.fromArray(messages);
          if (color) message = `<${color}>${message}</${color}>`;
          Broadcast.sayAt(this, message);
          this.__lastEventEmitted = Date.now();
        }
      }
    }
  };
};
