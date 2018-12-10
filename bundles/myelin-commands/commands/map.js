module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');

  return {
    usage: 'map',
    command: state => (args, player) => {
      const room = player.room;
      if (!room || !room.coordinates) {
        return B.sayAt(player, "You can't see your surroundings in this room.");
      }

      let size = Math.min(
        Math.max(
          3, 
          Math.ceil(player.getMaxAttribute('intellect') / 5)
        ),
        8
      );

      // always make size an even number so the player is centered
      size = isNaN(size) ? 4 : size - (size % 2);
      // monospace fonts, eh?
      let xSize = Math.ceil(size * 2);
      xSize = Math.max(2, xSize - (xSize % 2));

      if (!size || size > 14) {
        size = 1;
      }

      const coords = room.coordinates;
      let map = '.' + ('-'.repeat(xSize * 2 + 1)) + '.\r\n';
      let mapData = []; // To send via socket
      for (var y = coords.y + size; y >= coords.y - size; y--) {
        map += '|';
        for (var x = coords.x - xSize; x <= coords.x + xSize; x++) {
          // To send via socket:
          // {player: boolean, hasUp: boolean, hasDown: boolean}
          const roomData = {}; 
          roomData.x = x;
          roomData.y = y;
          const thisRoom = room.area.getRoomAtCoordinates(x, y, coords.z);
          if (x === coords.x && y === coords.y) {
            roomData.player = true;
            map += '<b><yellow>@</yellow></b>';
            mapData.push(roomData);
          } else if (thisRoom) {
            const hasUp = room.area.getRoomAtCoordinates(x, y, coords.z + 1);
            const hasDown = room.area.getRoomAtCoordinates(x, y, coords.z - 1);
            roomData.hasUp = Boolean(hasUp);
            roomData.hasDown = Boolean(hasDown);
            if (hasUp && hasDown) {
              map += '%';
            } else if (hasUp) {
              map += '<';
            } else if (hasDown) {
              map += '>';
            } else {
              map += '.';
            }
            roomData.glyph = thisRoom.metadata.glyph || thisRoom.area.info.glyph
            mapData.push(roomData);
          } else {
            map += ' ';
          }
        }

        map += '|\r\n';
      }

      map += "'" + ('-'.repeat(xSize * 2 + 1)) + "'";
      player.socket.command('sendData', 'map', {mapData, size, areaName: player.room.area.title});
      B.sayAt(player, map);
    }
  };
};
