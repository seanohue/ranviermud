'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return {
    listeners: {
      spawn: state => function (config) {
        const effect = state.EffectFactory.create('resistance', this, { source: this.uuid }, { resistance: config });
      	this.addEffect(effect);
      },
    }
  };
};
