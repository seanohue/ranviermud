'use strict';

const GossipChannel = require("./lib/GossipChannel");

module.exports = (srcPath) => {
  const AudienceWorld = require(srcPath + 'ChannelAudience/WorldAudience');

  return [
    new GossipChannel({
      name: 'gossip',
      aliases: [],
      description: 'Chat with the Gossip network',
      color: ['bold', 'green'],
      audience: new AudienceWorld(),
    }),
  ];
};
