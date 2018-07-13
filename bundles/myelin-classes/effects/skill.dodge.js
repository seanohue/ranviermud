'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const Random = require(srcPath + 'RandomUtil');
  const Player = require(srcPath + 'Player');
  const Flag = require(srcPath + 'EffectFlag');
  const DamageType = require('../../myelin-combat/lib/DamageType');

  return {
    config: {
      name: 'Dodge',
      description: "You are actively dodging incoming attacks!",
      type: 'skill:dodge',
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 1,
    },
    modifiers: {
      outgoingDamage: (damage, current) => current,
      incomingDamage(damage, currentAmount) {
        if (damage instanceof Heal || !DamageType.isPhysical(damage.type)) {
          return currentAmount;
        }

        const dodged = Random.probability(this.state.magnitude);

        if (dodged) {
          Broadcast.sayAt(this.target, `You dodge the attack completely!`);
          Broadcast.sayAt(damage.attacker, `<yellow>${this.target.name} <b>dodges</b> your attack!</yellow>`)
          return 0;
        } else if (Random.probability(this.state.magnitude)) {
          Broadcast.sayAt(this.target, 'You nearly dodge the attack, but it still grazes you...');
          Broadcast.sayAt(damage.attacker, `<yellow>${this.target.name} <b>mearly dodges</b> your attack!</yellow>`);

          return Math.ceil(currentAmount / 2);
        }

        return currentAmount;
      }
    },
    listeners: {
      effectDeactivated() {
        Broadcast.sayAt(this.target, 'You are no longer actively dodging attacks.');
      }
    }
  };
};
