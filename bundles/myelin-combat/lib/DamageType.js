'use strict';

/**
 * @enum {Symbol}
 */
const DamageType = {
  // PHYSICAL
  CRUSHING:   Symbol("CRUSHING"),
  PIERCING:   Symbol("PIERCING"),
  SLASHING:   Symbol("SLASHING"),

  PSIONIC:    Symbol("PSIONIC"),

  // ENVIRONMENTAL OR ELEMENTAL
  FIRE:       Symbol("FIRE"),
  ELECTRICAL: Symbol("ELECTRICAL"),
  FREEZING:   Symbol("FREEZING"),
  DROWNING:   Symbol("DROWNING"),

  // BIOLOGICAL
  POISON:     Symbol("POISON"),
  DISEASE:    Symbol("DISEASE"),
  BLEEDING:   Symbol("BLEEDING"),

  RESOURCE:   Symbol("RESOURCE"),

  isPhysical(types) {
    const {CRUSHING, PIERCING, SLASHING} = DamageType;
    return [].concat(types).some((type) => [CRUSHING, PIERCING, SLASHING].includes(type));
  },

  isPsionic(types) {
    return [].concat(types).includes(DamageType.PSIONIC);
  },

  isResource(types) {
    return [].concat(types).includes(DamageType.RESOURCE);
  },

  isElemental(types) {
    const {FIRE, BLEEDING, FREEZING, DROWNING} = DamageType;
    return [].concat(types).some(type => [FIRE, BLEEDING, FREEZING, DROWNING].includes(type));
  },

  isBiological(types) {
    const {POISON, DISEASE, BLEEDING} = DamageType;
    return [].concat(types).some(type => [POISON, DISEASE, BLEEDING].includes(type));
  }
};

module.exports = DamageType;
