'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');
  let lastEventEmitted = Date.now() - (60 * 1000);
  return {
    listeners: {
      updateTick: state => function () {
        if (!this.players.size) {
          return;
        }

        const cooldown = 60 * 1000;
        const pastCooldown = (Date.now() - lastEventEmitted) > cooldown;
        if (pastCooldown && Random.probability(1)) {
          const flavorEvents = [
            'You hear a soft, high whistling coming from the pipes overhead.',
            'A wooshing sound can be heard from the chamber nearby.',
            'You hear a scurrying noise coming from an indeterminate distance away.',
            'A sound like distance thunder echoes from afar.',
            'Bubbles form behind the glass of one of the cylinders.'
          ];
          Broadcast.sayAt(this, `<white>${Random.fromArray(flavorEvents)}</white>`);
          lastEventEmitted = Date.now();
        }
      }
    }
  };
};