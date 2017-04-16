'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      get: state => function (player) {
        const effect = state.EffectFactory.create('resource.buff', player, { source: this.uuid });
      	player.addEffect(effect);
      },
      drop: state => function (player) {
        const effect = player.effects.getByType('resource.buff');
        if (effect.config.source === this.uuid) {
          player.removeEffect(effect);
        }
      }
    }
  };
};
