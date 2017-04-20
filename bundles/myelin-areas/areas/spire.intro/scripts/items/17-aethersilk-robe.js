'use strict';

module.exports = (srcPath) => {

  return  {
    listeners: {
      equip: state => function (player) {
        const effect = state.EffectFactory.create('aethersilk', player, { source: this.uuid }, { magnitude: 5 });
      	player.addEffect(effect);
      },
      unequip: state => function (player) {
        const effect = player.effects.filterByType('aethersilk').find(eff => effect.config.source === this.uuid);
        player.removeEffect(effect);
      }
    }
  };
};
