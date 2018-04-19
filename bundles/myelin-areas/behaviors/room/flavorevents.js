'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');
  console.log('ADDING FLAVOREVENTS'.repeat(100));
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