module.exports = srcPath => ({
  calculateMemories(player) {
    return Math.floor(player.level / 5); // Basic implementation
  },

  message() {
    const Random = require(srcPath + './RandomUtil');

    return Random.fromArray([
      "Ripozu en Paco.",
      "You Died.",
      "Keep Trying.",
      "Death is not The End."
    ]);
  }
});