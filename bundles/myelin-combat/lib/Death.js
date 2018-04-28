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
      "You feel your soul unwinding like thread from your body, to be spun into the ether once again",
      "All thought ceases as life flees from your body.",
      "You collapse in an unmoving heap.",
      "You feel the last of your essence slipping from this mortal husk.",
      "One last blinding flash of pain consumes you and it is all over."
    ]);
  }
});