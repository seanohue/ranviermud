'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal      = require(srcPath + 'Heal');
  const Damage    = require(srcPath + 'Damage');
  const Player    = require(srcPath + 'Player');
  const Flag      = require(srcPath + 'EffectFlag');
  const Random    = require(srcPath + 'RandomUtil');

  const DamageType = require(srcPath + '../bundles/myelin-combat/lib/DamageType.js');
  const Combat     = require(srcPath + '../bundles/myelin-combat/lib/Combat.js');

  return {
    config: {
      name: 'Riposte',
      description: "You are actively riposting incoming physical attacks!",
      type: 'skill:block',
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 1,
      type: "isPhysical"
    },
    modifiers: {
      outgoingDamage: (damage, current) => current,
      incomingDamage(damage, currentAmount) {
        if (!damage.attacker || 
          damage instanceof Heal || 
          damage.attribute !== 'health' || 
           (Array.isArray(damage.type) && typeof damage.type[0] === 'symbol'
           && !DamageType[this.state.type](damage.type))
          ) {
          return currentAmount;
        }

        let riposted = 0;

        if (currentAmount > 0) {
          const max = Math.min(currentAmount, this.state.maximum || currentAmount);
          const min = Math.min(max, this.state.minimum || 1);

          riposted      = Random.inRange(min, max);
          currentAmount = Math.max(0, currentAmount - riposted);
        } else {
          riposted = Random.inRange(this.state.minimum || 1, this.state.maximum || 1);
        }
    
        console.log({riposted, state: this.state, currentAmount});
        
        this.state.remaining--;

        if (!riposted) return currentAmount;

        const player = this.target;
        Broadcast.sayAt(player, `You riposte the attack from ${damage.attacker.name}!`);
        if (!this.state.remaining) {
          this.remove();
        }

        const type = Combat.getDamageTypeFromAttacker(player);

        const riposteDamage = new Damage({
          attribute: 'health',
          amount: Math.abs(riposted),
          attacker: player,
          type: type,
          source: this
        });

        riposteDamage.commit(damage.attacker);

        return currentAmount;
      }
    },
    listeners: {
      effectActivated: function () {
        this.state.remaining = this.state.magnitude;

        if (this.target instanceof Player) {
          this.target.addPrompt('riposte', () => {
            const width = 60 - "Riposting ".length;
            const remaining = `<b>${this.state.remaining}/${this.state.magnitude}</b>`;
            return "<b>Riposting</b> " + Broadcast.progress(width, (this.state.remaining / this.state.magnitude) * 100, "white") + ` ${remaining}`;
          });
        }
      },

      effectDeactivated: function () {
        Broadcast.sayAt(this.target, 'You lower your defenses, unable to riposte any more attacks.');
        if (this.target instanceof Player) {
          this.target.removePrompt('riposte');
        }
      }
    }
  };
};
