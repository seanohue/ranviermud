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

      this.player = player;

      this.checkForRoom = this._checkForRoom.bind(this, player);

     (this.player || player).on('enterRoom', this.checkForRoom);
    }

    getProgress() {
      const amount = Math.min(this.config.rooms.length, this.state.visited.length);
      const percent = (amount / this.config.rooms.length) * 100;
      const display = `${this.config.title}: [${amount}/${this.config.rooms.length}]`;
      return { percent, display };
    }

    complete(player) {
      player = player || this.player;
      if (this.state.visited.length !== this.config.rooms.length) {
        return;
      }

      player.removeListener('enterRoom', this.checkForRoom);

      super.complete();
    }

    _checkForRoom(player, room) {
      if (!room) {
        return Logger.warn('No room found for locationGoal...');
      }

      if (!player.questTracker.canStart(this.quest) || player.questTracker.isComplete(this.quest)) return;

      const roomRef = room.entityReference;

      if (this.config.inOrder === true) {
        if (this.config.rooms.includes(roomRef)) {
          const numberVisited = this.state.visited.length;
          if (this.config.rooms[numberVisited] === roomRef) {
            this.visited.push(roomRef);
            this.emit('progress', this.getProgress());
          }
        }
      } else {
        if (this.config.rooms.includes(roomRef) && !this.state.visited.includes(roomRef)) {
          this.state.visited.push(roomRef);
          this.emit('progress', this.getProgress());
        }
      }

      if (this.state.visited.length >= this.config.rooms.length) {
        return this.complete(player);
      }
    }
  };
};
