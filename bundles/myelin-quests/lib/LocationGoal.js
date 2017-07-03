'use strict';

const QuestGoal = require('../../../src/QuestGoal');

/**
 * A quest goal requiring the player to move to a specific location.
 */
class LocationGoal extends QuestGoal {
  constructor(quest, config, player) {
    config = Object.assign({
      title: 'Go To Place',
      location: '',
      predicate: _ => true, // auxilary goal
      predicateDesc: '' // example: ' while carrying the sacred artifact.'
    }, config);

    if (!config.location) {
      throw new Error('You must set a location for the LocationGoal')
    }

    super(quest, config, player);

    this.on('enterRoom', this._checkRoom.bind(this, player));
  }

  _checkRoom(player, nextRoom) {
    if (this._isCorrectRoom(nextRoom) && this.config.predicate()) {
      return this.complete();
    }
  }

  _isCorrectRoom(nextRoom) {
    const room = nextRoom || this.player.room;
    return room.entityReference === this.config.location;
  }

  getProgress() {
    const percent = this._isCorrectRoom() ? 100 : 0;

    const display = `${this.config.title}: [Get to ${this.config.roomTitle}${this.config.predicateDesc}]`;
    return { percent, display };
  }

}

module.exports = LocationGoal;
