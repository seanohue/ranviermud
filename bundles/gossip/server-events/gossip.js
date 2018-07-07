'use strict';

const SocketClient = require("../lib/SocketClient");

module.exports = srcPath => {
  return {
    listeners: {
      startup: state => (commander) => {
        let gossipClient = new SocketClient(state);
        state.GossipClient = gossipClient;
        gossipClient.connect();
      },

      shutdown: state => function () {
        // no need to do anything special in shutdown
      },
    }
  };
};
