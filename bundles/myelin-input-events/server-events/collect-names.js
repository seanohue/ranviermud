'use strict';

module.exports = srcPath => {
  return {
    listeners: {
      startup: state => () => {
        const keywords = [
          ...state.ItemFactory.entities.values(),
          ...state.MobFactory.entities.values()
        ].reduce((list, def) => list.concat(def.keywords || []), []);
        
        const blacklist = ['adin', 'amin', 'ranvier', 'myelin', 'builder', 'coder', 'tester', 'helper', 'staff', 'test'];

        const badwords = require('badwords/array');
        state.NAME_BLACKLIST = keywords
          .concat(badwords)
          .concat(blacklist);
      },
    }
  };
};
