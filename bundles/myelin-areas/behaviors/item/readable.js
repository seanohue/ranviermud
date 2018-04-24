'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Player = require(srcPath + 'Player');

  return {
    listeners: {
      read: state => function (config, player, args) {
        let {
          divName = 'section',
          content = {}
        } = config;
        const contentMap = new Map(Object.entries(content));

        if (!args || !args.length) {
          return renderTableOfContents.call(this, player, contentMap, divName)
        }

        const [targetDiv, toRead] = getContentToRead.call(this, contentMap, args, player);

        if (toRead) {
          return renderContent.call(this, toRead, divName, targetDiv, player);
        }

        Broadcast.sayAt(player, `<yellow>${this.name} does not have that ${divName}.</yellow>`);
        return renderTableOfContents.call(this, player, contentMap, divName);
      },
    }
  };

  function renderTableOfContents(player, content, divName) {
    Broadcast.sayAt(player, Broadcast.center(40, this.name, 'bold', '-'));
    Broadcast.sayAt(player, this.description);
    Broadcast.sayAt(player, '');

    const [first, ...rest] = divName;
    const capitalizedDivName = [first.toUpperCase()].concat(rest).join('');
    const divsList = Array
      .from(content.keys())
      .map(div => div.toUpperCase())
      .join(',\n');

    const keywordForThis = this.name.split(' ')[0].toLowerCase();
    Broadcast.sayAt(player, `<b>${capitalizedDivName}s:</b>\n${divsList}.\n`);
    Broadcast.sayAt(player, `<b>Try 'read ${keywordForThis} [${divName}]' to read a specific ${divName}.</b>`);
  }

  function getContentToRead(contentMap, args, player) {
    if (args.length > 1) {
      const divNameList = Array.from(contentMap.keys()).map(key => key.toLowerCase());
      args = args.map(arg => arg.toLowerCase());
      const found = args.filter(search => divNameList.has(search));

      if (!found) {
        const partialMatch = args
          .filter(search => divNameList
            .filter(key => key.includes(search)));
        return [partialMatch[0], contentMap.get(partialMatch[0])];
      }
      return [found[0], contentMap.get(found[0])];
    }
    return [args[0], contentMap.get(args[0])];
  }

  function renderContent(divToRead, divName, divTargetName, player) {
    Broadcast.sayAt(player, `<white><b>${this.name}:</white></b>`);
    Broadcast.sayAt(player, Broadcast.center(40, `${divName.toUpperCase()} ${divTargetName.toUpperCase()}`, 'bold'));
    return Broadcast.sayAt(player, divToRead);
  }
};
