'use strict';

const Room = require('./Room');
const EventManager = require('./EventManager');

/**
 * Keeps track of all the individual rooms in the game
 * @property {string} startingRoom EntityReference of the room players should spawn in when created
 */
class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.events = new EventManager();
    this.startingRoom = null;
  }

  /**
   * @param {string} entityRef
   * @return {Room}
   */
  getRoom(entityRef) {
    return this.rooms.get(entityRef);
  }

  /**
   * @param {Room} room
   */
  addRoom(room) {
    this.rooms.set(room.entityReference, room);
    this.events.attach(room);
  }

  /**
   * @param {Room} room
   */
  removeRoom(room) {
    this.rooms.delete(room.entityReference);
  }

  /**
   * Get the exit definition of a room's exit by searching the exit name
   * @param {Room}   room
   * @param {string} exitName exit name search
   * @return {false|Object}
   */
  findExit(room, exitName) {
    const exits = Array.from(room.exits).filter(e => e.direction.indexOf(exitName) === 0);

    if (!exits.length) {
      return false;
    }

    if (exits.length > 1) {
      return false;
    }

    return exits.pop();
  }

  addListener(eventName, listener) {
    this.events.add(eventName, listener);
  }

  attachAllEvents() {
    for (const room of this.rooms.values()) {
      this.events.attach(room);
    }
  }
}

module.exports = RoomManager;
