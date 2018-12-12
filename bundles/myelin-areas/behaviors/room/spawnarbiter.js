'use strict';

module.exports = srcPath => {
  const Random = require(srcPath + 'RandomUtil');
  const Logger = require(srcPath + 'Logger');
  const Party = require(srcPath + 'Party');
  return {
    listeners: {
      playerEnter: state => function (_config, player) {
        if (!player.inventory || !player.inventory.size) return;
        if ([...this.spawnedNpcs].find(npc => npc.entityReference === 'spire.labyrinth:arbiter')) return;
        const inv = Array.from(player.inventory.values());
        if (inv.find(item => item.entityReference.includes('axon'))) {
          const amount = Math.min(Math.ceil(player.level / 5), 4);

          /**
           * @async
           * Spawns an arbiter with a semi-random delay.
           * @return {Promise<Npc>}
           */
          function spawnArbiterWithDelay() {
            return new Promise(resolve => {
              setTimeout(
                () => resolve(this.spawnNpc(state, 'spire.labyrinth:arbiter')),
                Random.inRange(100, 10 * 1000)
              )
            });
          }

          const arbiters = Array.from({length: amount}, spawnArbiterWithDelay.bind(this));
          Logger.warn(`${player.name} caused ${arbiters.length} arbiters to spawn.`);
        };
      },
    }
  }
}
