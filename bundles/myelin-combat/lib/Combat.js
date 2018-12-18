
'use strict';

const Damage       = require('../../../src/Damage');
const Random       = require('../../../src/RandomUtil');
const Logger       = require('../../../src/Logger');
const Broadcast    = require('../../../src/Broadcast');
const RandomUtil   = require('../../../src/RandomUtil');
const Parser       = require('../../../src/CommandParser').CommandParser;

const CombatErrors = require('./CombatErrors');
const DamageType   = require('./DamageType');
const Speed        = require('./Speed');

/**
 * CONSTANTS
 */
const DEFAULTS = {
  ROUND_DURATION:        10 * 1000,

  ATTACKS_PER_ROUND:     2,
  MIN_ATTACKS_PER_ROUND: 1,
  MAX_ATTACKS_PER_ROUND: 5,

  WEAPON_SPEED:          Speed.average,
  WEAPON_STAT:           'quickness',
  WEAPON_LEVEL:          10,

  MIN_SPEED_MOD:         0.1,
  MAX_SPEED_MOD:         2
};

/**
 * This class is a combat system designed around an attacks-per-round semi-realtime system.
 * It is fairly similar to base Ranvier but the attack lag is based on initiative + (round_duration / attacks_per_round)
 */
class Combat {
  /**
   * Handle a single combat round for a given attacker
   * @param {GameState} state
   * @param {Character} attacker
   * @return {boolean}  true if combat actions were performed this round
   */
  static updateRound(state, attacker) {
    if (attacker.getAttribute('health') <= 0) {
      Combat.handleDeath(state, attacker);
      return false;
    }

    if (!attacker.isInCombat()) {
      if (attacker.party) {
        const partyMemberHasOpponent = [...attacker.party].find(partyMember => partyMember.room === attacker.room && partyMember.isInCombat());
        if (partyMemberHasOpponent) {
          attacker.initiateCombat(RandomUtil.fromArray([...partyMemberHasOpponent.combatants]));
          return true;
        }
      }
      if (!attacker.isNpc) {
        attacker.removePrompt('combat');
      }
      return false;
    }

    let lastRoundStarted = attacker.combatData.roundStarted;
    attacker.combatData.roundStarted = Date.now();

    // cancel if the attacker's combat lag hasn't expired yet
    if (attacker.combatData.lag > 0) {
      const elapsed = Date.now() - lastRoundStarted;
      attacker.combatData.lag -= elapsed;
      attacker.emit('cannotAttack'); // May use skills though.
      return false;
    }

    // currently just grabs the first combatant from their list but could easily be modified to
    // implement a threat table and grab the attacker with the highest threat
    let target = null;
    try {
      target = Combat.chooseCombatant(attacker);
    } catch (e) {
      attacker.removeFromCombat();
      attacker.combatData = {};
      throw e;
    }

    // no targets left, remove attacker from combat
    if (!target) {
      attacker.removeFromCombat();
      // reset combat data to remove any lag
      attacker.combatData = {};
      return false;
    }

    if (attacker.hasEffectType('skill:stun')) {
      let shouldAnnounce = true;
      if (!attacker.lastAnnouncedStun) {
        attacker.lastAnnouncedStun = Date.now();
      } else {
        if (Date.now() - attacker.lastAnnouncedStun >= 4000) {
          attacker.lastAnnouncedStun = Date.now();
        } else {
          shouldAnnounce = false;
        }
      }

      if (shouldAnnounce) {
        if (!attacker.isNpc) Broadcast.sayAt(attacker, '<yellow><b>You are stunned!</b></yellow>');
        if (!target.isNpc) Broadcast.sayAt(target, `<yellow>${attacker.name} is stunned!</yellow>`);
      }

      return false;
    }

    Combat.makeAttack(attacker, target);
    return true;
  }

