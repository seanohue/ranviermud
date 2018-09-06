'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const PlayerRoles = require(srcPath + 'PlayerRoles');
  return {
    usage: 'where', 
    aliases: ['area', 'location', 'gps'],
    command: (state) => (args, player) => {
      const room     = player.room;
      const area     = (room && room.area && room.area.title) || 'The Void';
      const roomName = (room && room.title) || 'Unknown';
      const levelRange = room.area.getLevelRange();
      const pvpTag     = room.area.getPvpTag();
      
      Broadcast.sayAt(player, `${area} - ${roomName}`);
      Broadcast.sayAt(player, `Levels ${levelRange} ${pvpTag}`);
      if (player.role > PlayerRoles.PLAYER) {
        Broadcast.sayAt(player, `Ref: ${room.entityReference}`);
      }
    }
  };
};
