'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Player = require(srcPath + 'Player');

  return {
    listeners: {
      read: state => function (config, player, args) {
        let {
          divName = 'page',
          content = {}
        } = config;

        const contentMap = new Map(Object.entries(content));
        const target = args ? args : contentMap.keys()[0];
        console.log(contentMap);
        console.log(target);
      },
    }
  };
};
