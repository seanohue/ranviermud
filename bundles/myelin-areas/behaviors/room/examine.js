'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    listeners: {
      examineAttempt: state => function(config, player, search) {
        const { examinables = {} } = config;

        for (const [examinable, keywords] of Object.entries(examinables)) {
          const found = examinable.includes(search) || keywords.some(keyword => keyword.includes(search));
          if (found) {
            return this.emit('examine', player, examinable);
          }
        }

        return Broadcast.sayAt(player, 'Examine what?');
      }
    }
  }
}