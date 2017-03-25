'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Regenerate',
      description: "You are regenerating over time.",
      type: 'regen',
      tickInterval: 3
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 10,
    },
    listeners: {
      updateTick: function () {
        const regens = [
          { pool: 'physical', modifier: this.target.isInCombat() ? 0 : 1 },
          // mental health recovers at 75% rate of physical health
          { pool: 'mental', modifier: this.target.isInCombat() ? 0 : .75 },
          // energy recovers 50% faster than health
          { pool: 'energy', modifier: this.target.isInCombat() ? 0.25 : 1.5 },
        ];

        for (const regen of regens) {
          if (!this.target.hasAttribute(regen.pool)) {
            return;
          }

          let heal = new Heal({
            attribute: regen.pool,
            amount: Math.round(this.state.magnitude * regen.modifier),
            attacker: this.target,
            source: this,
            hidden: true,
          });
          heal.commit(this.target);
        }
      },
    }
  };
};
