'use strict';

/**
 * @enum {Symbol}
 */
const DamageType = {
  // PHYSICAL
  PHYSICAL:   Symbol("PHYSICAL"),
  CRUSHING:   Symbol("CRUSHING"),
  PIERCING:   Symbol("PIERCING"),
  SLASHING:   Symbol("SLASHING"),

  PSIONIC:    Symbol("PSIONIC"),

  // ENVIRONMENTAL OR ELEMENTAL
  FIRE:       Symbol("FIRE"),
  BLEEDING:   Symbol("BLEEDING"),
  ELECTRICAL: Symbol("ELECTRICAL"),
  FREEZING:   Symbol("FREEZING"),
  DROWNING:   Symbol("DROWNING"),

  // BIOLOGICAL
  POISON:     Symbol("POISON"),
  DISEASE:    Symbol("DISEASE")
};

module.exports = DamageType;