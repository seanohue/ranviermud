'use strict';

/**
 * Implementation effect for a Stun skill to modify the target's combat speed and prevent them from attacking for the duration.
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
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
        if (!this.target.isNpc) Broadcast.sayAt(this.target, "<bold><yellow>You've been stunned.</yellow></bold>");
        this.target.combatData.speed += this.duration;
      },

      effectDeactivated() {
        this.target.combatData.speed -= this.duration;
        if (!this.target.isNpc) Broadcast.sayAt(this.target, "<bold>You regain your senses.</bold>");
        if (this.target.room) Broadcast.sayAtExcept(this.target.room, `${this.target.name} is no longer stunned.`, this.target);
      },

      look(observer) {
        if (observer.isNpc) { return; }
        Broadcast.sayAt(observer, `${this.target.name} appears to be dazed.`);
      },

      killed() {
        if (this.target.isNpc) {
          this.remove();
        }
      }
    }
  };
};