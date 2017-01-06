'use strict';
const util    = require('util'),
  ansi        = require('sty').parse,
  fs          = require('fs'),
  CommandUtil = require('./command_util').CommandUtil,
  l10nHelper  = require('./l10n');

const Doors = require('./doors').Doors;
const _     = require('./helpers');

// "Globals" to be specified later during config.
let rooms   = null;
let players = null;
let items   = null;
let npcs    = null;

/**
 * Localization
 */
let l10n       = null;
const l10nFile = __dirname + '/../l10n/commands.yml';


const commands_dir = __dirname + '/../commands/';

// constants for command type
const ADMIN   = Symbol();
const PLAYER  = Symbol();
const SKILL   = Symbol();
const CHANNEL = Symbol();
const FEAT    = Symbol();

const CommandTypes = { ADMIN, PLAYER, SKILL, CHANNEL, FEAT };

class Command {
  /**
   * @param {number} type One of the CommandTypes constants
   * @param {String} name Name of the command
   * @param {Function} func Actual function to run when command is executed
   */
  constructor(type, name, func) {
    this.type = type;
    this.name = name;
    this.func = func;
  }

  /**
   * @param {String} args A string representing anything after the command
   *  itself from what the user typed
   * @param {Player} player Player that executed the command
   * @return {*}
   */
  execute(args, player) {
    return this.func(args, player);
  }
}

/**
 * Commands a player can execute go here
 * Each command takes two arguments: a _string_ which is everything the user
 * typed after the command itself, and then the player that typed it.
 */
