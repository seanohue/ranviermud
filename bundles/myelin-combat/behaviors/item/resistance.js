
'use strict';

module.exports = (srcPath) => {

  return  {
    listeners: {
      equip: state => function (config, player) {
        const effect = state.EffectFactory.create('resistance', player, { source: this.uuid }, { resistance: config });
      	player.addEffect(effect);
      },
      unequip: state => function (config, player) {
        const effect = player.effects.filterByType('resistance').find(eff => effect.config.source === this.uuid);
        player.removeEffect(effect);
      }
    }
  };
};