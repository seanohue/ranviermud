'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      examine: state => function (player, examinable) {
        switch (examinable) {
          case 'cylinders':
            return Broadcast.sayAt(player, 'Upon closer inspection, the cylinders are made of thick glass. Some of them are slightly cracked, and a thin vapor is emerging. Others are too frosted over to see within. In some, you see a dim silhouette.', 40);
          case 'tubes':
            return Broadcast.sayAt(player, 'The tubes are running from the alcove\'s entrance, across the ceiling, and into the wall above each of the cylinders. They are opaque, and you cannot tell what they may be filled with.');
          default:
            Broadcast.sayAt(player, 'Huh?');
        }
      }
    }
  };
};