const Commands = {
  // Built-in player commands
  player_commands: {

    /**
     * Move player in a given direction from their current room
     * @param string exit direction they tried to go
     * @param Player player
     * @return boolean False if the exit is inaccessible.
     */
    _move: new Command(CommandTypes.PLAYER, '_move', (exit, player) => {

      const room = rooms.getAt(player.getLocation());
      if (!room) {
        return false;
      }

      const exits = room.getExits().filter( e => e.direction.indexOf(exit) === 0);

      if (!exits.length) {
        return false;
      }

      if (exits.length > 1) {
        throw 'Be more specific. Which way would you like to go?';
        return true;
      }

      if (player.isInCombat()) {
        throw 'You are in the middle of a fight!';
        return true;
      }

      moveCharacter(exits.pop(), player);

      return true;
    }),
  },

  /* Admin commands.    
    addSkill: (rooms, items, players, npcs, Commands) =>
      (player, args) => {
        const Skills = require('./skills').Skills;
        args = _.splitArgs(args);

        if (!player || !args || !args.length) { return; }
        const skill = Skills[args[0]] ? Skills[args[0]].id : null;
        const number = args[1] || 1;
        if (skill) {
          player.setSkill(skill, number);
          player.say("<red>ADMIN: Added " + args + ".</red>");
        } else { player.say("<red>ADMIN: No such skill.</red>"); }
        util.log("@@Admin: " + player.getName() + " added skill:", skill);
      },

    addFeat: (rooms, items, players, npcs, Commands) =>
      (player, args) => {
        const Feats = require('./feats').Feats;
        args = _.splitArgs(args);

        if (!player || !args) { return; }

        const feat = Feats[args[0]] ? Feats[args[0]] : null;

        if (feat) {
          player.gainFeat(feat);
          player.say("<red>ADMIN: Added " + feat.id + ".</red>");
        } else {
          return player.say("<red>ADMIN: No such feat.</red>");
        }
        util.log("@@Admin: " + player.getName() + " added feat:", feat.name);
      },

    debugChar: (rooms, items, players, npcs, Commands) =>
      (player, args) => {
        const attrs = player.getAttributes();
        player.say("<red>ADMIN: Debug Character</red>");

        player.warn('ATTRIBUTES: ');
        for (let attr in attrs) {
          player.say(attr + ': ' + attrs[attr]);
        }

        player.warn('EFFECTS: ');
        const effects = player.getEffects();
        for (let [id, effect] of effects) {
          player.say(`${id}: `);
          player.say(`duration: ${effect.getDuration()}`);
          player.say(`elapsed:  ${effect.getElapsed()}`);
          player.say(`aura:     ${effect.getAura()}`);

        }

        player.warn('MODIFIERS: ');
        ['speedMods', 'dodgeMods', 'damageMods', 'toHitMods'].forEach(mod => {
          if (!Object.keys(mod).length) { return; };
          player.warn(mod);
          for (let modId in player[mod]) {
            player.say(modId + ': ' + player[mod][modId]);
          }
        });
      },

      debugInv: (rooms, items, players, npcs, Commands) =>
        (player, args) => {
          const inv = player.getInventory();
          player.warn("ITEMS:\n");
          for (let i in inv) {
            const item = inv[i];
            player.say(item.getShortDesc());

            const attrs = item.getAttributes();
            for (let attr in attrs) {
              player.say(attr + ': ' + attrs[attr]);
            }

            const prereqs = item.getPrerequisites();
            for (let prereq in prereqs) {
              player.say(prereq + ': ' + prereqs[prereq]);
            }

            const isContainer = item.isContainer();
            const actualWeight = item.getWeight(items);
            player.say(`Is container: ${isContainer}`);
            player.say(`Total weight: ${actualWeight}`);
            if (isContainer) {
              const itemContents   = item.getInventory();
              const spaceLeft      = item.getRemainingSizeCapacity(items);
              const contentsWeight = item.getContainerWeight(items);
             
              player.say(`Contents: ${itemContents}`);
              player.say(`Space left: ${spaceLeft}`);
              player.say(`Contents weight: ${contentsWeight}`);
              player.say(`
              ===========`);
            }

            player.say(item.isEquipped() ? 'Equipped' : 'In inventory');
            player.say(`========`);
            player.say(`Behaviors: ${item.behaviors}, script: ${item.script}`);
            const events = item.eventNames();
            player.say(`Events: ${events.join(', ')}`);
            player.warn('========\n');
            console.log('events for ', item.getShortDesc());
            console.log(events);
          }

        },

    debugItems: (rooms, items, players, npcs, Commands) =>
      (player, args) => {
        const allItems = items.objects;
        player.warn(`UUIDs: ${Object.keys(allItems)}`);
        player.warn(`========`);
        player.warn("GLOBAL ITEMS:\n");
        for (let uid in allItems) {
          const item = allItems[uid];

          player.say(item.getShortDesc());
          player.say('\n');
          player.say('vnum: ' + item.getVnum());
          player.say('uuid: ' + item.getUuid());
          player.say('location: ' + item.getRoom());
          player.say('\n')
          player.say(item.isEquipped() ? 'Equipped' : 'Not equipped');

          const container = item.getContainer();
          player.say(container ? 'Container: ' + container : 'No container.');

          const inventory = item.getInventory();
          player.say(inventory ? 'Inventory: ' : 'No inventory.');
          if (inventory) {
            for (let i in inventory) {
              player.say(`${i}: ${inventory[i].getShortDesc()} ${i.getUuid()}`);
            }
          }
          player.warn('========\n');
        }

      },

    setAttribute: (rooms, items, players, npcs, Commands) =>
      (player, args) => {
        args = _.splitArgs(args);

        const attributes = player.getAttributes();
        const attr = args[0];

        if (attr in attributes) {
          const score = parseInt(args[1], 10);
          if (!score || isNaN(score)) {
            return player.say('<red>ADMIN: Not a real number.</red>');
          }

          player.setAttribute(attr, score);
          util.log("@@Admin: " + player.getName() + " set attr " + attr + " to " + score + ".");
          return player.say("<red>ADMIN: Set " + attr + " to " + score + ".</red>");
        }

        player.say('<red>ADMIN: No such attribute.</red>');
      },

    teleport: (rooms, items, players, npcs, Commands) =>
      (player, args) => {
        if (!player || !player.say || !args) { return; }
        const vnum = parseInt(args, 10);
        if (isNaN(vnum)) {
          return player.say("<red>ADMIN: Invalid vnum.</red>");
        }

        if (rooms.getAt(vnum)) {
          player.setLocation(vnum);
          player.say("<red>ADMIN: You have teleported.");
          return Commands.player_commands.look(null, player);
        }

        player.say("<red>ADMIN: 404: Room not found.</red>");

      },

    //TODO: invis
*/     


  admin_commands: {
  },

  /**
   * Configure the commands by using a joint players/rooms array
   * and loading the l10n. The config object should look similar to
   * {
   *   rooms: instanceOfRoomsHere,
   *   players: instanceOfPlayerManager,
   *   locale: 'en'
   * }
   * @param object config
   */
  configure(config) {

    rooms   = config.rooms;
    players = config.players;
    npcs    = config.npcs;
    items   = config.items;

    util.log("Loading command l10n... ");
    l10n = l10nHelper(l10nFile);
    l10n.setLocale("en");
    util.log("Done");

    // Load external commands
    fs.readdir(commands_dir, (err, files) => {
      for (const name in files) {
        const filename = files[name];
        const commandFile = commands_dir + filename;
        if (!fs.statSync(commandFile).isFile()) { continue; }
        if (!commandFile.match(/js$/)) { continue; }

        const commandName = filename.split('.')[0];

        var cmdImport = require(commandFile) ;

        Commands.player_commands[commandName] = new Command(
          cmdImport.type || CommandTypes.PLAYER,
          commandName,
          cmdImport.command(rooms, items, players, npcs, Commands)
        );
      }
    });
  },

  setLocale(locale) { l10n.setLocale(locale); },

  canPlayerMove(exit, player) {
      const room = rooms.getAt(player.getLocation());
      if (!room) {
        return false;
      }

      const exits = room.getExits().filter( e => e.direction.indexOf(exit) === 0);

      if (!exits.length) {
        return false;
      }

      if (exits.length > 1) {
        return false;
      }

      if (player.isInCombat()) {
        return false;
      }

      return true;
  }
};

