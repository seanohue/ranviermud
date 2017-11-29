module.exports = srcPath => ({
  calculateMemories(player) {
    const kills = player.getMeta('kills') || 0;
    const strongest = (player.getMeta('strongestKilled') || {level: 0}).level;
    return Math.floor(player.level / 5) +
           Math.round(kills / 50) +
           Math.round(strongest / 5);
  },

  message() {
    const Random = require(srcPath + './RandomUtil');

    return Random.fromArray([
      "You feel your soul rising from your body, to be spun into the ether once again",
      "All thought ceases as life frees from your body.",
      "You collapse in an unmoving heap.",
      "One last blinding flash of pain and it is over."
    ]);
  }
});