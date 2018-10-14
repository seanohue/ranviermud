'use strict';

module.exports = (srcPath) => {
  return  {
    listeners: {
      attributeUpdate: state => function () {
        updateAttributes.call(this);
      },

      spawn: state => function () {
        this._updated = 0;
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
        this._updated++;
        if (this._updated % 20 === 0) {
          const effectsMap = Array.from(this.effects.entries())
            .filter(effect => !effect.config.hidden);
          if (effectsMap.length) {
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
          this._updated = 0;
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
  const attributes = {};
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
