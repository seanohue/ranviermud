'use strict';

const LootTable = require('../../lib/LootTable');

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Player = require(srcPath + 'Player');
  const Item = require(srcPath + 'Item');
  const Logger = require(srcPath + 'Logger');

  return {
    listeners: {
      killed: state => function (config, killer) {
        const lootTable = new LootTable(state, config);
        const currencies = lootTable.currencies();
        const resources = lootTable.resources();
        const items = lootTable.roll().map(
          item => state.ItemFactory.create(state.AreaManager.getAreaByReference(item), item)
        );

        const corpse = new Item(this.area, {
          id: 'corpse',
          name: `Corpse of ${this.name}`,
          roomDesc: `Corpse of ${this.name}`,
          description: `The corpse of ${this.name}`,
          keywords: this.keywords.concat(['corpse']),
          type: 'CONTAINER',
          metadata: {
            noPickup: true,
          },
          maxItems: items.length,
          behaviors: {
            decay: {
              duration: (this.metadata || {}).decayDuration || 180
            }
          },
        });
        corpse.hydrate(state);

        Logger.log(`Generated corpse: ${corpse.uuid}`);

        items.forEach(item => {
          item.hydrate(state);
          corpse.addItem(item)
        });
        this.room.addItem(corpse);
        state.ItemManager.add(corpse);

        if (killer && killer instanceof Player) {
          if (currencies) {
            distribute(currencies, 'currencies');
          }
          if (resources) {
            distribute(resources, 'resources');
          }

          state.CommandManager.get('look').execute(corpse.uuid, killer);

          function distribute(distributables, type) {
            distributables.forEach(distributable => {
              const friendlyName = distributable.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
              const key = `${type}.${distributable.name}`;
          
              // distribute  among group members in the same room
              const recipients = (killer.party ? [...killer.party] : [killer]).filter(recipient => {
                return recipient.room === killer.room;
              });
          
              let remaining = distributable.amount;
              for (const recipient of recipients) {
                // Split  evenly amount amongst recipients.  The way the math works out, the leader
                // of the party will get any remainder if the distributable isn't divisible evenly
                const amount = Math.floor(remaining / recipients.length) + (remaining % recipients.length);
                remaining -= amount;
          
                B.sayAt(recipient, `<green>You receive ${type}: <b><white>[${friendlyName}]</white></b> x${amount}.`);
          
                if (!recipient.getMeta(type)) {
                  recipient.setMeta(type, {});
                }
                recipient.setMeta(key, (recipient.getMeta(key) || 0) + amount);
                recipient.save();          
              }
            });
          }

        }
      }
    }
  };
};

