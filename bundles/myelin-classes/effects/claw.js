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
      name: 'Has Claws',
      type: 'hasclaw',
      hidden: true
    },
    flags: ["MUTATION"], //TODO: ADD TO FLAGS?
    listeners: {
      effectActivated() {
        if (this.target.isNpc) { return; }
        Broadcast.sayAt(this.target, "<bold><red>You sprout chitinous claws from the end of your fingertips.</red></bold>");
      },

      look(observer) {
        if (observer.isNpc) {
          return;
        }
        const where = this.target.isNpc ? '' : ' where their fingernails should be';
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
