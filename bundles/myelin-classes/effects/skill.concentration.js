'use strict';

/**
 * Implementation effect for second wind skill
 */
module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Concentration',
      type: 'skill:concentration'
    },
    flags: [Flag.BUFF],
    listeners: {
      damaged(damage) {
        if (damage.attribute !== 'mental') {
          return;
        }

        if (this.skill.onCooldown(this.target)) {
          return;
        }

        if ((this.target.getAttribute('mental') / this.target.getMaxAttribute('mental')) * 100 > this.state.threshold) {
          return;
        }

        Broadcast.sayAt(this.target, "<bold><yellow>You regain focus!</bold></yellow>");
        const attrMultiplier = this.target.getMaxAttribute(this.state.attrMultiplier) * 2
        const heal = new Heal({
          amount: Math.floor(this.target.getMaxAttribute('mental') * attrMultiplier / 100),
          attacker: this.target,
          attribute: 'mental',
          source: this.skill
        });
        heal.commit(this.target);

        this.skill.cooldown(this.target);
      }
    }
  };
};
