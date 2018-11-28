'use strict';
const humanize = (sec) => { return require('humanize-duration')(sec, { round: true }); };

module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    aliases: [ "affects" ],
    command: (state) => (args, player) => {
      B.sayAt(player, "Current Effects:");

      const effects = player.effects
        .entries()
        .filter(effect => !effect.config.hidden);

      if (!effects.length) {
        return B.sayAt(player, "  None.");
      }

      for (const effect of effects) {
        let color = 'white';
        if (effect.flags.includes(Flag.BUFF)) {
          color = 'green';
        } else if (effect.flags.includes(Flag.DEBUFF)) {
          color = 'red';
        }
        B.at(player, `<bold><${color}>  ${effect.name}</${color}></bold>`);
        if (effect.config.maxStacks) {
          B.at(player, ` (${effect.state.stacks || 1})`);
        }

        const duration = effect.duration === Infinity ? 'Permanent' : `${humanize(effect.remaining)} remaining`;
        B.at(player, `: ${duration}`);

        B.sayAt(player, "\n\t" + effect.description);
      }
    }
  };
};
