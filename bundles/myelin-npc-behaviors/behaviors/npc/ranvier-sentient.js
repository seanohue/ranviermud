'use strict';

/**
 * This is a behavior to allow NPCs to respond to player input powered by API.ai
 * To use this behavior you must have an API.ai account. You will need to get your
 * developer key and put it in a file called `APIAIKEY` in the base of this bundle directory
 *
 * The behavior currently listens for intents with the following actions so you can either
 * create your own intents in the API.ai dashboard with these actions or create your own
 * and customize this behavior
 *
 * - shop.list: "What's for sale?"
 * - query.about: "Who are you?"
 * - query.area: "Where am I?"
 * - smalltalk.greeting: "Hello"
 * - smalltalk.thanks: "Thanks"
 *
 * This allows you to leverage the language parsing of api.ai to execute in game commands
 * or simply have an NPC carry on a conversation with a player in a natural way. It is currently
 * only triggered via the `talk` command, e.g., `talk to Wally what's for sale?` but can be triggered
 * by anything firing the `conversation` event on an NPC.
 */

const apiai = require('apiai');
const uuid = require('node-uuid');
const sessionId = uuid.v4();
const fs = require('fs');

let clientKeys = null;
let parseError = '';

try {
  clientKeys = JSON.parse(fs.readFileSync(fs.realpathSync(__dirname + '/../../APIAIKEY.json')).toString('utf8').trim());
} catch (e) {
  parseError = e;
}
const services = {};

if (clientKeys && Object.keys(clientKeys).length) {
  for (const [id, key] of Object.entries(clientKeys)) {
    if (!key) continue;
    services[id] = apiai(key);
  }
}

module.exports = srcPath => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
  if (parseError) {
    Logger.log('Error when parsing client keys for API.AI: ');
    Logger.log(parseError);
  } else {
    Object.keys(services).forEach(id => {
      Logger.log(`Loaded API.AI Service ${id}`);
    });
  }

  return {
    listeners: {
      conversation: state => function (config, player, message) {
        const {id = 'NOT CONFIGURED'} = config;
        const failure = why => {
          Logger.error('Player tried talking about: ', message);
          Logger.error('AI Failure. ' + why);
          return B.sayAt(player, "They didn't seem to understand you.");
        };

        Logger.log(`Player is trying to talk about ${message} with ${id}.`);

        if (!services) {
          return failure('No services registered.');
        }

        const service = services[id];

        if (!service) {
          return failure(`Service ${id} not registered.`);
        }

        const request = service.textRequest(message, { sessionId });

        request.on('response', response => {
          if (player.room !== this.room) {
            return;
          }

          const result = response.result;
          if (!result.action && !result.fulfillment) {
            return failure(id + ': No action found in result: ' + JSON.stringify(result));
          }

          if (result.action) {
            switch (result.action) {
              case 'shop.list':
                if (!this.hasBehavior('vendor')) {
                  if (result.fulfillment && result.fulfillment.speech) {
                    return B.sayAt(player, `<b><cyan>${this.name} says, "${result.fulfillment.speech}"</cyan></b>`);
                  }
  
                  return failure('Invalid shop.list action for ' + config.id);
                }
  
                state.CommandManager.get('shop').execute('list', player, 'shop');
                break;
  
              default:
                const defaultResponses = {
                  'query.about': `I'm ${this.name}.`,
                  'query.area': `You're in ${this.room.area.title}.`,
                };
  
                const reply =
                  (config.responses && config.responses[result.action]) ||
                  defaultResponses[result.action] ||
                  (result.fulfillment && result.fulfillment.speech)
                ;
  
                if (!reply) {
                  return failure(`No valid reply for ${id}.`);
                }
  
                B.sayAt(player, `<b><cyan>${this.name} says, "${reply}"</cyan></b>`);
                break;
            }

            return B.prompt(player);
          }

          const reply = result.fulfillment.speech;

          if (!reply) {
            return failure(`No valid reply for ${id}`)
          }

          B.sayAt(player, `<b><cyan>${this.name} says, "${reply}"</cyan></b>`);
          B.prompt(player);
        });

        request.on('error', err => {
          Logger.error('API-AI Error Response');
          let error;
          try {
            error = JSON.stringify(error)
          } catch(e) {
            Logger.error('Parsing error ' + e);
            error = err;
          }
          Logger.error(error);
          failure();
        });

        request.end();
      },

      playerEnter: state => function (config, player) {
        if (!player.getMeta('hints.sentient')) {
          B.sayAt(player, `<cyan><b>HINT:</b> You can interact with sentient NPCs by using the <b>'talk', 'ask', or 'greet'</b> commands.</cyan>`);
          B.sayAt(player);
          B.sayAt(player, `<cyan><b>Examples:</b></cyan> `);
          B.sayAt(player, '<cyan>- greet concierge</cyan>'); 
          B.sayAt(player, '<cyan>- talk concierge i need your help</cyan>');
          B.sayAt(player, '<cyan>- ask concierge what do you do</cyan>');
          player.setMeta('hints', player.getMeta('hints') || {});
          player.setMeta('hints.sentient', true);
        }
      }
    }
  };
};
