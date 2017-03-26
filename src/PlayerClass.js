'use strict';

/** A Classless Society:
 * The player in Myelin does not really have a class.
 * Instead, they can develop their character to suit an
 * archetype by boosting attributes and purchasing skills
 * once they reach the skills' prerequisites.
 * Player characters do have a "background" which determines
 * only their starting attributes, skills, and equipment.
*/
class PlayerClass {
  /**
   * @param {string} id  id corresponding to classes/<id>.js file
   * @param {object} config The Myelin "base class" consists of a
   * config object describing the prerequisites for each ability.
   */
  constructor(id, config) {
    this.id = id;
    this.config = config;
  }

  /**
<<<<<<< HEAD
   * Table of abilityName: prerequisites.
=======
   * Override this method in your class to do initial setup of the player. This
   * includes things like adding the resource attribute to the player or anything
   * else that should be done when the player is initially given this class
   */
  setupPlayer(player) {
    if (typeof this.config.setupPlayer === 'function') {
      this.config.setupPlayer(player);
    }
  }

  /**
   * Table of level: abilities learned.
>>>>>>> staging
   * Example:
   *   lunge: {
   *      level:     4,
   *      quickness:  12,
   *      might: 12
   *    },
   * @return {Object<string, Object<string, number>>}
   */
  get abilityTable() {
    return this.config.abilityTable;
  }

  get abilityList() {
    return Object.keys(this.abilityTable.skills);
  }

  /**
   * Get a flattened list of all the abilities available to a given player
   * @param {Player} player
   * @return {Array<string>} Array of ability ids
   */
  getAbilitiesForPlayer(player) {
    let totalAbilities = [];
    const abilities = Object.entries(this.abilityTable.skills);
    for (const [ ability, prerequisites ] of abilities) {
      const isEligible = this.determineEligibility(prerequisites, player);
      if (isEligible) {
        totalAbilities = totalAbilities.concat(ability);
      }
    }
    return totalAbilities;
  }

  getOwnAbilitiesForPlayer(player) {
    return player.getMeta('abilities') || [];
  }

  /** Given a hash of prerequisites, determine if the player meets all of them or not.
   * @param {Object<string,number>} prerequisites
   * @param {Player}
   * @return {Boolean} isEligible
  */
  determineEligibility(prerequisites, player) {
    if (!prerequisites) {
      return true;
    }
    const prereqList = Object.entries(prerequisites);
    return prereqList.every(([ attribute, level ]) => {
      switch(attribute) {
        case 'cost':
          const abilityPoints = parseInt(player.getMeta('abilityPoints'), 10) || 0;
          return abilityPoints >= level;
        case 'level':
          return player.level >= level;
        default:
          return player.getBaseAttribute(attribute) >= level;
      }
    });
  }

  /** Does the ability even exist?
   * @param {String} id
   * @return {Boolean} exists
  */
  hasAbility(id) {
    return this.abilityList.includes(id);
  }

  /**
   * Check if a player can buy a given ability
   * @param {Player} player
   * @param {string} abilityId
   * @return {boolean}
   */
  canPurchaseAbility(player, abilityId) {
    const ownAbilities = this.getOwnAbilitiesForPlayer(player);
    return this.getAbilitiesForPlayer(player)
               .includes(abilityId) &&
               !ownAbilities.includes(abilityId);
  }

  /**
   * Check if a player can use a given ability
   * @param {Player} player
   * @param {string} abilityId
   * @return {boolean}
   */
  canUseAbility(player, abilityId) {
    return player.getMeta('abilities') &&
           player.getMeta('abilities').includes(abilityId);
  }
}

module.exports = PlayerClass;
