'use strict';

const { Command, Commands, CommandTypes } = require('./commands');
const { Channels } = require('./channels');
const { Skills }   = require('./skills');

const _ = require('./helpers');

/**
 * Interpreter.. you guessed it, interprets command input
 */
class CommandParser {
  /**
   * Parse a given string to find the resulting command/arguments
   * @param {String} data
   * @return {command: Command, args: String}
   */
  static parse(data, player) {
    data = data.trim();

    const parts = data.split(' ');

    const command = parts.shift().replace(/[^a-z]/i, '');
    console.log({parts});
    if (!command.length) {
      throw new InvalidCommandError();
    }

    const args = parts.join(' ');

    // Kludge so that 'l' alone will always force a look,
    // instead of mixing it up with lock or list.
    // TODO: replace this a priority list
    if (command === 'l') {
      return {
        type: CommandTypes.PLAYER,
        command: Commands[CommandTypes.PLAYER].look,
        args: args
      };
    }

    // Same with 'i' and inventory.
    if (command === 'i') {
      return {
        type:    CommandTypes.PLAYER,
        command: Commands[CommandTypes.PLAYER].inventory,
        args
      };
    }

    if (command[0] === '@') {
      const adminCommand = command.slice(1);
      if (adminCommand in Commands[CommandTypes.ADMIN]) {
        return {
          type:    CommandTypes.PLAYER,
          command: Commands[CommandTypes.ADMIN][adminCommand],
          args
        };
      }
    }

    if (command in Commands[CommandTypes.PLAYER]) {
      return {
        type: CommandTypes.PLAYER,
        command: Commands[CommandTypes.PLAYER][command],
        args
      };
    }

    // check for direction shortcuts
    const directions = {
      'n':  'north',
      'e':  'east',
      's':  'south',
      'w':  'west',
      'u':  'up',
      'd':  'down',

      'ne': 'northeast',
      'se': 'southeast',
      'nw': 'northwest',
      'sw': 'southwest',
    };

    if (command.toLowerCase() in directions) {
      const direction = directions[command.toLowerCase()];
      return {
        type: CommandTypes.PLAYER,
        command: Commands[CommandTypes.PLAYER]._move,
        args: direction
      };
    }

    // see if they typed at least the beginning of a command and try to match
    for (let cmd in Commands[CommandTypes.PLAYER]) {
      if (_.has(Commands[CommandTypes.PLAYER][cmd].name), command) {
        return {
          type: CommandTypes.PLAYER,
          command: Commands[CommandTypes.PLAYER][cmd],
          args
        };
      }
    }

    // check exits
    if (Commands.canPlayerMove(command, player) === true) {
      return {
        type: CommandTypes.PLAYER,
        command: Commands[CommandTypes.PLAYER]._move,
        args: command
      };
    }

    // check skills
    if (command in player.getSkills()) {
      return {
        type: CommandTypes.SKILL,
        skill: command,
        args
      };
    }

    if (command in player.getFeats()) {
      return {
        type: CommandTypes.FEAT,
        skill: command,
        args
      };
    }

    // finally check channels
    if (command in Channels) {
      return {
        type: CommandTypes.CHANNEL,
        channel: Channels[command],
        args
      };
    }

    return null;
  }
}

exports.CommandParser = CommandParser;

class InvalidCommandError extends Error {}
exports.InvalidCommandError = InvalidCommandError;
