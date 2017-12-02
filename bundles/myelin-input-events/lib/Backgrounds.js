module.exports = class Background {
  constructor(backgroundDef) {
    this.background = backgroundDef;
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