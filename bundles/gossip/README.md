# Gossip Client for Ranvier

This bundle is a sample implementation of a client to the [Gossip Network](https://gossip.haus).

To enable:

- Clone to your bundles folder
- Add the `"gossip-ranvier"` bundle in `ranvier.json`
- Add the following configuration to `ranvier.json`

```json
{
  "gossip": {
    "url": "wss://gossip.haus/socket",
    "clientId": "client id",
    "clientSecret": "client secret",
    "channels": {
      "gossip": "gossip"
    }
  }
}
```

The channels configuration key is set up as an object with the remote channel as the key, and the local channel as the value.
