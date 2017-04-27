'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');
  const Heal = require(srcPath + 'Heal');

  return {
    config: {
      name: 'Cursed',
      type: 'skill.curse',
      unique: false // STACK DEM CURSES
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
        const { damageMultiplier, damageToMultiply, affectsHeal } = this.state;

        if (damage instanceof Heal) {
          return affectsHeal ?
            Math.floor(current / damageMultiplier) :
            current;
        }

        const shouldNotAffect = damage.attribute !== damageToMultiply && damageToMultiply !== 'all'
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

