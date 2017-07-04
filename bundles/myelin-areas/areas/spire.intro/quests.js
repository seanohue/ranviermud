'use strict';

const FetchGoal = require('../../../ranvier-quests/lib/FetchGoal');
const EquipGoal = require('../../../ranvier-quests/lib/EquipGoal');
const KillGoal = require('../../../ranvier-quests/lib/KillGoal');
const LocationGoal = require('../../../myelin-quests/lib/LocationGoal');

module.exports = (srcPath) => {
  const LevelUtil = require(srcPath + 'LevelUtil');
  const Broadcast = require(srcPath + 'Broadcast');
  const say = Broadcast.sayAt;

  return {
    1: {
      config: {
        title: 'A Way Out', // (initialized when they enter spire.intro:1 room)
        level: 1,
        desc: `You must find your way out of this strange place. First, you must <white>move south</white>.`,
        autoComplete: true,
        reward(quest, player) {
          player.emit('experience', LevelUtil.mobExp(quest.config.level) * 5);
          say(player, '<b>The chill begins to leave your bones and your mind feels less foggy. Continuing exploring to learn more about this place, and to find a way out of these strange chambers.<b>');
          say(player, `<b><cyan>Hint: To move around the game type any of the exit names listed in <white>[Exits: ...]</white> when you use the '<white>look</white>' command.</cyan>`, 80);
        }
      },
      goals: [
        {
          type: LocationGoal,
          config: { title: 'Leave This Tomb', location: 'spire.intro:3', roomTitle: 'The Observation Deck' }
        }
      ]
    },
    2: {
      config: {
        title: "Through the Airlock",
        level: 2,
        desc: `Some of the automatons have malfunctioned, destroying one airlock and stealing the key to the remaining exit. Destroy them in turn, and retrieve the key.`,
        autoComplete: true,
        reward(quest, player) {
          player.emit('experience', LevelUtil.mobExp(quest.config.level) * 5);
          say(player, `<b><cyan>Hint: You can use the '<white>tnl</white>' or '<white>level</white>' commands to see how much experience you need to reach the next level.</cyan>`, 80);
          say(player);
        }
      },
      goals: [
        {
          type: FetchGoal,
          config: { title: 'Find The Airlock Key', count: 1, item: "spire.intro:22" }
        },
        {
          type: KillGoal,
          config: { title: "Destroy 3 Malfunctioning Automatons", npc: "spire.intro:2", count: 3 }
        }
      ]
    },
  };
};