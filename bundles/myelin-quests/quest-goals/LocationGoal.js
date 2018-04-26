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

      this.checkForRoom = this._checkForRoom.bind(this);

     (this.player || player).on('enterRoom', this.checkForRoom);
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
      
      this.player.off('enterRoom', this.checkForRoom);

      super.complete();
    }

    _checkForRoom(player, room) {
      console.log('check' + '+'.repeat(20));
      console.log({config: this.config, rooms: this.config.rooms, state: this.state, room});
      const roomRef = room.entityReference;

      if (this.config.inOrder === true) {
        console.log({inOrder: this.config.inOrder});
        if (this.config.rooms.includes(roomRef)) {
          const numberVisited = this.state.visited.length;
          if (this.config.rooms[numberVisited] === roomRef) {
            console.log('Went to a new room in order.');
            this.visited.push(roomRef);
          }
        }
      } else {
        if (this.config.rooms.includes(roomRef) && !this.state.visited.includes(roomRef)) {
          this.state.visited.push(roomRef);
        }
      }

      if (this.state.visited.length === this.config.rooms.length) {
        return this.complete();
      }
    }
  };
};
