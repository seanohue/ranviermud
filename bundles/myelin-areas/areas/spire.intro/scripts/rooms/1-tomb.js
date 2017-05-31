'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      command: state => function (player, commandName, args) {
        switch (commandName) {
          case 'examine':
            return examine(player, args);
          default:
            Broadcast.sayAt(player, 'Huh?');
        }
      }
    }
  };

  //TODO: Create an 'examine' behavior and/or command.
  function examine(player, args) {
    const cylinderKeywords = [
      'cylinders',
      'coffins',
      'glass',
      'walls'
    ];

    if (cylinderKeywords.some(keyword => args.includes(keyword))) {
      // Wrapping?
      return Broadcast.sayAt(player, 'Upon closer inspection, the cylinders are made of thick glass. Some of them are slightly cracked, and a thin vapor is emerging. Others are too frosted over to see within. In some, you see a dim silhouette.');
    }
  }
};

