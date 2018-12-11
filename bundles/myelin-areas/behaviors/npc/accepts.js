'use strict';

module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      gifted: state => function(config, item, giver) {
        [].concat(config).forEach(expected =>  {
          if (item.entityReference === expected.item) {
            if (expected.leave) {
              state.MobManager.removeMob(this);
              this.room.area.removeNpc(this);
              const xp = expected.leave.xp || 100; //TODO: Level
              const reason = expected.leave.reason || 'gifting';
              giver.emit('experience', xp, reason);
              Logger.warn(`${giver.name} banished ${this.name} with ${expected.item}`);
            }

            if (expected.message) {
              Broadcast.sayAt(giver.room, expected.message.replace('%GIVER%', giver.name));
            }
          }
        })
      }
    }
  };
}
