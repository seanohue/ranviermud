'use strict';

/**
 * Implementation effect for a Rend damage over time skill
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Rend',
      type: 'skill:rend',
      maxStacks: 3,
    },
    flags: [Flag.DEBUFF],
    listeners: {
      effectStackAdded(newEffect) {
        // add incoming rend's damage to the existing damage but don't extend duration
        this.state.totalDamage += newEffect.state.totalDamage;
      },

      effectActivated() {
        Broadcast.sayAt(this.target, "<bold><red>You've suffered a deep wound, it's bleeding profusely</red></bold>");
      },

      effectDeactivated() {
        Broadcast.sayAt(this.target, "Your wound has stopped bleeding.");
      },

      updateTick() {
        const amount = Math.round(this.state.totalDamage / Math.round((this.config.duration / 1000) / this.config.tickInterval));
        console.log('rend amount:', amount);
        const damage = new Damage({
          attribute: "health",
          amount,
          type: 'bleeding',
          attacker: this.attacker,
          source: this
        });

        damage.verb = 'bleeds';
        damage.commit(this.target);
      },

      killed() {
        this.remove();
      }
    }
  };
};
