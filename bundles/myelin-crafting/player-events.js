'use strict';
const Crafting = require('./lib/Crafting');
const ItemUtil = require('../myelin-lib/lib/ItemUtil');

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Config = require(srcPath + 'Config');

  return {
    listeners: {
      resources: state => function(material, amount) {
        const maxResources = Config.get('maxResources') || Infinity;
        const resItem = Crafting.getResourceItem(material);
        const metaKey = `resources.${material}`;
        const newAmount = Math.min((this.getMeta(metaKey) || 0) + amount, maxResources);
        this.setMeta(metaKey, newAmount);
        B.sayAt(this, `<green>You gather: ${ItemUtil.display(resItem)} x${amount}.`);
        if (newAmount === maxResources) {
          B.sayAt(this, `<red><b>You have the maximum amount of ${ItemUtil.display(resItem)}.</red></b>`);
        }
      }
    }
  }
}