'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');
  const benchSeating = new Map();

  return {
    listeners: {
      command: state => function(player, commandName, args) {
        switch(commandName) {
          case 'sit':
            return sit.call(this, player, args);
          case 'stand':
            return stand.call(this, player, args);
          default:
            Broadcast.sayAt(player, 'Huh?');
            throw new ReferenceError(`Invalid room command: ${commandName}`);
        }
      },

      playerLeave: state => stand,
      playerQuit: state => stand

    }
  };

  function sit(player, args) {
    if (benchSeating.has(player)) {
      return Broadcast.sayAt(player, 'You are already seated.');
    }

    const lookListener = _lookListener.bind(this, player);
    benchSeating.set(player, lookListener);
    player.on('look', lookListener);

    const benchRef = 'spire.intro:21';
    const bench = [...this.items].find(item => item.entityRef === benchRef);
    bench.on('look', lookListener);

    Broadcast.sayAt(player, 'You sit on the bench.');
    if (this.players.size > 1) {
      Broadcast.sayAtExcept(this, `${player.name} sits on the bench.`, player);
    }
  }

  function stand(player, args) {
    if (!benchSeating.has(player)) {
      return Broadcast.sayAt(player, 'You are already standing.');
    }

    const lookListener = benchSeating.get(player);
    benchSeating.delete(player);

    player.removeListener('look', lookListener);

    const benchRef = 'spire.intro:21';
    const bench = [...this.items].find(item => item.entityRef === benchRef);
    bench.removeListener('look', lookListener);

    Broadcast.sayAt(player, 'You stand up.');
    if (this.players.size > 1) {
      Broadcast.sayAtExcept(this, `${player.name} rises from the bench.`, player);
    }
  }

  function _lookListener(player) {
    return `${player.name} is sitting on the slate bench.`;
  }

};