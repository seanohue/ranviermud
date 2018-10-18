'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'config <set/list> [setting] [value]',
    aliases: ['toggle', 'options', 'set'],
    command: (state) => (args, player) => {
      if (!player.getMeta('config')) {
        player.setMeta('config', {});
      }

      if (!args.length) {
        Broadcast.sayAt(player, 'Configure what?');
        return state.CommandManager.get('help').execute('config', player);
      }

      const possibleCommands = ['set', 'list'];

      const [ command, configToSet, valueToSet ] = args.split(' ');

      if (!possibleCommands.includes(command)) {
        Broadcast.sayAt(player, `<red>Invalid config command: ${command}</red>`);
        return state.CommandManager.get('help').execute('config', player);
      }

      if (command === 'list') {
        return listCurrentConfiguration();
      }

      if (!configToSet) {
        Broadcast.sayAt(player, 'Set what?');
        return state.CommandManager.get('help').execute('config', player);
      }

      const possibleSettings = [
        'autoprompt',
        'brief',
        'autoloot',
        'autoscan',
        'minimap',
        'combatbars',
        'termwidth'
      ];

      if (!possibleSettings.includes(configToSet)) {
        Broadcast.sayAt(player, `<red>Invalid setting: ${configToSet}. Possible settings: ${possibleSettings.join(', ')}`);
        return state.CommandManager.get('help').execute('config', player);
      }

      if (configToSet === 'termwidth') {
        const termwidth = Number(valueToSet);
        if (isNaN(termwidth) || termwidth < 20 || termwidth > 80) {
          Broadcast.sayAt(player, '<b><red>Invalid termwidth.</red> Must be a number between 20 and 80</b>');
          return state.CommandManager.get('help').execute('config', player);
        }
        const old = player.getMeta('config.termwidth');
        player.setMeta('config.termwidth', termwidth);
        return Broadcast.sayAt(player, `Termwidth changed from ${old || 'default'} to ${termwidth} characters.`);
      }

      if (!valueToSet) {
        Broadcast.sayAt(player, `<red>What value do you want to set for ${configToSet}?</red>`);
        return state.CommandManager.get('help').execute('config', player);
      }

      const possibleValues = {
        on: true,
        off: false
      };

      if (possibleValues[valueToSet] === undefined) {
        return Broadcast.sayAt(player, `<red>Value must be either: on / off</red>`);
      }

      player.setMeta(`config.${configToSet}`, possibleValues[valueToSet]);

      Broadcast.sayAt(player, 'Configuration value saved');

      function listCurrentConfiguration() {
        Broadcast.sayAt(player, 'Current Settings:');
        for (const key in player.metadata.config) {
          let val = '???';
          if (key === 'termwidth') {
            val = Number(player.metadata.config[key]) || 'default';
          } else {
            val = player.metadata.config[key] ? 'on' : 'off';
          }
          Broadcast.sayAt(player, `  ${key}: ${val}`);
        }
      }
    }
  };
};

