'use strict';

class Attribute {
  constructor(name, base, delta = 0) {
    if (isNaN(base)) {
      throw new TypeError(`Base attribute must be a number, got ${base}.`);
    }
    if (isNaN(delta)) {
      throw new TypeError(`Attribute delta must be a number, got ${delta}.`);
    }
    if (typeof name !== 'string') {
      throw new TypeError(`Attribute name must be a string, got ${name}.`);
    }
    this.name = name;
    this.base = base;
    this.delta = delta;
  }

  lower(amount) {
    this.raise(-amount);
  }

  raise(amount) {
    const newDelta = Math.min(this.delta + amount, 0);
    this.delta = newDelta;
  }

  setBase(amount) {
    this.base = Math.max(amount, 0);
  }

  setDelta(amount) {
    this.delta = Math.min(amount, 0);
  }

  serialize() {
    const { delta, base } = this;
    return { delta, base };
  }

  get isDerived() {
    return [ 'physical', 'mental', 'attackpower', 'energy', 'armor' ].includes(this.name);
  }

  get [Symbol.toStringTag]() {
    return `Attribute(${this.name})`;
  }
}

module.exports = Attribute;
