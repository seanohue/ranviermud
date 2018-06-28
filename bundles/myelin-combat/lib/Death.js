module.exports = srcPath => ({
  calculateMemories(player) {
    const kills = player.getMeta('kills') || 0;
    const strongest = (player.getMeta('strongestKilled') || {level: 0}).level;
    return Math.floor(player.level / 5) +
           Math.round(kills / 50) +
           Math.round(strongest / 5);
  },

  hint() {
    const Random = require(srcPath + './RandomUtil');

    return Random.fromArray([
      "Fleeing is a valid tactic -- most enemies will not regenerate health.",
      "Use your 'skills' to survive, and learn new ones as you advance.",
      "Try to 'craft' some better equipment.",
      "Team up with a friend to take down tougher foes."
    ]);
  }
});