  /**
   * Find a target for a given attacker
   * @param {Character} attacker
   * @return {Character|null}
   */
  static chooseCombatant(attacker) {
    if (!attacker.combatants.size) {
      return null;
    }

    for (const target of attacker.combatants) {
      if (!target.hasAttribute('health')) {
        throw new CombatErrors.CombatInvalidTargetError();
      }
      if (target.getAttribute('health') <= 0 ||
         attacker.room !== target.room) {
        attacker.removeCombatant(target);
      }
      if (target.getAttribute('health') > 0) {
        return target;
      }
    }

    return null;
  }

  static getDamageType(entity) {
    if (entity.damageType) return entity.damageType;

    const damageType = entity.metadata && entity.metadata.damageType;
    if (Array.isArray(damageType)) {
      return damageType.map(type => getSingleDamageType(type));
    }
    return [getSingleDamageType(damageType)];

    function getSingleDamageType(entity) {
      return typeof damageType === 'string'
        ? DamageType[damageType]
        : (typeof damageType === 'symbol' ? damageType : DamageType.CRUSHING);
    }
  }

  /**
   * Decides if it is possible for the entity to be harmed.
   * Rename this since NPCs can use it now.
   * @param {Character} attacker
   * @param {Character} defender
   */
  static canPvP(attacker, defender) {
    if (attacker === defender) return false;

    if (attacker.isNpc) {
      return Combat.npcShouldAggro(attacker, defender)
    }

    if (attacker.party) {
      if (attacker.party.has(defender) || attacker.party.invited.has(defender)) {
        console.log('Safe due to party');
        return false;
      }
    }

    if (defender.isNpc) {
      return true;
    }

    // Cannot attack from enforced/optional into a safe zone.
    if (defender.room.area.info.pvp === 'safe') {
      return false;
    }

    // If both are either opted in and in an optional zone, or in an enforced zone,
    // then the defender can be harmed.
    // No attacking into an enforced zone from a safe one.
    const isEnforced   = entity => entity.room.area.info.pvp === 'enforced';
    const isOptedIn    = entity => entity.room.area.info.pvp === 'optional' && entity.metadata.pvp === true;
    const isPvPEnabled = entity => (isEnforced(entity) || isOptedIn(entity));
    console.log('Deciding if PVP is enabled :/');
    return isPvPEnabled(attacker) && isPvPEnabled(defender);
  }

  static npcShouldAggro(attacker, defender) {
    const aggro = attacker.getBehavior('ranvier-aggro');
    if (aggro && aggro.towards) {
      if (aggro.towards.npcs && defender.isNpc) {
        return aggro.towards.npcs.includes(defender.name);
      }
      if (aggro.towards.players && Array.isArray(aggro.towards.players)) {
        return aggro.towards.players.includes(defender.name);
      }
      if (aggro.towards.players === true) {
        return !defender.isNpc;
      }
    }
    return false;
  }

  static getValidSplashTargets(attacker) {
    return [...attacker.room.npcs, ...attacker.room.players]
      .filter((target) => Combat.canPvP(attacker, target));
  }

  static getSplashChance(attacker, target) {
    target = target || {getAttribute() { return 0; }};

    return Math.min(
      Math.max(
        5,
        15 + attacker.getAttribute('intellect') - target.getAttribute('quickness')
    ), 95);
  }

  /**
   * Actually apply some J from an attacker to a target
   * @param {Character} attacker
   * @param {Character} target
   */
  static makeAttack(attacker, target) {
    const amount = attacker.hasEffectType('skill:stun') ? 0 : this.calculateWeaponDamage(attacker);
    const damage = new Damage({ attribute: 'health', amount, attacker });
    const type = Combat.getDamageTypeFromAttacker(attacker);
    damage.type = type;
    damage.commit(target);

    if (target.getAttribute('health') <= 0) {
      target.combatData.killedBy = attacker;
    }

    // currently lag is really simple, the character's weapon speed = lag
    const attacks = this.getWeaponSpeed(attacker);
    const initiative = this.getInitiative(attacker, target);
    attacker.combatData.lag = initiative + (DEFAULTS.ROUND_DURATION / attacks);
  }

