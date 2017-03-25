'use strict';

/**
 * Health potion item spell
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const SkillType = require(srcPath + 'SkillType');

  return {
    name: 'Potion',
    type: SkillType.FEAT,
    requiresTarget: true,
    targetSelf: true,

    run: state => function (args, player, target) {
      const restorePercent = this.options.restore || 0;
      const stat = this.options.stat || 'physical';
      const heal = new Heal({
        attribute: stat,
        amount: Math.round(player.getMaxAttribute('physical') * (this.options.restores / 100)),
        attacker: player,
        source: this
      });

      Broadcast.sayAt(player, `<bold>You drink the potion and a warm feeling fills your body.</bold>`);
      heal.commit(target);
    },

    info: function (player) {
      return `Restores <b>${this.options.restores}%</b> of your total ${this.options.stat}.`;
    }
  };
};
