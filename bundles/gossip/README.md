# Gossip Client for Ranvier

This bundle is a sample implementation of a client to the [Gossip Network][gossip].

To enable:

- Register for an account on [gossip.haus][gossip], and then register your game
  - You will get a Client ID and Client Secret from this step, you will use it in the configuration below
- Clone to your bundles folder
- Add the `"gossip-ranvier"` bundle in `ranvier.json`
- Add the following configuration to `ranvier.json`

```json
{
  "gossip": {
    "url": "wss://gossip.haus/socket",
    "clientId": "CHANGE ME",
    "clientSecret": "CHANGE ME"
  }
}
```

The channels configuration key is set up as an object with the remote channel as the key, and the local channel as the value.

## Adding new channels

You can add new channels by creating more `GossipChannel` objects. They will automatically be detected and join the network.

Note that remote channel names are validated before subscribing. They must be a single word of letters only and a maximum of 15 characters.

## Fake Player

In order for messages to be broadcast into your game, the bundle makes a fake player object as follows:

```javascript
let player = {
  isGossip: true,
  name: "player@RemoteGame",
  getBroadcastTargets: () => {
    return [];
  }
};
```

Make sure this works for your game and extend as needed.

[gossip]: https://gossip.haus/
