module.exports = srcPath => ({
  calculateMemories(player) {
    const kills = player.getMeta('kills') || 0;
    const visitedAreas = player.getMeta('visitedAreas') || [];
    const strongest = (player.getMeta('strongestKilled') || {level: 0}).level;
    return Math.floor(player.level / 5) +
           Math.round(kills / 50) +
           Math.round(strongest / 5) + 
           visitedAreas.length || 0;
  },

  hint() {
    const Random = require(srcPath + './RandomUtil');

    return Random.fromArray([
      "<b>Flee</b>ing is a valid tactic -- most enemies will not regenerate quickly.",
      "Use your <b>'skills'</b> to survive, and learn new ones as you advance.",
      "Try to <b>'craft'</b> some better equipment.",
      "Team up with a friend (or an NPC, or yourself...) using <b>'party'</b> to take down tougher foes.",
      "You can play as up to three characters at the same time. Try making your own <b>party</b>."
    ]);
  }
});