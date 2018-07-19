const BaseChannel = require('../../../src/Channel');
const Logger = require('../../../src/Logger');

class GossipChannel extends BaseChannel {
  constructor(config) {
    super(config);

    this.remoteChannel = config.remoteChannel;
  }

  send(state, sender, message) {
    super.send(state, sender, message);

    if (sender.isGossip) {
      return;
    }

    state.GossipEmitter.emit("channels/send", this.remoteChannel, sender.name, message);
  }
}

module.exports = GossipChannel;
