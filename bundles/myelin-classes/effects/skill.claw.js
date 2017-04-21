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
      name: 'Claw',
      type: 'skill:claw',
    },
    flags: [Flag.DEBUFF],
    listeners: {
      effectActivated() {
        if (this.target.isNpc) { return; }
        Broadcast.sayAt(this.target, "<bold><red>You've suffered a deep wound, it's bleeding profusely.</red></bold>");
      },

      effectDeactivated() {
        if (this.target.isNpc) { return; }
        Broadcast.sayAt(this.target, "Your wound has stopped bleeding.");
      },

      updateTick() {
        const amount = Math.round(this.state.totalDamage / Math.round((this.config.duration / 1000) / this.config.tickInterval));
        this.verb = 'bled';
        const damage = new Damage({
          attribute: 'physical',
          amount,
          attacker: this.attacker,
          source: this
        });
        damage.commit(this.target);
      },

      look(observer) {
        if (observer.isNpc) {
          return;
        }
        let where = this.target.isNpc ? '' : ' where their fingernails should be';
        Broadcast.sayAt(observer, `${this.target.name} has jagged, sharp claws${where}.`);
      },

      killed() {
        if (this.target.isNpc) {
          this.remove();
        }
      }
    }
  };
};