  /**
   * Any cleanup that has to be done if the character is killed
   * @param {Character} deadEntity
   * @param {?Character} killer Optionally the character that killed the dead entity
   */
  static handleDeath(state, deadEntity, killer) {
    deadEntity.removeFromCombat();

    killer = killer || deadEntity.combatData.killedBy;
    Logger.log(`${killer ? killer.name : 'Something'} killed ${deadEntity.name}.`);

    if (killer) {
      killer.emit('deathblow', deadEntity);
    }
    deadEntity.emit('killed', killer);

    if (deadEntity.isNpc) {
      state.MobManager.removeMob(deadEntity);
      deadEntity.room.area.removeNpc(deadEntity);
    }
  }

  static startRegeneration(state, entity) {
    if (entity.hasEffectType('regen')) {
      return;
    }

    const regenEffect = state.EffectFactory.create('regen', entity, { hidden: true }, { magnitude: 15 });
    if (entity.addEffect(regenEffect)) {
      regenEffect.activate();
    }
  }

  /**
   * @param {string} args
   * @param {Player} player
   * @return {Entity|null} Found entity... or not.
   */
  static findCombatant(attacker, search) {
    if (!search.length) {
      return null;
    }

    let possibleTargets = [...attacker.room.npcs];
    if (attacker.getMeta('pvp')) {
      possibleTargets = [...possibleTargets, ...attacker.room.players];
    }

    const target = Parser.parseDot(search, possibleTargets);

    if (!target) {
      return null;
    }

    if (target === attacker) {
      throw new CombatErrors.CombatSelfError("You smack yourself in the face. Ouch!");
    }

    if (!target.hasAttribute('health')) {
      throw new CombatErrors.CombatInvalidTargetError("They are immortal.");
    }

    if (!Combat.canPvP(attacker, target)) {
      throw new CombatErrors.CombatNonPvpError(`${target.name} has not opted into PvP.`, target);
    }

    if (target.pacifist) {
      throw new CombatErrors.CombatPacifistError(`${target.name} is a pacifist and will not fight you.`, target);
    }

    return target;
  }

  /**
   * Generate an amount of weapon damage
   * @param {Character} attacker
   * @param {boolean} average Whether to find the average or a random between min/max
   * @return {number}
   */
  static calculateWeaponDamage(attacker, average = false) {
    let weaponDamage = this.getWeaponDamage(attacker);
    let amount = 0;
    if (average) {
      amount = (weaponDamage.min + weaponDamage.max) / 2;
    } else {
      amount = RandomUtil.inRange(weaponDamage.min, weaponDamage.max);
    }

    return amount;
  }

  /**
   * Get the damage of the weapon the character is wielding
   * @param {Character} attacker
   * @return {{max: number, min: number}}
   */
  static getWeaponDamage(attacker) {
    const weapon = attacker.equipment.get('wield');
    const might = attacker.getAttribute('might') || 1;
    let min = 0, max = 0;
    if (weapon) {
      const {minDamage, maxDamage} = weapon.metadata;
      const {damageType} = weapon;
      const bonus = Combat.getAttrBonus(attacker, damageType);
      min = minDamage + bonus;
      max = maxDamage + bonus;
    } else {
      if (attacker.isNpc) {
        const {damageType} = attacker;
        const bonus = Combat.getAttrBonus(attacker, damageType);
        min = (attacker.metadata.minDamage || 1) + bonus || 1;
        max = (attacker.metadata.maxDamage || 1) + bonus || 1;
      } else {
        min = min + 1;
        max = max + 1 + (Math.ceil(might / 4));
      }
    }

    // TODO: Make into a method, use in the 'score' display for weapon damage.

    return {
      max,
      min
    };
  }

