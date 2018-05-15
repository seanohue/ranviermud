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
        // pools that regenerate over time
        const regens = [
          { pool: 'health', modifier: this.target.isInCombat() ? 0 : 0.5 },
          { pool: 'energy', modifier: this.target.isInCombat() ? 0.25 : 1.5 },
          { pool: 'focus', modifier: this.target.isInCombat() ? 0.25 : 1 },
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
      },
    }
  };
};
