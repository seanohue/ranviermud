'use strict';

module.exports = srcPath => {
  const Random = require(srcPath + 'RandomUtil');
  const Logger = require(srcPath + 'Logger');

  return {
    listeners: {
      // Edit to be more generic/configurable.
      playerEnter: state => function (config, player) {
        if (!player.inventory || !player.inventory.size) return;

        const shouldAmbush = !config.item || player.hasItem(config.item);
        if (!shouldAmbush) return;
        if (this.__spawnedAmbush) {
          const interval = config.interval || 60 * 1000;
          const since = Date.now() - this.__spawnedAmbush;

          if (since < interval) return;
        }

        this.__spawnedAmbush = Date.now();

        const npcsToSpawn = []
          .concat(config.spawn)
          .reduce((toSpawn, ambush) => {
            ambush.level = ambush.level || 0;
            ambush.maxLevel = ambush.maxLevel || Infinity;
            if (player.level >= ambush.level && player.level <= ambush.maxLevel) {
              return toSpawn.concat(ambush.enemies);
            }
            return toSpawn; 
          }, []);

        // Check to make sure we are not spawning a ridiculous number of NPCs.
        const threshold = Math.ceil(npcsToSpawn.length / 2);
        if ([...this.spawnedNpcs].filter(npc => npcsToSpawn.includes(npc.entityReference)) > threshold) return;

        /**
         * @async
         * Spawns an NPC with a semi-random delay.
         * @return {Promise<Npc>}
         */
        function spawnNpcWithDelay(ref) {
          return new Promise(resolve => {
            setTimeout(
              () => resolve(this.spawnNpc(state, ref)),
              Random.inRange(100, 10 * 1000)
            )
          });
        }

        const spawnAmbush = npcsToSpawn.map.bind(npcsToSpawn, spawnNpcWithDelay.bind(this));
        const npcs = Array.from({length: npcsToSpawn.length}, spawnAmbush);
        Logger.warn(`${player.name} caused ${npcs.length} NPCs to ambush: ${npcsToSpawn.join()}`);
      },
    }
  }
}
