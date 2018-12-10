module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  return  {
    listeners: {
      /**
       * Handle player leveling up
       */
      level: state => function () {
        const area = this.room.area;
        if (!area) return;

        if (area.title === 'The Spire: Cryochamber') {
          const maxLevel = area.info.levelRange.max
          if (this.level === maxLevel) {
            B.sayAt(this, '<b>You have an uneasy feeling in the pit of your stomach, as if you are being watched.</b>');
          }
          if (this.level > maxLevel) {
            // Spawn lemur assassins
            const lemurs = [
              this.room.spawnNpc(state, 'spire.intro:lemur'),
              this.room.spawnNpc(state, 'spire.intro:lemur'),
              this.room.spawnNpc(state, 'spire.intro:lemur')
            ];
            lemurs.forEach(lemur => {
              const aggro = lemur.getBehavior('ranvier-aggro');
              aggro.towards = {players: [this.name]};
              lemur.initiateCombat(this);
            });
          }
        }
      }
    }
  };
};