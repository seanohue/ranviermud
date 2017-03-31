'use strict';

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');
  const SkillFlag = require(srcPath + 'SkillFlag');

  return {
    aliases: [ "ability", "feat" ],
    command : state => (args, player) => {
      const say = (message, wrapWidth) => B.sayAt(player, message, wrapWidth);

      if (!args.length) {
        return say("What ability do you want to look up? Use 'skills' to view all skills/abilities.");
      }

      const [first, ... rest] = args.split(' ');
      if (first === 'buy' || first === 'learn') {
        return state.CommandManager.get('manifest').execute(rest.join(' '), player);
      }

      if (first === 'list') {
        return state.CommandManager.get('skills').execute(null, player);
      }

      let skill = state.SkillManager.find(args, true);

      if (!skill) {
        return say("No such skill.");
      }

      say('<b>' + B.center(80, skill.name, 'white', '-') + '</b>');
      if (skill.flags.includes(SkillFlag.PASSIVE)) {
        say('<b>Passive</b>');
      } else {
        say(`<b>Usage</b>: ${skill.id}`);
      }

      if (skill.resource.cost) {
        say(`<b>Cost</b>: <b>${skill.resource.cost}</b> ${skill.resource.attribute}`);
      }

      if (skill.cooldownLength) {
        say(`<b>Cooldown</b>: <b>${skill.cooldownLength}</b> seconds`);
      }
      say(skill.info(player), 80);
      say('<b>' + B.line(80) + '</b>');
    }
  };
};


