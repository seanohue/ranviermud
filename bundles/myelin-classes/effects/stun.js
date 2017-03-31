'use strict';

/**
 * Implementation effect for a Stun skill to modify outgoing damage.
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
        this.target.combatData.combatLag += this.duration;
      },

      effectDeactivated() {
        this.target.combatData.combatLag -= this.duration;
        Broadcast.sayAt(this.target, "You regain your senses.");
      },

      killed() {
        this.remove();
      }
    }
  };
};
