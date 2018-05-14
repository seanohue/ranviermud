'use strict';

/**
 * Implementation effect for concentrate skill
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Concentration',
      type: 'skill:concentration',
    },
    flags: [Flag.BUFF],
    listeners: {
      damaged(damage) {
        if (damage.attribute !== 'focus') {
          return;
        }

        if (this.skill.onCooldown(this.target)) {
          return;
        }

        if ((this.target.getAttribute('focus') / this.target.getMaxAttribute('focus')) * 100 > this.state.threshold) {
          return;
        }

        Broadcast.sayAt(this.target, "<bold><yellow>You regain focus!</bold></yellow>");
        const attrMultiplier = this.target.getMaxAttribute(this.state.attrMultiplier) * 2
        const heal = new Heal({
          amount: Math.floor(this.target.getMaxAttribute('focus') * attrMultiplier / 100),
          attacker: this.target,
          attribute: 'focus',
          source: this.skill
        });
        heal.commit(this.target);

        this.skill.cooldown(this.target);
      }
    }
  };
};