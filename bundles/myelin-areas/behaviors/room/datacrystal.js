'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  return {
    listeners: {
      itemLook: state => (config, player, ref) => {
        const entityRef = config.entityRef || 'spire.intro:datacrystals';
        if (!config.message) {
          Logger.error(`No message found for datacrystals behavior in ${this.entityReference}`);
          return;
        }
        if (entityRef.includes(ref)) {
          // Maybe put some flavor text here.
          Broadcast.sayAt(player, '<bold>You step closer and the figures solidify into a moving image.\nYou "hear" a voice ring out in your head, narrating the images.</bold>\n');
          Broadcast.sayAt(player, config.message, 40);
        }
      }
    }
  }
}
