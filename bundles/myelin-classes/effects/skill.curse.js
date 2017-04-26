'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');
  const Heal = require(srcPath + '')
  return {
    config: {
      name: 'Cursed',
      type: 'skill.curse',
    },
    flags: [Flag.DEBUFF],
    state: {
      damageToMultiply: 'physical',
      damageMultiplier: 1.5,
      affectsHeal: true,
      shouldBroadcast: true
    },
    modifiers: {
      incomingDamage(damage, current) {
        if (damage instanceof Heal) {
          return this.state.affectsHeal ?
            Math.floor(current / damageMultiplier) :
            current;
        }

        const shouldNotAffect = damage.attribute !== this.state.damageToMultiply && damageToMultiply !== 'all'
        if (shouldNotAffect) {
          return current;
        }

        return Math.ceil(current * damageMultiplier);
      },
    },
    listeners: {
      effectActivated() {
        if (this.state.shouldBroadcast) {
          Broadcast.sayAt(this.target, "You feel a sense of foreboding.");
        }
      },

      effectDeactivated() {
        if (this.state.shouldBroadcast) {
          Broadcast.sayAt(this.target, "You feel more hopeful.");
        }
      },

      look(observer) {
        if (this.state.description) {
          Broadcast.sayAt(observer, this.state.description);
        }
      }
    }
  };
};

