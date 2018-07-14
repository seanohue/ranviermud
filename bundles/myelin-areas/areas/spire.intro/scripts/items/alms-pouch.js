'use strict';

module.exports = (srcPath) => {

  return  {
    listeners: {
      equip: state => function (player) {
        const effect = state.EffectFactory.create('resource.buff', player, { source: this.uuid });
      	player.addEffect(effect);
      },
      unequip: state => function (player) {
        const effect = player.effects.filterByType('resource.buff').filter(eff => eff.config.source === this.uuid);
        player.removeEffect(effect);
      }
    }
  };
}