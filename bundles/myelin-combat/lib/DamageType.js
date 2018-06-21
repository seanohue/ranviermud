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


  isPhysical(type) {
    const {CRUSHING, PIERCING, SLASHING} = DamageType;
    return [CRUSHING, PIERCING, SLASHING].includes(type);
  },

  isPsionic(type) {
    return type === DamageType.PSIONIC;
  },

  isElemental(type) {
    const {FIRE, BLEEDING, FREEZING, DROWNING} = DamageType;
    return [FIRE, BLEEDING, FREEZING, DROWNING].includes(type);
  },

  isBiological(type) {
    const {POISON, DISEASE, BLEEDING} = DamageType;
    return [POISON, DISEASE, BLEEDING].includes(type);
  }
};

module.exports = DamageType;