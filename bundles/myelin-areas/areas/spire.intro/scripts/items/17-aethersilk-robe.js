'use strict';

module.exports = (srcPath) => {

  return  {
    listeners: {
      get: state => function (player) {
        const effect = state.EffectFactory.create('aethersilk', player, { source: this.uuid }, { magnitude: 5 });
      	player.addEffect(effect);
      },
      drop: state => function (player) {
        const effect = player.effects.filterByType('aethersilk').find(eff => effect.config.source === this.uuid);
        player.removeEffect(effect);
      }
    }
  };
};
