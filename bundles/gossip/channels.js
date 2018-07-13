'use strict';

/**
 * When adding new Gossip channels, the remoteChannel is validated before
 * being fully subscribed. The name must be a single word of letters only
 * and maximum of 15 characters.
 */

const GossipChannel = require("./lib/GossipChannel");

module.exports = (srcPath) => {
  const AudienceWorld = require(srcPath + 'ChannelAudience/WorldAudience');

  return [
    new GossipChannel({
      name: 'gossip',
      remoteChannel: 'gossip',
      aliases: [],
      description: 'Chat with the Gossip network',
      color: ['bold', 'green'],
      audience: new AudienceWorld(),
    }),
  ];
};
