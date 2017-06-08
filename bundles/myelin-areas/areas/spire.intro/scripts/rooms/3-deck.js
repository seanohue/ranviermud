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
      playerQuit: state => function removeWhileQuitting(player, args) {
        return stand(player, args, true);
      }

    }
  };

  function sit(player, args) {
    if (benchSeating.has(player)) {
      return Broadcast.sayAt(player, 'You are already seated.');
    }

    const lookListener = _lookListener.bind(player);
    benchSeating.set(player, lookListener);
    player.on('look', lookListener);

    const benchRef = 'spire.intro:21';
    const bench = [...this.items].find(item => item.entityReference === benchRef);
    bench.on('look', lookListener);

    Broadcast.sayAt(player, 'You sit on the bench.');
    if (this.players.size > 1) {
      Broadcast.sayAtExcept(this, `${player.name} sits on the bench.`, player);
    }
  }

  function stand(player, args, isQuitting) {
    if (!benchSeating.has(player)) {
      if (isQuitting) { return; } // Avoid confusing broadcast.
      return Broadcast.sayAt(player, 'You are already standing.');
    }

    const lookListener = benchSeating.get(player);
    benchSeating.delete(player);

    player.removeListener('look', lookListener);

    const benchRef = 'spire.intro:21';
    const bench = [...this.items].find(item => item.entityReference === benchRef);
    bench.removeListener('look', lookListener);

    Broadcast.sayAt(player, 'You stand up.');
    if (this.players.size > 1) {
      Broadcast.sayAtExcept(this, `${player.name} rises from the bench.`, player);
    }
  }

  function _lookListener(observer) {
    Broadcast.sayAt(observer, `<b>${this.name} is sitting on the slate bench.</b>`);
  }

};