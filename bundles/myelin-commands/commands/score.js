'use strict';

const sprintf = require('sprintf-js').sprintf;
const Combat = require('../../ranvier-combat/lib/Combat');

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    aliases: [ 'stats' ],
    command : (state) => (args, p) => {

      //TODO: Redo to make it less inscrutable.
      const say = message => B.sayAt(p, message);

      say('<b>' + B.center(60, `${p.name}, level ${p.level} ${p.playerClass.config.name || 'person'}`, 'green'));
      say('<b>' + B.line(60, '-', 'green'));

      let stats = {
        might: 0,
        quickness: 0,
        intellect: 0,
        willpower: 0,
        armor: 0,
        health: 0,
        energy: 0,
        focus: 0,
        critical: 0,
      };

      for (const stat in stats) {
        stats[stat] = {
          current: p.getAttribute(stat) || 0,
          base: p.getBaseAttribute(stat) || 0,
          max: p.getMaxAttribute(stat) || 0,
        };
      }

      function printStat(stat, newline = true) {
        const val = stats[stat];
        const statColor = (val.current > val.base ? 'green' : 'white');
        const str = sprintf(
          `| %-9s : <b><${statColor}>%8s</${statColor}></b> |`,
          stat[0].toUpperCase() + stat.slice(1),
          val.current
        );

        if (newline) {
          say(str);
        } else {
          B.at(p, str);
        }
      };

      B.at(p, sprintf(' %-9s: %12s', 'Health', `${stats.health.current}/${stats.health.max}`));
      B.at(p, sprintf(' %-9s: %12s', 'Energy', `${stats.energy.current}/${stats.energy.max}`));
      B.at(p, sprintf(' %-9s: %12s', 'Focus', `${stats.focus.current}/${stats.focus.max}`));

      say('<b><green>' + sprintf(
        '%36s',
        'Weapon '
      ));

      say(sprintf('%35s', '.' + B.line(22)) + '.');

      B.at(p, sprintf('%37s', '|'));
      const weaponDamage = Combat.getWeaponDamage(p);
      const min = Combat.normalizeWeaponDamage(p, weaponDamage.min);
      const max = Combat.normalizeWeaponDamage(p, weaponDamage.max);
      say(sprintf(' %6s:<b>%5s</b> - <b>%-5s</b> |', 'Damage', min, max));
      B.at(p, sprintf('%37s', '|'));
      say(sprintf(' %6s: <b>%12s</b> |', 'Speed', B.center(12, Combat.getWeaponSpeed(p) + ' sec')));

      say(sprintf('%60s', "'" + B.line(22) + "'"));

      say('<b><green>' + sprintf(
        '%-24s',
        ' Stats'
      ) + '</green></b>');
      say('.' + B.line(22) + '.');

      printStat('might', false); // left
      say('<b><green>' + sprintf('%36s', 'Gold ')); // right
      printStat('quickness', false); // left
      say(sprintf('%36s', '.' + B.line(12) + '.')); // right
      printStat('intellect', false); // left
      say(sprintf('%22s| <b>%10s</b> |', '', p.getMeta('currencies.gold') || 0)); // right
      printStat('willpower', false); // left
      say(sprintf('%36s', "'" + B.line(12) + "'")); // right

      say(':' + B.line(22) + ':');
      printStat('armor');
      printStat('critical');
      say("'" + B.line(22) + "'");
    }
  };
};
