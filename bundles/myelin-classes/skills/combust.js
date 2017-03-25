'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Damage = require(srcPath + 'Damage');
  const SkillType = require(srcPath + 'SkillType');

  const damagePercent = 100;
  const cost = 20;

  function getDamage(player) {
    return player.getAttribute('intellect') * (damagePercent / 100);
  }

  return {
    name: 'combust',
    type: SkillType.FEAT,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'mental',
      cost: cost,
    },
    cooldown: 10,

    run: state => function (args, player, target) {
      const damage = new Damage({
        attribute: 'physical',
        amount: getDamage(player),
        attacker: player,
        type: 'physical', //TODO: 'fire'
        source: this
      });

      Broadcast.sayAt(player, '<bold>With a flourish, you unleash a <yellow>burst</yellow> of <red>flame</red> at your target!</bold>');
      Broadcast.sayAtExcept(player.room, `<bold>With a flourish, ${player.name} unleashes <red>fire</red> at ${target.name}!</bold>`, [player, target]);
      if (!target.isNpc) {
        Broadcast.sayAt(target, `<bold>With a flourish, ${player.name} unleashes <red>fire</red> at you!</bold>`);
      }
      damage.commit(target);
    },

    info: (player) => {
      return `Create a targeted burst of flame from your fingertips, dealing ${damagePercent}% of your Intellect as Fire damage.`;
    }
  };
};
