'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      joinGroup: state => function(config, inviter) {
        console.log('joinGroup emitted', {config});
        let message = `<green>${this.name} joins your party.</green>`;

        if (config.quest) {
          let completed = false;
          if (Array.isArray(config.quest)) {
            completed = config.quest.every(quest => inviter.questTracker.isComplete(quest));
          } else {
            completed = inviter.questTracker.isComplete(config.quest);
          }
          if (!completed) {
            let declineMessage = config.declineMessage || `${this.name} needs you to do something first...`;
            return Broadcast.sayAt(inviter, `<green>${declineMessage}</green>`);
          }
        }

        if (config.skill) {
          let hasSkill = false;
          if (Array.isArray(config.skill)) {
            hasSkill = config.skill.every(skill => inviter.playerClass.canUseAbility(skill));
          } else if (typeof config.skill === 'object') {
            Object.keys(config.skill).some(skill => {
              const found = inviter.playerClass.canUseAbility(skill);
              if (found) {
                const skillSuccess = config.skill[skill];
                message = formatMesssage.call(this, skillSuccess, inviter);
              }
              return found;
            });
          } else {
            hasSkill = inviter.playerClass.canUseAbility(skill);
          }
          if (!hasSkill) {
            let declineMessage = config.declineMessage || `You don't know how to convince ${this.name} to join you...`;
            return Broadcast.sayAt(inviter, `<green>${declineMessage}</green>`);
          }
        }

        if (typeof config === 'string' || config.message) {
          message = config.message || config;
          message = formatMessage.call(this, message, inviter);
        }

        Broadcast.sayAt(inviter, message);
        return join.call(this, config, inviter);

        function join(config, inviter) {
          inviter.party.add(this);
          this.follow(inviter);
        }

        function formatMessage(message, inviter) {
          return `<green>${message.replace('%name%', this.name).replace('%inviter%', inviter.name)}</green>`;
        }
      }
    }
  };
};
