'use strict';
const Feats = require('../src/feats').Feats;
const meetsPrerequisites = require('../src/feats').meetsPrerequisites;
const util = require('util');
const _ = require('../src/helpers');

exports.command = (rooms, items, players, npcs, Commands) => {
  return (args, player) => {
    if (args) {
      const featToManifest = _.firstWord(args);

      if (featToManifest in player.getFeats()) {
        return player.say('You already have manifested ' + featToManifest + '.');
      }

      if (featToManifest in Feats) {
        const feat = Feats[featToManifest];

        if (meetsPrerequisites(player, feat)) {
          player.say('You manifest ' + feat.name.toLowerCase() + '.');
          util.log(player.getName() + ' manifests ' + feat.name);

          return purchaseFeat(player, feat, items);
        } else {
          return player.say('You are not yet powerful enough to manifest ' + featToManifest + '.');
        }
      }
    }

    player.say('Manifest what?');

  }
}

function purchaseFeat(player, feat, items) {
  if (!player.hasEnergy(5, items)) { return player.noEnergy(); }
  const originalMutagens = player.getRawAttribute('mutagens');
  if (!originalMutagens || originalMutagens < feat.cost) {
    return player.say('You are not able to manifest that feat yet.');
  }
  player.setAttribute('mutagens', originalMutagens - feat.cost);

  player.gainFeat(feat);
  if (feat.type === 'passive') { feat.activate(player); }
  return true;
}
