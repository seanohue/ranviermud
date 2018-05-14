'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Tactics',
      type: 'skill.tactics',
      hidden: true
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 2
    },
    modifiers: {
      attributes: {
        armor(current) {
          return current + this.state.magnitude;
        },

        critical(current) {
          return current + this.state.magnitude;
        }
      }
    },
  };
};