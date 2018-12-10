'use strict';

module.exports = (srcPath) => {
  const Logger = require(srcPath + 'Logger');
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      give: state => function(config, item, giver) {
        [].concat(config).forEach(expected =>  {
          if (item.entityRef === expected.item) {
            if (expected.killOnGive) {
              this.emit('killed', giver);
              giver.emit('deathblow', this);
            }
          }
        })
      }
    }
  };
}
