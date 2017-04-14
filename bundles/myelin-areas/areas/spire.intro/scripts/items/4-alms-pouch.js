'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      get: state => function (player) {
      	player.addEffect('resource.buff');
      },
      drop: state => function (player) {
        player.removeEffect('resource.buff');
      }
    }
  };
};
