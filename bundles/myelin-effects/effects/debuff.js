'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Debuff',
      description: "You feel weakened!",
      duration: 30 * 1000,
      type: 'debuff',
    },
    flags: [Flag.DEBUFF],
    state: {
      magnitude: 5
    },
    modifiers: {
      attributes(name, current) {
        if (this.state.attributes.includes(name)) {
          // Cannot go negative or zero due to, uh, math.
          return Math.max(current - this.state.magnitude, 1);
        }
        return current;
      }
    },
    listeners: {
      //TODO: Custom activated/deactivated where it makes sense.`
      effectActivated() {
        Broadcast.sayAt(this.target, this.state.activated || "You feel weakened!");
      },

      effectDeactivated() {
        Broadcast.sayAt(this.target, this.state.deactivated || "You feel normal again.");
      }
    }
  };
};
