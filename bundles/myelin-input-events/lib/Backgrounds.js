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
    .decide((chooser, definition) => {
      chooser.player.setAttributes(definition.attributes);
      definition.equipment.forEach(id => chooser.player.equip(id));
      chooser.socket.emit('done');
    });
  ```

*/

module.exports = class Background {
  /**
   * @class Background
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
  */
  constructor(background) {
    this.background = background;
    this.scenarios = [];
    this.activeScenario;
    this.choices = {};
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
}