  static getAttrBonus(attacker, damageType) {
    const isMight = damageType.includes(DamageType.CRUSHING);
    const isQuickness = damageType.some(type => [DamageType.SLASHING, DamageType.PIERCING].includes(type));
    if (isMight && isQuickness) {
      const might = attacker.getAttribute('might');
      const quickness = attacker.getAttribute('quickness');
      return Math.ceil((might + quickness) / 8);
    }

    if (isMight) {
      return Math.ceil(attacker.getAttribute('might') / 4);
    }
    if (isQuickness) {
      return Math.ceil(attacker.getAttribute('quickness') / 4);
    }

    if (DamageType.isPsionic(damageType)) {
      const intellect = attacker.getAttribute('intellect');
      const willpower = attacker.getAttribute('willpower');
      return Math.ceil((intellect + willpower) / 8);
    }

    return 0;
  }

  static getDamageTypeFromAttacker(attacker) {
    const weapon = attacker.equipment.get('wielded');
    if (weapon) {
      return weapon.damageType || [DamageType.CRUSHING];
    }
    return attacker.damageType || [DamageType.CRUSHING];
  }

  static getInitiative(attacker, target) {
    const diff = Math.max(
      -5,
      Math.min(
        target.getAttribute(DEFAULTS.WEAPON_STAT) - attacker.getAttribute(DEFAULTS.WEAPON_STAT),
        5
      )
    );
    return Math.max((diff * 100) + Random.inRange(-500, 500), 100);
  }

  /**
   * Get the speed of the currently equipped weapon
   * @param {Character} attacker
   * @return {number} attacksPerRound -- higher is better
   */
  static getWeaponSpeed(attacker) {
    const weapon = attacker.equipment.get('wield');
    let weaponModifier = 1;
    let statModifier   = 1;

    if (attacker.isNpc) {
      const speed = Speed[attacker.metadata.speed] || DEFAULTS.WEAPON_SPEED;
      return speed.attacks || 2;
    }

    // Set weapon-specific speed modifier and weapon-stat-level-scaled modifier.
    if (!attacker.isNpc && weapon) {
      const weaponSpeedKey  = weapon.metadata.speed;
      const weaponSpeed     = Speed[weaponSpeedKey] || DEFAULTS.WEAPON_SPEED;
      weaponModifier        = weaponSpeed.rate;

      const weaponStatName  = weapon.metadata.stat  || DEFAULTS.WEAPON_STAT;
      const weaponStatReq   = weapon.metadata.level || DEFAULTS.WEAPON_LEVEL;
      const weaponStatValue = attacker.getAttribute(weaponStatName) || 0;
      if (weaponStatValue > 0) {
        statModifier = Combat.getStatSpeedModifier(weaponStatValue, weaponStatReq);
      } else {
        Logger.warn(`[COMBAT] Potentially invalid weapon stat: ${weaponStat}, got ${playerStat}.`);
      }
    }

    // If melee, just use default stat modifier again.
    if (!attacker.isNpc && !weapon) {
      weaponSpeedModifier = statSpeedModifier
    }

    const speed = Combat.calculateSpeed(weaponModifier, statModifier);
    console.log('Calculated speed...', speed);
    return speed;
  }

  /**
   * Takes a value and prerequisite for a weapon and returns the speed modifier within pre-determined bounds.
   * @param {number} value
   * @param {number} required
   */
  static getStatSpeedModifier(value, required) {
    return Math.max(
      DEFAULTS.MIN_SPEED_MOD,
      Math.min(
        DEFAULTS.MAX_SPEED_MOD,
        value / required
      )
    ) || 1;
  }

  /**
   * Takes a couple of modifiers and figures out how many attacks per round the character gets.
   * @param {number} weaponModifier
   * @param {number} statModifier
   * @returns {number} attacksPerRound
   */
  static calculateSpeed(weaponModifier, statModifier) {
    const meanModifier = (weaponModifier + statModifier) / 2;
    const modifiedAttacksPerRound = DEFAULTS.ATTACKS_PER_ROUND * meanModifier;
    return Math.ceil(
      Math.max(
      DEFAULTS.MIN_ATTACKS_PER_ROUND,
      Math.min(
        DEFAULTS.MAX_ATTACKS_PER_ROUND,
        modifiedAttacksPerRound
      )
    ));
  }
}

module.exports = Combat;