/**
 * Move helper method
 * TODO: Refactor this to move any character, not just players
 *
 * @param {object} exit   Room.exits object
 * @param {Player} player
 * @return bool Moved (false if the move fails)
 */
function moveCharacter(exit, player) {
  rooms.getAt(player.getLocation()).emit('playerLeave', player, players);

  const room = rooms.getAt(exit.location);
  if (!room) {
    player.say(`You are in limbo. How did this happen? Please contact an administrator.`);
    return true;
  }

  const moveCost = exit.cost ? exit.cost : 1;
  if (!player.hasEnergy(moveCost, items)) { 
    return player.noEnergy(); 
  }

  if (closedDoor) {
    Commands.player_commands.open(exit.direction, player);
  }

  //TODO: Use broadcast module.
  players.eachExcept(player, p => {
    if (CommandUtil.inSameRoom(p, player)) {
      try {
        const exitLeaveMessage = exit.leave_message[p.getLocale()];
        const leaveMessage = exitLeaveMessage ?
          `${player.getName() + exitLeaveMessage}` :
          `${player.getName()} leaves.`;
        p.say(leaveMessage);
      } catch (e) {
        p.say(`${player.getName()} leaves.`);
        util.log(e);
      }
      p.prompt();
    }
  });

  player.setLocation(exit.location);

  // Add room to list of explored rooms
  const hasExplored = player.hasExplored(room.getLocation());

  // Force a re-look of the room

  Commands.player_commands.look.execute(null, player);

  // Trigger the playerEnter event
  // See example in scripts/npcs/1.js
  room.getNpcs()
      .forEach(id => {
        const npc = npcs.get(id);
        if (!npc) { return; }
        npc.emit('playerEnter', room, rooms, player, players, npc, npcs, items);
      });

  room.emit('playerEnter', player, players, rooms);

  // Broadcast player entrance to new room.
  //TODO: Use broadcast module.
  players.eachExcept(
    player,
    p => {
      if (CommandUtil.inSameRoom(p, player)) {
        p.say(player.getName() + ' enters.');
      }
  });
  
  return true;

}

exports.Command = Command,
exports.Commands = Commands,
exports.CommandTypes = CommandTypes
