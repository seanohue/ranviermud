'use strict';

const sprintf = require('sprintf-js').sprintf;
const Combat = require('../../myelin-combat/lib/Combat');
const ItemUtil = require('../../myelin-lib/lib/ItemUtil');

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return {
    aliases: [ 'stats', 'character', 'status' ],
    command : (state) => (args, p) => {
      const say = message => B.sayAt(p, message);
      const width = 20;
      // top border
      say(`<b>${B.box('top', "[About You]", width)}</b>`);

      // "about you"
      const generalStats = `level ${p.level} ${p.getMeta('background') || 'person'}`;
      say(`<b>${B.center(width, p.name)}`);
      say(`<b>${B.center(width, generalStats)}</b>`);
      say(`<b>${B.box('bottom', '[Pools]', width)}`)

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
          current: p.getAttribute(stat)  || 0,
          base: p.getBaseAttribute(stat) || 0,
          max: p.getMaxAttribute(stat)   || 0,
        };
      });

      const pools = {
        'health': {label: ' Health', color: 'red'},
        'focus':  {label: '  Focus', color: 'blue'},
        'energy': {label: ' Energy', color: 'yellow'},
      };

      // Print attributes with color-coded progress bar and labels.

      for (const [key, meta] of Object.entries(pools)) {
        const {label, color} = meta;
        const stat = stats[key];
        const percent  = (Math.floor(stat.current / stat.max) * 100) || 0;
        const progress = stat.max === 0 ? `[      ]` : B.progress(8, percent, color, 'o', '', '[]');
        const statLine = `${label}: ${progress} ${parseNumericStat(stat.current)}/${parseNumericStat(stat.max)}`;
        say(statLine);
      }


      say(`<b>${B.box('bottom', '[Attributes]', width)}`)

      const attributes = {
        'might': {label: '    Might', color: 'red'},
        'quickness': {label: 'Quickness', color: 'yellow'},
        'intellect': {label: 'Intellect', color: 'cyan'},
        'willpower': {label: 'Willpower', color: 'magenta'},
        'critical': {label: ' Critical', color: 'bold'},
        'armor': {label: '    Armor', color: 'bold'},
      };

      // Parse and find longest length of stat for spacing reasons.
      let longest = 1;
      for (const [key, stat] of Object.entries(stats)) {
        if (key in attributes) {
          stat.max = parseNumericStat(stat.max);
          if (stat.max.length > longest) longest = stat.max.length;
        }
      }

      for (const [key, meta] of Object.entries(attributes)) {
        const {label, color} = meta;
        const stat = stats[key];
        const difference = stat.max - stat.base || 0;
        let diffLabel = `[${difference >= 0 ? '+' + String(difference) : difference}]`;
        const lengthDiff = longest - stat.max.length;
        if (lengthDiff > 0) {
          diffLabel = ' '.repeat(lengthDiff) + diffLabel;
        }

        const attrValue = `${stat.max} ${B.colorize(diffLabel, 'bold')}`;
        const statLine = `${label}: ${B.colorize(attrValue, color)}`;
        say(statLine);
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


      // Primary & secondary wielded.
      const primaryWeapon = p.equipment.get('wield') || {};
      const weaponDamage = Combat.getWeaponDamage(p);
      const {min = 1, max = 1} = weaponDamage;

      const speed = Combat.getWeaponSpeed(p);
      const weaponName = primaryWeapon.name ? 
        ItemUtil.qualityColorize(primaryWeapon, B.center(width, primaryWeapon.name)) : 
        B.center(width, 'Unarmed');

      say(B.box('bottom', '[Armaments]', width, 'bold'));
      say(weaponName);
      
      const [whole, decimals] = String(speed).split('.');
      const speedLabel = whole + (decimals && decimals[0] !== '0' ? '.' + decimals[0] : '');
      say(B.center(width, `Damage: ${min + ' - ' + max}`)); 
      say(B.center(width, `Speed: ${speedLabel} sec.`));

      say(B.colorize(B.box('bottom', p.name || '', width), 'bold'));
    }
  };
};
