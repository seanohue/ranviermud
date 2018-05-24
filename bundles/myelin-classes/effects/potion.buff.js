'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Potion Buff',
      type: 'potion.buff',
      refreshes: true,
    },
    flags: [Flag.BUFF],
    state: {
      stat: "might",
      magnitude: 1
    },
    modifiers: {
      attributes(attribute, current) {
        if (attribute !== this.state.stat) {
          return current;
        }

        return current + this.state.magnitude;
      }
    },
    listeners: {
      effectRefreshed(newEffect) {
        this.startedAt = Date.now();
        Broadcast.sayAt(this.target, "You refresh the potion's magic.");
      },

      effectActivated() {
        Broadcast.sayAt(this.target, "You drink down the potion and feel more powerful!");
      },

      effectDeactivated() {
        Broadcast.sayAt(this.target, "You feel less powerful.");
      }
    }
  };
};

