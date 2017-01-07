'use strict';

const util = require('util');

exports.command = (rooms, items, players, npcs, Commands) =>
  (args, player) => {
    const attrs = player.getAttributes();
    player.say("<red>ADMIN: Debug Character</red>");

    player.warn('ATTRIBUTES: ');
    for (let attr in attrs) {
      player.say(attr + ': ' + attrs[attr]);
    }

    player.warn('EFFECTS: ');
    const effects = player.getEffects();
    for (let [id, effect] of effects) {
      player.say(`${id}: `);
      player.say(`duration: ${effect.getDuration()}`);
      player.say(`elapsed:  ${effect.getElapsed()}`);
      player.say(`aura:     ${effect.getAura()}`);
    }

    player.warn('MODIFIERS: ');
    ['speedMods', 'dodgeMods', 'damageMods', 'toHitMods'].forEach(mod => {
      if (!Object.keys(mod).length) { return; };
      player.warn(mod);
      for (let modId in player[mod]) {
        player.say(modId + ': ' + player[mod][modId]);
      }
    });
  };