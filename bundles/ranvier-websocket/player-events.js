'use strict';

module.exports = (srcPath) => {
  return  {
    listeners: {
      attributeUpdate: state => function () {
        updateAttributes.call(this);
      },

      login: state => function () {
        this.socket.command('sendData', 'quests', this.questTracker.serialize().active);

        const effects = this.effects.entries().filter(effect => !effect.config.hidden).map(effect => effect.serialize());
        this.socket.command('sendData', 'effects', effects);

        updateAttributes.call(this);
      },

      combatantAdded: state => function () {
        updateTargets.call(this);
      },

      combatantRemoved: state => function () {
        updateTargets.call(this);
      },

      updateTick: state => function () {
        const effectsMap = this.effects
          .entries()
          .filter(effect => !effect.config.hidden);

        if (effectsMap.size) {
          const effects = effectsMap
            .map(effect => ({
              name: effect.name,
              elapsed: effect.elapsed,
              remaining: effect.remaining,
              config: {
                duration: effect.config.duration
              }
          }));
          this.socket.command('sendData', 'effects', effects);
        }

        if (!this.isInCombat()) {
          return;
        }

        updateTargets.call(this);
      },

      effectRemoved: state => function () {
        if (!this.effects.size) {
          this.socket.command('sendData', 'effects', []);
        }
      },

      questProgress: state => function () {
        this.socket.command('sendData', 'quests', this.questTracker.serialize().active);
      },
    }
  };
};

function updateAttributes() {
  // example of sending player data to a websocket client. This data is not sent to the default telnet socket
  let attributes = {};
  for (const [name, attribute] of this.attributes) {
    const attrData = {
      current: this.getAttribute(name),
      max: this.getMaxAttribute(name),
    };

    const type = ['health', 'energy', 'focus'].includes(name) ? 'pool' : 'stat';
    attrData.type = type;
    if (type === 'stat') {
      attrData.base = this.getBaseAttribute(name);
    }
    attributes[name] = attrData;
  }

  this.socket.command('sendData', 'attributes', attributes);
}

function updateTargets() {
  this.socket.command('sendData', 'targets', [...this.combatants].map(target => ({
    name: target.name,
    health: {
      current: target.getAttribute('health'),
      max: target.getMaxAttribute('health'),
    },
  })));
}
