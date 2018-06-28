'use strict';

const sprintf = require('sprintf-js').sprintf;
const Combat = require('../../myelin-combat/lib/Combat');

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    aliases: [ 'stats', 'character' ],
    command : (state) => (args, p) => {
      const say = message => B.sayAt(p, message);
      const div = (header = '', color) => B.pipe(B.boxH(width, header, color));
      const centerBox = (width = 60, message = '', color) => B.pipe(B.center(width, message, color));
      const pipe = B.pipe();
      const width = 62;

      // top border
      say(`<b>${B.box('top', "[About You]", width)}</b>`);

      // "about you"
      const generalStats = `${p.name}, level ${p.level} ${p.getMeta('background') || 'person'}`;
      say(`<b>${centerBox(width, generalStats)}</b>`);
      say(B.pipe(' '.repeat(width)));

      // stat pools
      let stats = {
        might: 0,
        quickness: 0,
        intellect: 0,
        willpower: 0,

        armor: 0,
        critical: 0,

        health: 0,
        energy: 0,
        focus: 0,
      };

      Object.keys(stats).forEach(stat => {
        stats[stat] = {
          current: p.getAttribute(stat) || 0,
          base: p.getBaseAttribute(stat) || 0,
          max: p.getMaxAttribute(stat) || 0,
        };
      });

      // Print attributes with color-coded progress bar and labels.
      say(div('[Attributes]'));

      function compileStatString(isStart = false) {
        return (output, [label, _color], index, arr) => {
          const stat         = stats[label.trim().toLowerCase()];
          const percent      = Math.floor((stat.current / stat.max) * 100);
          const numericStat  = `${parseNumericStat(stat.current)}/${parseNumericStat(stat.max)}`;
          const numericLabel = `(${B.center(7, numericStat, _color)})`;
          const bar = stat.max === 0
            ? B.colorize('[        ]', _color)
            : B.progress(10, percent, _color, 'o', '-', '[]');
          let _width = width;
          if (!isStart) _width = (width / 2);
          const borderFn = isStart ? centerBox : (w, msg) => `${B.center(w, msg) + ' ' + pipe}`;
          const ending = index === arr.length - 1 ? '' : '\n';
          return output.concat(borderFn(_width, `${label}: ${bar} ${numericLabel}`) + ending);
        }
      }

      function parseNumericStat(statValue) {
        const parsed = String(Math.round(statValue));
        if (parsed.length === 4) {
          let [first] = parsed;
          return `${first}k`;
        } else if (parsed.length > 4) {
          return 'WOW';
        }

        return parsed;
      }

      const attributes = {
        '    Might': 'red',
        'Quickness': 'yellow',
        'Intellect': 'cyan',
        'Willpower': 'magenta'
      };
      const attributesBox = Object
        .entries(attributes)
        .reduce(compileStatString(true), '');

      const pools = {
        ' Health': 'red',
        '  Focus': 'blue',
        ' Energy': 'yellow',
        '  Armor': 'bold'
      };
      const poolsBox = Object
        .entries(pools)
        .reduce(compileStatString(), '');

      const poolLines = poolsBox.split('\n');
      const statsBoxes = attributesBox
        .split('\n')
        .reduce((output, line, index) => {
          const pool = poolLines[index];
          const ending = index === poolLines.length - 1 ? '' : '\n';
          return output + line + pool + ending;
        }, '');

      say(statsBoxes);

      // Primary & secondary wielded.
      const primaryWeapon = p.equipment.get('wield') || {};
      const weaponDamage = Combat.getWeaponDamage(p);
      const min = Combat.normalizeWeaponDamage(p, weaponDamage.min);
      const max = Combat.normalizeWeaponDamage(p, weaponDamage.max);

      const speed = Combat.getWeaponSpeed(p);
      say(div('[Armaments]'));
      say(centerBox(width, `Primary: ${primaryWeapon.name || 'Unarmed'}`));
      
      const [whole, decimals] = String(speed).split('.');
      const speedLabel = whole + (decimals && decimals[0] !== '0' ? '.' + decimals[0] : '');
      say(centerBox(width, `Damage: ${min + ' - ' + max}  Speed: ${speedLabel} sec. per attack`));

      //TODO: Secondary arms, if it exists, once implemented.
      //TODO: Wounds/disease state?
      //TODO: Crit chance, modified by weapon.
      //TODO: Currencies/resources.

      say(B.box('bottom', p.name || '', width));

      state.CommandManager.get('currency').execute('', p);
      say('');
      state.CommandManager.get('resources').execute('', p);
    }
  };
};
