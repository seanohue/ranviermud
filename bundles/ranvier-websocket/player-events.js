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

        updateEffects.call(this);
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
          updateEffects.call(this);
          this._updated = 0;
        }

        if (!this.isInCombat()) {
          return;
        }

        updateTargets.call(this);
      },

      effectAdded: state => function (eff) {
        if (eff.config.hidden) return;
        updateEffects.call(this);
      },

      effectRemoved: state => function () {
        if (!this.effects.size) {
          this.socket.command('sendData', 'effects', []);
        }
        updateEffects.call(this);
      },

      questProgress: state => function () {
        this.socket.command('sendData', 'quests', this.questTracker.serialize().active);
      },
    }
  };
};

function updateEffects() {
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
}

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
