'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const pvpWait = 60 * 1000;

  return {
    command : (state) => (args, player) => {
      const sinceLastChange = isNaN(player._lastChangedPvP) ? pvpWait + 1 : Date.now() - player._lastChangedPvP;
      if (sinceLastChange <= pvpWait) {
        return Broadcast.sayAt(player, 'You must wait one minute between changing your PvP status.');
      }

      const previousPvpSetting = player.getMeta('pvp') || false;
      const newPvpSetting = !previousPvpSetting;
      player.setMeta('pvp', newPvpSetting);

      player._lastChangedPvP = Date.now();

      const message = newPvpSetting ?
        'You are now able to enter into player-on-player duels.' :
        'You are now a pacifist and cannot enter player-on-player duels.';
      Broadcast.sayAt(player, message);

      if (player.room.area.info.pvp === 'safe') {
        return Broadcast.sayAt(player, '<green><b>Note: You are in a SAFE zone. No PvP allowed in this area.</green>');
      }

      if (player.room.area.info.pvp === 'enforced') {
        return Broadcast.sayAt(player, '<red><b>Note: You are in a DANGER zone. All PvP is allowed in this area.</red>');
      }

      Broadcast.sayAt(player, '<b>Note:</b> You are in a PvP-optional area. You can opt-in or opt-out of PvP duels here.');
    }
  };
};
