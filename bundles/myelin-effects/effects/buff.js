'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Buff',
      description: "You feel more powerful!",
      duration: 30 * 1000,
      type: 'buff',
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 5
    },
    modifiers: {
      attributes(name, current) {
        if (this.state.attributes.includes(name)) {
          return current + this.state.magnitude;
        }
      }
    },
    listeners: {
      effectActivated() {
        Broadcast.sayAt(this.target, this.state.activated || "Power courses through your veins!");
      },

      effectDeactivated() {
        Broadcast.sayAt(this.target, this.state.deactivated || "You feel weaker.");
      }
    }
  };
};
