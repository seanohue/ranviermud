'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Buff',
      description: "You feel stronger and faster!",
      duration: 30 * 1000,
      type: 'buff.physical',
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 5
    },
    modifiers: {
      attributes: {
        might(current) {
          return current + this.state.magnitude;
        },
        quickness(current) {
          return current + this.state.magnitude;
        }
      }
    },
    listeners: {
      effectActivated() {
        Broadcast.sayAt(this.target, "Power courses through your veins!");
      },

      effectDeactivated() {
        Broadcast.sayAt(this.target, "You feel weaker and slower.");
      }
    }
  };
};
