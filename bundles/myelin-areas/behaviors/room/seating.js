'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');

  /*
  example config:
    seating:
      seatingRef: 'spire.intro:bench'
      sitMessage: 'You sit on the slate bench.'
      sitObserverMessage: 'sits on the slate bench.'
      standMessage: 'You stand up from the slate bench.'
      standObserverMessage: 'stands up from the slate bench.'
      observerMessage: 'is sitting on the bench.'
  */

  return {
    listeners: {
      command: state => function(config, player, commandName, args) {
        if (!this.__seating) {
          this.__seating = new Map();
        }
    console.log('ayyyyy');
        switch(commandName) {
          case 'sit':
            return sit.call(this, player, args, config);
          case 'stand':
            return stand.call(this, player, args, config);
          default:
            Broadcast.sayAt(player, 'Huh?');
            throw new ReferenceError(`Invalid room command: ${commandName}`);
        }
      },

      playerLeave: state => autoStand,
      playerQuit: state => autoStand

    }
  };

  function sit(player, args, config) {
    if (this.__seating.has(player)) {
      return Broadcast.sayAt(player, 'You are already seated.');
    }

    const lookListener = _lookListener.bind(player, config);
    this.__seating.set(player, lookListener);
    player.on('look', lookListener);

    const seatingRef = config.seatingRef;
    const seat = [...this.items].find(item => item.entityReference === seatingRef);
    seat.on('look', lookListener);

    const sitMessage = config.sitMessage || 'You sit down.';
    Broadcast.sayAt(player, sitMessage);

    const sitObserverMessage = config.sitObserverMessage || 'sits down.';
    if (this.players.size > 1) {
      Broadcast.sayAtExcept(this, `${player.name} ${sitObserverMessage}`, player);
    }
  }

  function autoStand(config, player, args) {
    return stand.call(this, player, args, config, true);
  }

  function stand(player, args, config, isAutomatic) {
    if (!this.__seating.has(player)) {
      if (isAutomatic) { return; } // Avoid confusing broadcast.
      return Broadcast.sayAt(player, 'You are already standing.');
    }

    const lookListener = this.__seating.get(player);
    this.__seating.delete(player);

    player.removeListener('look', lookListener);

    const seatingRef = config.seatingRef;
    const seat = [...this.items].find(item => item.entityReference === seatingRef);
    seat.removeListener('look', lookListener);

    const standMessage = config.standMessage || 'You stand up.';
    Broadcast.sayAt(player, standMessage);

    const standObserverMessage = config.standObserverMessage || 'rises from their seat.';
    if (this.players.size > 1) {
      Broadcast.sayAtExcept(this, `${player.name} ${standObserverMessage}`, player);
    }
  }

  function _lookListener(config, observer) {
    const message = config.observerMessage || 'is sitting here.';
    Broadcast.sayAt(observer, `<b>${this.name} ${message}</b>`);
  }
};