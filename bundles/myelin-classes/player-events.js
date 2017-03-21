'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      useAbility: state => function (ability, args) {
        if (!this.playerClass.hasAbility(ability.id)) {
          return Broadcast.sayAt(this, 'That ability does not exist.');
        }

        if (!this.playerClass.canUseAbility(this, ability.id)) {
          return Broadcast.sayAt(this, 'You have not yet learned that ability.');
        }

        ability.execute(args, this);
      },

      /**
       * Handle player leveling up
       */
      level: state => function () {
        // Award attribute points for boosting attributes.
        const attributePoints = parseInt(this.getMeta('attributePoints') || 0, 10);
        this.setMeta('attributePoints', attributePoints + 1);
        Broadcast.sayAt(this, `<blue>You now have ${abilityPoints + 1} points to spend on boosting attributes.</blue>`);

        // Award ability points for buying skills/feats.
        const abilityPoints = parseInt(this.getMeta('abilityPoints') || 0, 10);
        this.setMeta('abilityPoints', abilityPoints + 1);
        Broadcast.sayAt(this, `<blue>You now have ${abilityPoints + 1} points to spend on new abilities.</blue>`);

        // Show them their current skills and newly available ones.
        return state.CommandManager.get('skills').execute('', this);

      }
    }
  };
};
