'use strict';

// Increases XP and resource gathering amount.

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Resource Buff',
      type: 'resource.buff',
    },
    flags: [Flag.BUFF],
    listeners: {
      reward(quest, player) {
        const bonus = Math.round(LevelUtil.mobExp(quest.config.level) * .5);
        Broadcast.sayAt(player, `You gain an experience bonus...`);
        player.emit('experience', bonus);
      },

//      player.emit('currency', config.currency, amount);
      currency(name, amount) {
        const metaKey = `currency.${name}`;

        const player = this.target;
        const currentResource = player.getMeta(metaKey) || 0;
        Broadcast.sayAt(player, `You are able to gather ${amount || 0} extra ${name}...`);
        player.setMeta(metaKey, currentResource + amount);
      },

      gather(resource, amount = 0, name = 'resources') {
        const metaKey = `resources.${name}`;

        const player = this.target;
        const currentResource = player.getMeta(metaKey) || 0;
        Broadcast.sayAt(player, `You are able to gather ${amount || 0} extra ${name}...`);
        player.setMeta(metaKey, currentResource + amount);
      },

      look(observer) {
        const player = this.target;
        if (observer.isNpc) { return; }
        Broadcast.sayAt(observer, `Something about ${this.target.name} makes you want to give them a gift.`);
      }
    }
  };
};
