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
        if (!args || !args.length) {
          return renderToC.call(this, player, content, divName)
        }
        console.log(contentMap);
        console.log(target);
      },
    }
  };

  function renderToC(player, content, divName) {
    Broadcast.sayAt(player, Broadcast.center(40, this.name));
    Broadcast.sayAt(player, this.description);
    Broadcast.sayAt(player, `${divName}s: ${Array.from(content.keys()).map(String.prototype.toUpperCase).join(', ')}.`)
    Broadcast.sayAt(player, `<b>Try 'read ${this.name.split(' ')[0].toLowerCase()}' [${divName}] to read a specific ${divName}</b>`);
  }

};


