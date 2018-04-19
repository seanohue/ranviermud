'use strict';

module.exports = srcPath => {
  const QuestGoal = require(srcPath + 'QuestGoal');
  /**
   * A quest goal requiring the player visits specific room(s)
   */
  return class LocationGoal extends QuestGoal {
    constructor(quest, config, player) {
      config = Object.assign({
        title: 'Find Location',
        rooms: [],
        inOrder: false
      }, config);

      super(quest, config, player);

      this.state = {
        visited: []
      };

      this.on('enterRoom', this._checkForRoom);
    }

    getProgress() {
      const amount = Math.min(this.config.rooms.length, this.state.visited.length);
      const percent = (amount / this.config.rooms.length) * 100;
      const display = `${this.config.title}: [${amount}/${this.config.rooms.length}]`;
      return { percent, display };
    }

    complete() {
      if (this.state.visited.length !== this.config.rooms.length) {
        return;
      }

      super.complete();
    }

    _checkForRoom(room) {
      const roomRef = room.entityReference;

      if (this.config.inOrder) {
        if (this.config.rooms.includes(roomRef)) {
          const numberVisited = this.state.visited.length;
          if (this.config.rooms[numberVisited] === roomRef) {
            this.visited.push(roomRef);
          }
        }
      } else {
        if (this.config.rooms.includes(roomRef) && !this.state.visited.includes(roomRef)) {
          this.state.visited.push(roomRef)
        }
      }

      if (this.state.visited.length === this.config.rooms.length) {
        return this.complete();
      }
    }
  };
};
