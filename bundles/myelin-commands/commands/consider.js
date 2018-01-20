'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Parser = require(srcPath + 'CommandParser').CommandParser;

  return {
    usage: 'consider <character name>',
    command: state => (args, player) => {
      if (!args) {
        return Broadcast.sayAt(player, '<b><yellow>Who would you like to consider?</yellow></b>');
      }
      if (!player.room) {
        return Broadcast.sayAt(player, '<b><yellow>You are in a hollow void, with nothing and no one to consider.</yellow></b>');
      }

      const npc = Parser.parseDot(args, player.room.npcs);
      if (!npc) {
        return Broadcast.sayAt(player, "You don't see them here.");
      }

      const playerStats = getParseableAttrs(player);
      const npcStats = getParseableAttrs(npc);

      console.log({playerStats, npcStats});

      const comparators = {
        might: ['stronger', 'weaker'],
        quickness: ['faster', 'slower'],
        intellect: ['more alert', 'less alert'],
        willpower: ['more disciplined', 'lazier'],

        armor: ['more protected', 'less protected'],

        health: ['healthier', 'weaker'],
        focus: ['more concentrated', 'more aimless']
      };

      const considerLines = playerStats.reduce((lines, playerStat) => {
        const {stat} = playerStat;
        const npcStat = npcStats.find(obj => obj.stat === stat);

        if (!npcStat) return lines;
        if (!(stat in comparators)) return lines;

        const [more, less] = comparators[stat];
        const npcIsBetter  = npcStat.current >= playerStat.current;
        const comparator   = npcIsBetter ? more : less;
        const line = `They seem ${comparator} than you in terms of ${stat}.`;
        console.log(line);
        return lines.concat(line);
      }, []);

      Broadcast.sayAt(player, considerLines.join('\n'));
    }
  };
};

//TODO: Optimize, extract for use w/ score command as well.
function getParseableAttrs(char) {
  const stats = {
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
  return Object.keys(stats)
    .map(stat => {
      return {
        stat,
        current: char.getAttribute(stat) || 0,
        base: char.getBaseAttribute(stat) || 0,
        max: char.getMaxAttribute(stat) || 0,
      };
    });
}