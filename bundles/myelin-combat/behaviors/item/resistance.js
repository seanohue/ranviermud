
'use strict';

module.exports = (srcPath) => {
  console.log('Loading item behavior for resistance...\n');
  return  {
    listeners: {
      equip: state => function (config, player) {
        console.log('Adding resistance eff...');
        const effect = state.EffectFactory.create('resistance', player, { source: this.uuid }, { resistance: config });
      	player.addEffect(effect);
      },
      unequip: state => function (config, player) {
        const effect = player.effects.filterByType('resistance').find(eff => eff.config.source === this.uuid);
        if (effect) player.removeEffect(effect);
      }
    }
  };
};