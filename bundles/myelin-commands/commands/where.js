'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return {
    usage: 'where', 
    aliases: ['area', 'location', 'gps'],
    command: (state) => (args, player) => {
      const room     = player.room;
      const area     = (room && room.area && room.area.title) || 'The Void';
      const roomName = (room && room.title) || 'Unknown';
      
      Broadcast.sayAt(player, `${area} - ${roomName}`);
    }
  };
};
