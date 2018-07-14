'use strict';

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    command: state => (args, player) => {
      B.sayAt(player, '<b>Resistances</b>');
      B.sayAt(player, B.line(40));

      const effects = player.effects.filterByType('resistance');
      if (!effects.length) {
        B.sayAt(player, 'None.');
        B.sayAt(player, B.line(40));
        return;
      }

      const totalRes = effects.reduce((acc, eff) => {
        const resist = eff.state.resistance;
        for (const stat in resist) {
          const val = resist[stat];
          if (!(stat in acc)) {
            acc[stat] = val;
            continue;
          }
          acc[stat] = acc[stat] + val;
        }
        return acc;
      }, {});

      const colors = {
        fire:       'red',
        electrical: 'yellow',
        freezing:   'cyan',
        drowning:   'blue',
        bleeding:   'magenta'
      };

      const statNameMap = {
        isPhysical:  'Physical',
        isPsionic:   'Psionic',
        isElemental: 'Elemental',
      };

      for (const [stat, resistance] of Object.entries(totalRes)) {
        const statName = statNameMap[stat] || stat;
        const color = colors[statName] || 'bold';
        B.sayAt(player, `${B.capitalize(statName)}: ${resistance}%`);
      }

      B.sayAt(player, B.line(40));
    }
  };
};