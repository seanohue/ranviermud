'use strict';

/**
 * Implementation effect for a Stun skill to modify the target's combat speed and prevent them from attacking for the duration.
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Stun',
      type: 'skill:stun',
      description: 'You are stunned and cannot move, fight, or use special abilities.'
    },
    flags: [Flag.DEBUFF],
    listeners: {
      effectActivated() {
        Broadcast.sayAt(this.target, "<bold><yellow>You've been stunned.</yellow></bold>");
        this.target.combatData.speed += this.duration;
      },

      effectDeactivated() {
        this.target.combatData.speed -= this.duration;
        Broadcast.sayAt(this.target, "<bold>You regain your senses.</bold>");
      },

      killed() {
        if (this.target.isNpc) {
          this.remove();
        }
      }
    }
  };
};
