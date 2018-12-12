'use strict';

module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      spawn: state => function() {
        this.__spawnedOn = Date.now();
      },

      updateTick: state => function(config) {
        if (!this.__spawnedOn) this.__spawnedOn = Date.now();

        const span = Date.now() - this.__spawnedOn;
        const lifetime = config.time * 1000;

        if (span > lifetime) {
          if (config.message) {
            Broadcast.sayAt(this.room, config.message);
          }
          this.emit('killed');
          Logger.warn(`${this.id} has died of old age.`);
        }
      }
    }
  };
}
