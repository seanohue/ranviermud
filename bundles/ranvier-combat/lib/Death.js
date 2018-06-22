module.exports = srcPath => ({
  calculateMemories(player) {
    return Math.floor(player.level / 5); // Basic implementation
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