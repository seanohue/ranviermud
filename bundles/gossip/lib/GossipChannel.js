const BaseChannel = require('../../../src/Channel');
const Logger = require('../../../src/Logger');

class GossipChannel extends BaseChannel {
  send(state, sender, message) {
    super.send(state, sender, message);

    if (sender.isGossip) {
      return;
    }

    state.GossipServer.emit("messages/new", this.name, sender.name, message);
  }
}

module.exports = GossipChannel;
