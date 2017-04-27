module.exports = function calculateKarma(player) {
  const levelKarma = Math.floor(player.level / 3);
  const killsKarma = Math.floor(player.getMeta('kills') / 50);
  const strongestDefeated = player.getMeta('strongestDefeated');
  const strongestDefeatedKarma = strongestDefeated ?
    Math.floor(strongestDefeated.level / 8) : 0;

  //TODO: Something about quests too.
  return (levelKarma + killsKarma + strongestDefeatedKarma) || 0;
}