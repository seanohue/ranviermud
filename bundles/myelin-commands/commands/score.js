'use strict';

const sprintf = require('sprintf-js').sprintf;
const Combat = require('../../myelin-combat/lib/Combat');

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    aliases: [ 'stats' ],
    command : (state) => (args, p) => {

      //TODO: Redo to make it less inscrutable. (WIP)
      // [√] Add Broadcast method 'corner' that outputs the corner to a box
      // [√] Something like `Broadcast.corner('top-left') ==> '╔'`
      // [√] Compose Broadcast methods to do things like "`Broadcast.box('top', 3)`"
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
        console.log(stats[stat]);
      });

      // Print attributes with color-coded progress bar and labels.
      say(div('[Attributes]'));

      function compileStatString(isStart = false) {
        return (output, [label, _color]) => {
          const stat         = stats[label.trim().toLowerCase()];
          const percent      = Math.floor((stat.current / stat.max) * 100);
          const numericStat  = `${Math.round(stat.current)}/${Math.round(stat.max)}`;
          const numericLabel = `(${B.center(7, numericStat, _color)})`;
          const bar = stat.max === 0
            ? B.colorize('[        ]', _color)
            : B.progress(10, percent, _color, 'o', '-', '[]');
          let _width = width;
          if (!isStart) _width = width / 2;
          const borderFn = isStart ? centerBox : (w, msg) => `${B.center(w, msg) + ' ' + pipe}`;
            //fixme: rm last /n
          return output.concat(borderFn(_width, `${label}: ${bar} ${numericLabel}`) + '\n');
        }
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
          return output + line + pool + '\n';
        }, '');

      say(statsBoxes);

      // Primary & secondary wielded.
      const primaryWeapon = p.equipment.get('wield') || {};
      const weaponDamage = Combat.getWeaponDamage(p);
      const min = Combat.normalizeWeaponDamage(p, weaponDamage.min);
      const max = Combat.normalizeWeaponDamage(p, weaponDamage.max);
      const speed = Combat.getWeaponSpeed(p) + ' sec';
      say(div('[Armaments]'));
      say(centerBox(width, `Primary: ${primaryWeapon.name || 'Unarmed'}`));
      say(centerBox(width, `Damage: ${min + ' - ' + max}  Speed: ${speed}`));

      //TODO: Secondary, if it exists, once implemented.
      //TODO: Crit chance, modified by weapon.
      //TODO: Currencies/resources.
      // ideation: 4-6 resources that have to be scavenged from items or creatures:
      // - alloy (e.g, crafting metal items, high mid-value)
      // - viscera (e.g., crafting biomechanical items, some psionic stuff, extra low-value except to a few)
      // - composite (e.g., wood, plastic, glass crafting, low mid-value)
      // - fuel - (e.g., crafting anything requiring fuel of literally any sort, food, high value)
      // - fabric - (crafting clothing/shelter, patching armor, low mid-value)
      // - aethereum - (psionic crafting, high value)
      // maybe -- consider flora/fauna instead of viscera, remove fuel and have fuels be one of flora,fauna,aethereum

      say(B.box('bottom', p.name || '', width));
    }
  };
};
