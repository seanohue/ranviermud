const WebSocket = require('ws');

const Logger = require('../../../src/Logger');
const GossipServer = require("./GossipServer");

class SocketClient {
  constructor(state) {
    this.state = state;
    this.config = this.state.Config.get("gossip");
  }

  reconnect() {
    this.reconnectTimer = setTimeout(() => {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }

      Logger.verbose("Gossip - trying to reconnect");

      this.connect();
    }, 5 * 1000);
  }

  connect() {
    this.gossipServer = new GossipServer();
    this.state.GossipServer = this.gossipServer;

    // create a new websocket server using the port command line argument
    this.ws = new WebSocket(this.config.url);
    this.ws.on("error", (err) => {
      Logger.error(`Gossip - connection error - ${err}`);
    });

    this.gossipServer.on("messages/new", (channel, sender, message) => {
      let event = {
        "event": "messages/new",
        "payload": {
          "channel": channel,
          "name": sender,
          "message": message
        }
      };

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(event));
      }
    });

    this.ws.on('open', () => {
      Logger.verbose("Gossip - Connection opened");

      console.log();

      let auth = {
        "event": "authenticate",
        "payload": {
          "client_id": this.config.clientId,
          "client_secret": this.config.clientSecret,
          "supports": ["channels"],
          "channels": Object.keys(this.config.channels),
          "user_agent": `Ranvier 2.0.0`
        }
      };

      this.ws.send(JSON.stringify(auth));
    });

    this.ws.on('message', data => {
      let event = JSON.parse(data);

      switch (event["event"]) {
        case "authenticate":
          Logger.verbose(`Gossip - authenticate event - status: ${event["status"]}`);

        break;

        case "heartbeat":
          Logger.verbose("Gossip - responding to heartbeat");

        let message = {"event": "heartbeat"};
        this.ws.send(JSON.stringify(message));

        break;

        case "messages/broadcast":
          let payload = event["payload"];

        Logger.verbose(`Gossip - received broadcast on "${payload["channel"]}"`);

        let player = {
          isGossip: true,
          name: `${payload["name"]}@${payload["game"]}`,
          getBroadcastTargets: () => {
            return [];
          }
        };

        let channel = this.config.channels[payload["channel"]];

        state.ChannelManager.get(channel).send(state, player, payload["message"]);

        break;
      }
    });

    this.ws.on("close", () => {
      Logger.verbose("Connection to Gossip closed.");
      this.reconnect();
    });

    Logger.verbose('Gossip connecting...');
  }
}

module.exports = SocketClient;
