'use strict';
const {sprintf} = require('sprintf-js')

module.exports = (srcPath, bundlePath) => {
  const Logger = require(srcPath + 'Logger');
  const B = require(srcPath + 'Broadcast');
  const ItemUtil = require(bundlePath + 'ranvier-lib/lib/ItemUtil');

  return  {
    listeners: {
      look: state => function (player) {
        const room = this;
        if (room.coordinates) {
          B.sayAt(player, '<yellow><b>' + sprintf('%-65s', room.title) + '</b></yellow>');
          B.sayAt(player, B.line(60));
        } else {
          const [ line1, line2, line3 ] = getCompass(player, room);

          // map is 15 characters wide, room is formatted to 80 character width
          B.sayAt(player, '<yellow><b>' + sprintf('%-65s', room.title) + line1 + '</b></yellow>');
          B.sayAt(player, B.line(60) + B.line(5, ' ') + line2);
          B.sayAt(player, B.line(65, ' ') + '<yellow><b>' + line3 + '</b></yellow>');
        }

        if (!player.getMeta('config.brief')) {
          B.sayAt(player, room.description, 80);
        }

        if (player.getMeta('config.minimap')) {
          B.sayAt(player, '');
          state.CommandManager.get('map').execute(4, player);
        }

        B.sayAt(player, '');

        // show all players
        room.players.forEach(otherPlayer => {
          if (otherPlayer === player) {
            return;
          }
          let combatantsDisplay = '';
          if (otherPlayer.isInCombat()) {
            combatantsDisplay = getCombatantsDisplay(otherPlayer);
          }
          B.sayAt(player, '[Player] ' + otherPlayer.name + combatantsDisplay);
        });

        // show all the items in the rom
        room.items.forEach(item => {
          if (item.metadata.detail) return;

          if (item.hasBehavior('resource')) {
            B.sayAt(player, `[${ItemUtil.qualityColorize(item, 'Resource')}] <magenta>${item.roomDesc}</magenta>`);
          } else if (item.metadata.noPickup) {
            B.sayAt(player, `[${ItemUtil.qualityColorize(item, 'Scenery')}] <magenta>${item.roomDesc}</magenta>`);
          } else {
            B.sayAt(player, `[${ItemUtil.qualityColorize(item, 'Item')}] <magenta>${item.roomDesc}</magenta>`);
          }
        });

        // show all npcs
        room.npcs.forEach(npc => {
          // show quest state as [!], [%], [?] for available, in progress, ready to complete respectively
          let hasNewQuest, hasActiveQuest, hasReadyQuest;
          if (npc.quests) {
            const quests = npc.quests.map(qid => state.QuestFactory.create(state, qid, player));
            hasNewQuest = quests.find(quest => player.questTracker.canStart(quest));
            hasReadyQuest = quests.find(quest => {
              return player.questTracker.isActive(quest.id) && player.questTracker.get(quest.id).getProgress().percent >= 100;
            });
            hasActiveQuest = quests.find(quest => {
              return player.questTracker.isActive(quest.id) && player.questTracker.get(quest.id).getProgress().percent < 100;
            });

            let questString = '';
            if (hasNewQuest || hasActiveQuest || hasReadyQuest) {
              questString += hasNewQuest ? '[<b><yellow>!</yellow></b>]' : '';
              questString += hasActiveQuest ? '[<b><yellow>%</yellow></b>]' : '';
              questString += hasReadyQuest ? '[<b><yellow>?</yellow></b>]' : '';
              B.at(player, questString + ' ');
            }
          } // could also represent in websocket GUI

          let combatantsDisplay = '';
          if (npc.isInCombat()) {
            combatantsDisplay = getCombatantsDisplay(npc);
          }

          // color NPC label by difficulty
          let npcLabel = getNpcLevel(player, npc);

          function getNpcLevel(player, npc) {
            switch (true) {
              case (player.level - npc.level > 4): return '<cyan>NPC</cyan>';
              case (npc.level - player.level > 9): return '<b><black>NPC</black></b>';
              case (npc.level - player.level > 5): return '<red>NPC</red>';
              case (npc.level - player.level > 3): return '<yellow>NPC</red>';
              default: return '<green>NPC</green>';
            }
          }

          B.sayAt(player, `[${npcLabel}] ` + npc.name + combatantsDisplay);
        });

        B.at(player, '[<yellow><b>Exits</yellow></b>: ');
          // find explicitly defined exits
          let foundExits = Array.from(room.exits).map(ex => {
            return [ex.direction, state.RoomManager.getRoom(ex.roomId)];
          });

          // infer from coordinates
          if (room.coordinates) {
            const coords = room.coordinates;
            const area = room.area;
            const directions = {
              north: [0, 1, 0],
              south: [0, -1, 0],
              east: [1, 0, 0],
              west: [-1, 0, 0],
              up: [0, 0, 1],
              down: [0, 0, -1],
            };

            foundExits = [...foundExits, ...(Object.entries(directions)
              .map(([dir, diff]) => {
                const [x, y, z] = diff;
                return [dir, area.getRoomAtCoordinates(
                  coords.x + x, 
                  coords.y + y, 
                  coords.z + z
                )];
              })
              .filter(([dir, exitRoom]) => {
                return !!exitRoom;
              })
            )];
          }

          B.at(player, foundExits.map(([dir, exitRoom]) => {
            const door = room.getDoor(exitRoom) || exitRoom.getDoor(room);
            if (door && (door.locked || door.closed)) {
              return '(' + dir + ')';
            }

            return dir;
          }).join(' '));

          if (!foundExits.length) {
            B.at(player, 'none');
          }
          B.sayAt(player, ']');
      }
    }
  }
}


  // TODO: Make it so players using Neuro can turn off this map.
  // TODO: Make a special fancy Neuro map
  function getCompass(player) {
    const room = player.room;

    const exitMap = new Map();
    exitMap.set('east', 'E');
    exitMap.set('west', 'W');
    exitMap.set('south', 'S');
    exitMap.set('north', 'N');
    exitMap.set('up', 'U');
    exitMap.set('down', 'D');
    exitMap.set('southwest', 'SW');
    exitMap.set('southeast', 'SE');
    exitMap.set('northwest', 'NW');
    exitMap.set('northeast', 'NE');

    const directionsAvailable = room.exits.map(exit => exitMap.get(exit.direction));

    const exits = Array.from(exitMap.values()).map(exit => {
      if (directionsAvailable.includes(exit)) {
        return exit;
      }
      //If we are either SE or NE, pre-pad
      if (exit.length === 2 && exit.includes('E')) {
        return ' -';
      }

      //If we are either SW or NW, post-pad
      if (exit.length === 2 && exit.includes('W')) {
        return '- ';
      }
      return '-';
    });

    let [E, W, S, N, U, D, SW, SE, NW, NE] = exits;
    U = U === 'U' ? '<yellow><b>U</yellow></b>' : U;
    D = D === 'D' ? '<yellow><b>D</yellow></b>' : D;

    const line1 = `${NW}     ${N}     ${NE}`;
    const line2 = `<yellow><b>${W}</b></yellow> <-${U}-(@)-${D}-> <yellow><b>${E}</b></yellow>`;
    const line3 = `${SW}     ${S}     ${SE}\r\n`;

    return [line1, line2, line3];
  }

  function getCombatantsDisplay(entity) {
    const combatantsList = [...entity.combatants.values()].map(combatant => combatant.name);
    return `, <red>fighting </red>${combatantsList.join("<red>,</red> ")}`;
  }