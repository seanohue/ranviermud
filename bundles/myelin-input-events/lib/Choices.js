/*
  Ideally, a chaining API of sorts:
  ```javascript
  return (new Choices(definition))
    .scenario('moral conundrum')
    .where('smart_idea', 'you solve with brain!',
      (chooser, definition) => {
        definition.attributes.intellect += 5;
        chooser.respond('brain get gooder');
      })
    .where('brute_idea', 'you punch thing! rawr',
      (chooser, definition) => {
        definition.attributes.might += 3;
        chooser.respond('you do punch good');
      })
    // Player is made before this hook.
    // Some of this maybe should be done internally and be common.
    .finalize((chooser, definition) => {
      chooser.player.setAttributes(definition.attributes);
      definition.equipment.forEach(id => chooser.player.equip(id));
      chooser.socket.emit('done');
    });
    // Calling .run on this will walk the player through the choices.
  ```

*/

let Broadcast;

module.exports = (srcPath) => class Choices {
  /**
   * @class Choices
   * @param {Object} background - Configuration object
   * @param {string} background.id
   * @param {string} background.name
   * @param {string} background.description
   * @param {Object} background.attributes - Starting attributes
   * @param {Array} background.equipment
   * @param {Array} background.skills
   * @param {Number} background.attributePoints
   * @param {Number} background.abilityPoints
   * @param {Number} background.tier
   */
  constructor(background) {
    this.background = background;

    // A list of scenarios including id and description
    this.scenarios = [];
    // The active scenario (used when building and also when running choices)
    this.activeScenario;
    // Map of scenario IDS to a list of choices made in that scenario.
    this.choiceMap = new Map();
  }

  scenario(id, description) {
    this.scenarios.push({id, description});
    this.activeScenario = id;
    this.choices[id] = [];
    return this;
  }

  // Action is a callback that gets this and this.background as params
  where(id, choice, action) {
    const scenario = this.find(this.activeScenario);
    scenario.choices = scenario.choices || [];

    scenario.choices.push({
      id,
      display: choice,
      onSelect: () => {
        this.choices[this.activeScenario].push(id);
        action(this, this.background);
      }
    });
    return this;
  }

  hasChosen(inScenario, choiceId) {
    return this.choices[inScenario].includes(choiceId);
  }

  find(id) {
    return this.scenarios.find(scenario => scenario.id === id);
  }

  finalize(callback) {
    callback(this, this.background);
  }

  async run({ socket, say, write }) {
    Broadcast = require(srcPath + 'Broadcast');

    say(`\r\n|${Broadcast.line(40)}`);
    say(`|${Broadcast.center(40, `${this.background.name}'s Story'`)}`);
    say(`|${Broadcast.line(40)}`);

    for (const scenario of this.scenarios) {
      const choice = await this.runSingleScenario({
        socket, say, write, scenario
      });
      if (this.choices[scenario.id]) {
        this.choices[scenario.id].push(choice);
      } else {
        this.choices[scenario.id] = [choice];
      }
    }
  }

  async runSingleScenario({socket, say, write, scenario}) {

    // Helper to async-ify waiting for the user to make a choice.
    function waitForChoice(validChoices) {
      return new Promise((resolve, reject) => {
        socket.once('data', _choice => {
          let choice = _choice.toString().trim();
          choice = parseInt(choice, 10) - 1;
          if (isNaN(choice)) {
            return reject('Non-numeric selection.');
          }
          const selection = validChoices.filter(o => !!o.onSelect)[choice];
          if (selection) {
            return resolve(selection);
          }
          return reject('Invalid selection.');
        });
      });
    }

    say(Broadcast.line(40));
    say(`${Broadcast.wrap(scenario.description, 40)}`);
    say(Broadcast.line(40));
    say();

    let optionI = 0;
    for (const opt of scenario.choices) {
      if (opt.onSelect) {
        optionI++;
        say(`| <cyan>[${optionI}]</cyan> ${opt.display}`);
      } else {
        say(`| <bold>${opt.display}</bold>`);
      }
    }

    socket.write('|\r\n`-> ');

    let choice;
    try {
      choice = await waitForChoice(scenario.choices);
    } catch(e) {
      say(e);
      choice = await runSingleScenario({socket, say, write, scenario});
    }

    return choice;
  }
}