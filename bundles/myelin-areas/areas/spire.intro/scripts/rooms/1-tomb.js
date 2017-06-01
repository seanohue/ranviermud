'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');
  return {
    listeners: {
      updateTick: state => function () {
        if (Random.probability(this.players.size || 0)) {
          Broadcast.sayAt(this, '<white>You hear a soft, high whistling coming from the pipes overhead.</white>');
        }
      }
    }
  };
};