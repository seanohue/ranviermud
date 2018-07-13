const WebSocket = require('ws');

const Logger = require('../../../src/Logger');
const GossipEmitter = require("./GossipEmitter");

class SocketClient {
  constructor(state, version) {
    this.state = state;
    this.ranvierVersion = version;

    this.channels = {};
    state.ChannelManager.channels.forEach((channel, key, map) => {
      if (channel.remoteChannel) {
        this.channels[channel.remoteChannel] = channel.name;
      }
    });

    this.config = this.state.Config.get("gossip");
    this.active = true;
  }

  reconnect() {
    if (this.active == false) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }

      Logger.verbose("Gossip - trying to reconnect");

      this.connect();
    }, 5 * 1000);
  }

  connect() {
    this.gossipEmitter = new GossipEmitter();
    this.state.GossipEmitter = this.gossipEmitter;

    // create a new websocket server using the port command line argument
    this.ws = new WebSocket(this.config.url);
    this.ws.on("error", (err) => {
      Logger.error(`Gossip - connection error - ${err}`);
    });

    this.gossipEmitter.on("messages/new", (channel, sender, message) => {
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

      let auth = {
        "event": "authenticate",
        "payload": {
          "client_id": this.config.clientId,
          "client_secret": this.config.clientSecret,
          "supports": ["channels"],
          "channels": Object.keys(this.channels),
          "user_agent": `Ranvier ${this.ranvierVersion}`
        }
      };

      this.ws.send(JSON.stringify(auth));
    });

    this.ws.on('message', data => {
      let event = JSON.parse(data);

      switch (event["event"]) {
        case "authenticate":
          Logger.verbose(`Gossip - authenticate event - status: ${event["status"]}`);

          this.active = event["status"] == "success";

          break;

        case "heartbeat":
          Logger.verbose("Gossip - responding to heartbeat");

          let players = [];
          this.state.PlayerManager.players.forEach(player => {
            players.push(player.name);
          })

          let message = {
            "event": "heartbeat",
            "payload": {
              "players": players
            }
          };
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

          let channel = this.channels[payload["channel"]];

          this.state.ChannelManager.get(channel).send(this.state, player, payload["message"]);

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
