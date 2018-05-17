
'use strict';

const Random = require('../../../src/RandomUtil');
const Damage = require('../../../src/Damage');
const Logger = require('../../../src/Logger');
const Broadcast = require('../../../src/Broadcast');
const RandomUtil = require('../../../src/RandomUtil');
const CombatErrors = require('./CombatErrors');
const Parser = require('../../../src/CommandParser').CommandParser;

/**
 * This class is an example implementation of a Diku-style real time combat system. Combatants
 * attack and then have some amount of lag applied to them based on their weapon speed and repeat.
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
      if (!attacker.isNpc) {
        attacker.removePrompt('combat');
      }
      return false;
    }

    let lastRoundStarted = attacker.combatData.roundStarted;
    attacker.combatData.roundStarted = Date.now();

    // cancel if the attacker's combat lag hasn't expired yet
    if (attacker.combatData.lag > 0 || attacker.hasEffectType('skill:stun')) {
      const elapsed = Date.now() - lastRoundStarted;
      attacker.combatData.lag -= elapsed;
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
      if (target.getAttribute('health') > 0) {
        return target;
      }
    }

    return null;
  }

  /**
   * Damage soak when a character is hit, based on stats and skills.
   * @param {Character} defender
   * @param {Number} amount of raw damage done by attack
   */
  static calculateDefense(defender, amount, attacker, isPsionic) {
    const isStunned = defender.hasEffectType('skill:stun');
    if (isPsionic) {
      const willpower = defender.getMaxAttribute('willpower');
      return Math.max(1, willpower - isStunned ? 10 : 0);
    }


    // Stats always used in defense.
    const quickness = defender.getMaxAttribute('quickness') || 1;
    const intellect = defender.getMaxAttribute('intellect') || 1;
    const armor     = defender.getMaxAttribute('armor')     || 0;


    if (isStunned) return armor;

    // Defensive skills.
    const dodge = defender.isNpc && defender.skills.has('dodge');
    const blocking = defender.isNpc && defender.skills.has('block');

    if (dodge && Random.probability((quickness + intellect) + 1)) {
      if (!defender.isNpc) Broadcast.sayAt(defender, 'You dodge the attack!');
      if (!attacker.isNpc) Broadcast.sayAt(attacker, `${defender.name} dodges your attack!`);
      console.log(`${defender.name} dodges.`);
      return amount;
    }

    if (blocking) {
      const willpower  = defender.getMaxAttribute('willpower') || 1;
      const might      = defender.getMaxAttribute('might')     || 1;
      if (Random.probability(willpower + might + 10)) {
        if (!defender.isNpc) Broadcast.sayAt(defender, 'You block the attack.');
        if (!attacker.isNpc) Broadcast.sayAt(attacker, `${defender.name} blocks your attack!`);

        return willpower + might + armor;
      }
    }

    const def =
      (quickness / 5)
      + (intellect / 5)
      + (dodge ? 1 : 0)
      + (blocking ? 1 : 0)
      + armor;
    return Random.inRange(armor, Math.ceil(def));
  }

  /**
   * Actually apply some J from an attacker to a target
   * @param {Character} attacker
   * @param {Character} target
   */
  static makeAttack(attacker, target) {
    console.log(attacker.name, attacker.effects.effects);
    const rawDamageAmount = attacker.hasEffectType('skill:stun') ? 0 : this.calculateWeaponDamage(attacker);
    const isPsionic = attacker.metadata && attacker.metadata.damageType === 'psionic';
    const amount = Math.max(rawDamageAmount - this.calculateDefense(target, rawDamageAmount, attacker, isPsionic), 0);
    const damage = new Damage({ attribute: 'health', amount, attacker });
    damage.commit(target);

    if (target.getAttribute('health') <= 0) {
      target.combatData.killedBy = attacker;
    }

    // currently lag is really simple, the character's weapon speed = lag
    attacker.combatData.lag = this.getWeaponSpeed(attacker) * 1000;
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

    let regenEffect = state.EffectFactory.create('regen', entity, { hidden: true }, { magnitude: 15 });
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
      throw new CombatErrors.CombatInvalidTargetError("You can't attack that target");
    }

    if (!target.isNpc && !target.getMeta('pvp')) {
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

    return this.normalizeWeaponDamage(attacker, amount);
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
      min = weapon.metadata.minDamage;
      max = weapon.metadata.maxDamage;
    } else {
      if (attacker.isNpc) {
        min = attacker.metadata.minDamage || 1;
        max = attacker.metadata.maxDamage || 1 + might;
      } else {
        const martialArtsSkill = this.getMartialSkillBonus(attacker);
        min = min + (1 * martialArtsSkill);
        max = max + (might * martialArtsSkill);
      }
    }

    return {
      max,
      min
    };
  }

  /**
   * Get the speed of the currently equipped weapon
   * @param {Character} attacker
   * @return {number}
   */
  static getWeaponSpeed(attacker) {
    let intBonus = (attacker.getAttribute('intellect') || 0) * 0.15;
    let quickBonus = (attacker.getAttribute('quickness') || 1) * 0.25; 

    const statBonus = Math.min((intBonus + quickBonus), 8);

    const weapon = attacker.equipment.get('wield');
    let weaponBonus = 0;
    if (!attacker.isNpc && weapon) {
      weaponBonus = (weapon.metadata.speed || 1) * 0.25;
      weaponBonus = Math.min(8, weaponBonus);
    }

    if (!attacker.isNpc && !weapon) {
      weaponBonus = this.getMartialSkillBonus(attacker);
    }

    const speed = Math.max(
      10 - statBonus - weaponBonus,
      1.5
    );

    return speed;
  }

  static getMartialSkillBonus(attacker) {
    if (!attacker || !attacker.skills) {
      console.log('No attacker or no skills.', attacker && attacker.skill);
      return 1;
    }
    return attacker.skills.has('martial_arts_2') 
    ? 5 
    : attacker.skills.has('martial_arts_1')
      ? 3
      : 1;
  }

  /**
   * Get a damage amount adjusted by attack power/weapon speed
   * @param {Character} attacker
   * @param {number} amount
   * @return {number}
   */
  static normalizeWeaponDamage(attacker, amount) {
    let speed = this.getWeaponSpeed(attacker);
    amount += attacker.hasAttribute('might') ? attacker.getAttribute('might') : 0;
    return Math.round(amount / 3.5 * speed);
  }
}

module.exports = Combat;
