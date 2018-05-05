'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  return  {
    listeners: {
      playerEnter: state => function (config, player) {
        let questId;
        console.log('Player entered quest room.');
        if (typeof config === 'string') {
          questId = config;
        } else if (config && typeof config === 'object') {
          questId = config.questId;
        }

        if (!questId.includes(':')) {
          questId = `${this.room.area.title}:questId`;
        }

        if (!questId) {
          Logger.error(`No quest name configured in ${this.entityReference}`);
          return;
        }
        console.log('ID is ', questId);
        const quest = state.QuestFactory.create(state, config.questId, player);
        if (player.questTracker.canStart(quest)) {
          Logget.log('Starting!');
          player.questTracker.start(quest);
        } else {
          Logger.log('Player could not start quest yet.');
          console.log(quest);
        }
      }
    }
  };
};