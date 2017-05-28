'use strict';

class HelpManager {
  constructor() {
    this.helps = new Map();
  }

  get(help) {
    return this.helps.get(help);
  }

  add(help) {
    this.helps.set(help.name, help);
  }

  findByAliases(search, state) {
    for (const [ _, help ] of this.helps.entries()) {
      if (!help.command) { continue; }
      const aliases = help.getAliases(state);
      if (aliases.includes(search)) {
        return help;
      }
    }
    return null;
  }

  /**
   * @param {string} search
   * @return {Help}
   */
  find(search, state) {
    const results = new Map();
    for (const [ name, help ] of this.helps.entries()) {
      if (name.indexOf(search) === 0) {
        results.set(name, help);
        continue;
      }
      if (help.keywords.some(keyword => keyword.includes(search))) {
        results.set(name, help);
      }
      if (help.getAliases(search, state).some(alias => alias.includes(search))) {
        results.set(name, help);
      }
    }
    return results;
  }
}

module.exports = HelpManager;

