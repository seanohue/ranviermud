'use strict';

/**
 * DoT (Damage over time) skill
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const SkillType = require(srcPath + 'SkillType');

  // config placed here just for easy copy/paste of this skill later on
  const attribute = 'might';
  const cooldown = 20;
  const cost = 50;
  const duration = player.getAttribute(attribute) * 1000;
  const tickInterval = 3;
  const damagePercent = 200;

  const totalDamage = player => {
    return player.getMaxAttribute(attribute) * (damagePercent / 100);
  };

  return {
    name: 'Claw',
    type: SkillType.MUTATION,
    requiresTarget: true,
    initiatesCombat: true,
    resource: {
      attribute: 'energy',
      cost,
    },
    cooldown,

    //TODO: Use damage types or something to make this less effective vs. armor.
    run: state => function (args, player, target) {
      const effect = state.EffectFactory.create(
        'skill.claw',
        target,
        {
          duration,
          description: this.info(player),
          tickInterval,
        },
        {
          totalDamage: totalDamage(player),
        }
      );
      effect.skill = this;
      effect.attacker = player;

      Broadcast.sayAt(player, `<red>With a vicious clawed attack you open a deep wound in <bold>${target.name}</bold>!</red>`);
      Broadcast.sayAtExcept(player.room, `<red>${player.name} viciously claws ${target.name}.</red>`, [target, player]);
      Broadcast.sayAt(target, `<red>${player.name} viciously claws you!</red>`);
      target.addEffect(effect);
    },

    info: (player) => {
      return `You grow lengthy, chitinous claws where your fingernails used to be. Use them to tear a deep wound in your target's flesh, dealing <bold>${damagePercent}%</bold> might damage over <bold>${duration / 1000}</bold> seconds.`;
    }
  };
};
