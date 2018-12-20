/*
  A more flexible character generation libary for Ranvier
  Ideally, a chaining API of sorts:
  ```javascript
  let startingAttributes = { ... };
  let startingClass = 'warrior';
  const scenario = Choices
    .createScenario('toughChoice', {
      title: 'Make a tough decision',
      description: 'This will have an effect on your character\'s starting equipment or whatever.'
    })
    .addOptions({
      beGood: {
        description: 'Do the right thing',
        effect() {
          startingAttributes.willpower++;
        }
      },
      beBad: {
        description: 'Do the wrong thing via brute force.',
        effect() {
          startingAttributes.might++;
        }
      }
    });

  const secondScenario = Choices
    .createScenario('job', {
      title: 'Choose a career path'.
      description: 'This will have an effect on your character\'s starting skills or whatever.'
    })
    .addOptions({
      bePaladin: {
        description: 'Become a paladin',
        effect() {
          startingClass = 'paladin';
        },
        prerequisite(choices) {
          return choices.toughChoice !== 'beBad'
        }
      }
    },
    {
      beThief: {
        description: 'Become a thief',
        effect() {
          startingClass = 'thief';
        }
        prerequisite(choices) {
          return choices.toughChoice === 'beBad'
        }
      }
    });

  Choices.run({
    scenarios: [           // a list of scenarios, ran in the order they are defined
      scenario,
      secondScenario
    ],
    socket                 // socket to emit input-events to
    say                   // function to broadcast to socket or player
  })
  .then(() => socket.emit('done'));

  ```

*/

class Scenario {
  constructor(name, config) {
    if (!name || !config) throw new Error('Your scenario must have a name and a configuration.');
    if (!config.title && !config.description) throw new Error('Your scenario must have either a title or a description.');

    this.name = name;
    this.title = config.title || 'Choose wisely';
    this.description = config.description || '';
    this.config = config;

    this.options = [];
  }

  addOptions(options) {
    if (!(options && typeof options === 'object')) throw new Error('You must provide an object or array for your options.')
    for (const [id, option] in Object.entries(options)) {
      this.options.push(new Option(id, option));
    }
  }
}

class Option {
  constructor(id, config) {
    if (!config.description) throw new Error('Your option should have a description.')
    this.id = id;
    this.description = config.description;
    this.effect = typeof config.effect === 'function' ? config.effect : () => {};
    this.prerequisite = typeof config.prerequisite === 'function' ? config.prerequisite : () => true;
  }
}

module.exports = class Choices {
  constructor({scenarios, socket, say}) {
    if (!scenarios || !scenarios.length) {
      throw new Error('Your choices must include an Array of at least one scenario.');
    }
    if (!socket || !socket.emit) {
      throw new Error('You must specify a socket that is EventEmitter-like.');
    }
    if (!say || typeof say !== 'function') {
      throw new Error('You must specify a valid say function.');
    }

    this.scenarios = scenarios;
    this.socket = socket;
    this.say = say;
    this.decisions = {};
  }

  decideAll() {
    return this.scenarios.reduce(
      (previous, scenario) => previous.then(this.decide.bind(this, scenario)),
      Promise.resolve()
    );
  }

  decide(scenario) {
    //TODO: Add prerequisite for scenarios and choices.
    return new Promise((resolve) => {
      const redo = () => this.decide(scenario).then(resolve);
      this.say(scenario.title);

      if (scenario.description) {
        this.say(scenario.description);
      }

      this.say();
      this.scenario.choices
        .filter((choice) => choice.prerequisite.call(this, this.decisions))
        .forEach((choice, i) => {
          say(`| <cyan>[${i + 1}]</cyan> ${choice.description}`);
          say('|\r\n`-> ');
        });

      this.socket.on('data', (data) => {
        const selection = parseInt(data, 10);
        if (isNaN(selection)) {
          this.say('Invalid selection...');
          return redo();
        }

        scenario.
      });

    });
  }

  static createScenario(name, config) {
    return new Scenario(name, config);
  }

  static run(config) {
    let choices;

    try {
      choices = new Choices(config);
    } catch(e) {
      console.log(e);
      return Promise.resolve('Failed, please contact an Admin.');
    }

    return choices.decideAll();
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

  // async run({ socket, say, write }) {
  //   Broadcast = Broadcast || require(srcPath + 'Broadcast');

  //   say(`\r\n|${Broadcast.line(40)}`);
  //   say(`|${Broadcast.center(40, `${this.background.name}'s Story'`)}`);
  //   say(`|${Broadcast.line(40)}`);

  //   for (const scenario of this.scenarios) {
  //     const choice = await this.runSingleScenario({
  //       socket, say, write, scenario
  //     });
  //     if (this.choices[scenario.id]) {
  //       this.choices[scenario.id].push(choice);
  //     } else {
  //       this.choices[scenario.id] = [choice];
  //     }
  //   }
  // }

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