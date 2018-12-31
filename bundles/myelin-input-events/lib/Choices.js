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
    .addChoices({
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
    .addChoices({
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
    this.prerequisite = typeof config.prerequisite === 'function' ? config.prerequisite : null;
    this.config = config;
    this.decided = false;

    this.choices = [];
  }

  addChoices(choices) {
    if (!(choices && typeof choices === 'object')) throw new Error('You must provide an object or array for your choices.')
    for (const [id, choice] of Object.entries(choices)) {
      this.choices.push(new Choice(id, choice));
    }

    return this;
  }

  setPrerequisite(predicate) {
    if (this.prerequisite || typeof predicate !== 'function') throw new Error('You can only provide one prerequisite per scenario, and it must be a function.');

    this.prerequisite = predicate;

    return this;
  }
}

class Choice {
  constructor(id, config) {
    if (!config.description) throw new Error('Your choice should have a description.')
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
    return new Promise((resolve) => {
      const predicate = scenario.prerequisite && scenario.prerequisite.bind(scenario);
      const shouldAsk = predicate ? predicate(Object.assign({}, this.decisions)) : true;
      
      if (!shouldAsk) {
        this.decisions[scenario.name] = false;
        return resolve();
      }

      if (scenario.decided) {
        return resolve();
      }

      const redo = () => this.decide(scenario).then(resolve);
      this.say('');
      this.say(scenario.title);

      if (scenario.description) {
        this.say(scenario.description);
      }

      this.say('');

      const validChoices = scenario.choices
        .filter((choice) => choice.prerequisite.call(this, this.decisions));

      validChoices.forEach((choice, i) => 
        this.say(`| <cyan>[${i + 1}]</cyan> ${choice.description}`)
      );

      this.say('|\r\n`-> ');

      this.socket.once('data', (data) => {
        const input = parseInt(data, 10) - 1;
        if (isNaN(input) || !validChoices[input]) {
          this.say('Invalid selection...');
          return redo();
        }

        const selection = validChoices[input];
        selection.effect.call(this, scenario);
        this.decisions[scenario.name] = selection.id;
        resolve();
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

    return choices.decideAll.call(choices);
  }
}