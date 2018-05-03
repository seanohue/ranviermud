'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  const Player = require(srcPath + 'Player');

  return {
    listeners: {
      read: state => function (_config, player, args) {
        const config = Object.assign({
          divName: 'section',
          content: {},
          readAction: `You open ${this.name}.`,
          indexName: 'table of contents'
        }, _config);

        let {
          divName,
          content,
        } = config;
        const contentMap = new Map(Object.entries(content));

        if (!args || !args.length) {
          return renderTableOfContents.call(this, player, contentMap, config)
        }

        const [targetDiv, toRead] = getContentToRead.call(this, contentMap, args, player);

        if (toRead) {
          return renderContent.call(this, toRead, config, targetDiv, player);
        }

        Broadcast.sayAt(player, `<yellow>${this.name} does not have that ${divName}.</yellow>`);
        return renderTableOfContents.call(this, player, contentMap, config);
      },
    }
  };

  function renderTableOfContents(player, content, config) {
    const {divName, readAction, indexName} = config;
    Broadcast.sayAt(player, readAction.replace('%where', indexName), 40);
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
    if (args.length > 0) {
      let searchableMap = new Map(
        Array.from(contentMap.entries())
          .map(([key, entry]) => [key.toLowerCase(), entry])
      );
 
      const divNameList = Array.from(searchableMap.keys());
      args = args.map(arg => arg.toLowerCase());
      const found = args.find(search => divNameList.includes(search));

      if (!found) {
        const partialMatch = args.reduce((_found, search) => {
          return _found || 
            divNameList.find(key => key.includes(search));
        }, '');
        return [partialMatch, searchableMap.get(partialMatch)];
      }
      return [found, searchableMap.get(found)];
    }

    return [null, null];
  }

  function renderContent(divToRead, config, divTargetName, player) {
    const {divName, readAction} = config;
    Broadcast.sayAt(player, readAction.replace('%where', divTargetName), 40);
    Broadcast.sayAt(player, `<white><b>${this.name}:</white></b>`);
    Broadcast.sayAt(player, Broadcast.center(40, `${divName.toUpperCase()} ${divTargetName.toUpperCase()}`, 'bold'));
    return Broadcast.sayAt(player, divToRead, 40);
  }
};
