'use strict';

/*
Ability Types
Skills:
    Something anyone can do with practice.
    Potentially degrade with disuse, improve with use.
    Ex: swim, climb, lockpick, general combat skills like dodge

Feats:
    A special ability (psionic or physical) that is intrinsic and possibly supernatural.
    Does not degrade. Does not improve with use.
    Ex: fireball, heal, specific combat skills like rend, passives like secondwind

Mutations:
   An outward change that allows for active and/or passive usage,
   linked to the physical change.
   Heavy physical damage to that area may impede usage of the mutation.
   Ex: leatherskin, extra arm, feathering, mutated legs for +speed/+jumping
*/
module.exports = {
  SKILL:    Symbol("SKILL"),
  FEAT:     Symbol("FEAT"),
  FEAT:     Symbol("FEAT"),
  MUTATION: Symbol("MUTATION")
};

