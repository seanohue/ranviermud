'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
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
            continue;
          }

          const poolMax = this.target.getMaxAttribute(regen.pool);
          const heal = new Heal({
            attribute: regen.pool,
            amount: Math.round((poolMax / 10) * regen.modifier),
            source: this,
            hidden: true,
          });
          heal.commit(this.target);
        }

        // favor is treated specially in that it drains over time
        if (this.target.hasAttribute('favor')) {
          if (this.target.getAttribute('favor') < 1 || this.target.isInCombat()) {
            return;
          }

          const drain = new Damage({
            attribute: 'favor',
            amount: Math.ceil(this.target.getMaxAttribute('favor') / 10),
            source: this,
            hidden: true
          });
          drain.commit(this.target);
        }
      },
    }
  };
};
