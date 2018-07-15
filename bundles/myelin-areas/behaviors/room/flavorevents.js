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
      },

      playerSpawned: state => function(config, player) {
        if (!config.playerSpawnMessages) return;

        const {playerSpawnMessages} = config;
        if (!playerSpawnMessages.toPlayer || !playerSpawnMessages.toRoom) return;
        Broadcast.sayAt(player, playerSpawnMessages.toPlayer);
        Broadcast.sayAtExcept(this, playerSpawnMessages.toRoom.replace('%name%', player.name), player);
      },

      playerDespawned: state => function(config, player) {
        if (!config.playerDespawnMessages) return;

        const {playerDespawnMessages} = config;
        if (!playerDespawnMessages.toPlayer || !playerDespawnMessages.toRoom) return;
        Broadcast.sayAt(player, playerDespawnMessages.toPlayer);
        Broadcast.sayAtExcept(this, playerDespawnMessages.toRoom.replace('%name%', player.name), player);
      },
    },
  };
};