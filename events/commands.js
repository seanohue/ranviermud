'use strict';

const src      = '../src/';
const EventUtil   = require('./event_util').EventUtil;
const Data        = require(src + 'data').Data;
const CommandUtil = require(src + 'command_util').CommandUtil;
const Player      = require(src + 'player').Player;
const Commands    = require(src + 'commands').Commands;
const Channels    = require(src + 'channels').Channels;
const Skills      = require(src + 'skills').Skills;
const Feats       = require(src + 'feats').Feats;

const { Parser, InvalidCommandError } = require(src + 'interpreter');
const CommandTypes = require(src + 'commands').CommandTypes;

exports.event = (players, items, rooms, npcs, accounts, l10n) => player => {
  player.getSocket().once('data', data => {
    function loop () {
      player.getSocket().emit('commands', player);
    }
    data = data.toString().trim();
    player.getSocket().write('\r\n');

    if (!data.length) {
      return loop();
    }

    try {
      const result = Parser.parse(data);
      
      if (!result) {
        throw 'Parsing error.';
      }

      switch (result.type) {
        case CommandTypes.ADMIN:
        case CommandTypes.PLAYER:
          return result.command.execute(result.args);
        case CommandTypes.SKILL:
          return player.useSkill(result.skill, player, result.args, rooms, npcs, players, items);
        case CommandTypes.FEAT: 
          return player.useFeat(result.feat,  player, result.args, rooms, npcs, players, items);
        case CommandTypes.CHANNEL:
          return result.channel.use(result.args, player, players, rooms, npcs);
      }

    } catch (e) {
      if (e instanceof InvalidCommandError) {
        player.say('That is not a valid command');
      }
    }

    player.prompt();
    loop();
  });
};
