'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  return {
    listeners: {
      read: state => (config, player, args) => {
        const title = this.name || this.roomDesc || 'Untitled';
        const sectionsName = config.sectionsName || 'sections';
        const prologue = config.prologue || '';

        const argsList = args.split(' ');

        if (player.__lastReadAttempt !== this.entityReference) {
          player.__penultimateReadAttempt = player.__lastReadAttempt;
        }
        player.__lastReadAttempt = this.entityReference;

        // Such as 'read bookName'
        if (argsList.length === 0) {
          Broadcast.sayAt(player, `<bold>${title}</bold>\n`);
          Broadcast.sayAt(player, `${prologue}`, 40);
          if (!(config.sections && config.sections.length) && config.text) {
            throw new ReferenceError('Readable has no sections or text!');
          }
          for (const section in config.sections) {

          }
          // Title, Prologue, and TOC

        } 

        

      }
    }
  }
}
