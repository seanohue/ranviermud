'use strict';

/**
 * Account character selection event
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Data = require(srcPath + 'Data');
  const humanizeDuration = require('humanize-duration');

  return {
    event: state => (socket, args) => {
      let { name } = args;
      const say = EventUtil.genSay(socket);

      // Get pfile of deceased to show stats.
      const deceased = Data.load('player', name);
      const attrs = deceased.attributes;
      const { killedOn, killedBy } = deceased.metadata;
      const timeSinceDeath = killedOn ?
        humanizeDuration(Date.now() - killedOn, { largest: 2, round: true }) :
        'a long time';

      const killerName = killedBy === name ? 'a lethal condition' : killedBy;

      // Display relevant stats and info re: death.
      say("\r\n------------------------------");
      say("|      " + name);
      say("------------------------------");
      say(`| Level: ${deceased.level}`);
      say(`| Willpower: ${attrs.willpower.base}`);
      say(`| Intellect: ${attrs.intellect.base}`);
      say(`| Quickness: ${attrs.quickness.base}`);
      say(`| Might: ${attrs.might.base}`);
      say("------------------------------");
      say(`Killed by ${killerName || "something unknown"}.`);
      say(`Died ${timeSinceDeath} ago.`);
      say("Press enter to pay respects.");

      socket.once('data', _ => {
        return socket.emit('choose-character', socket, args);
      });
    }
  };
};
