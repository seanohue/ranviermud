'use strict';

/** Classless system:
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
   * @param {object} config Definition, this object is completely arbitrary. In
   *     this example implementation it has a name, description, and ability
   *     table. You are free to change this class as you wish
   */
  constructor(id, config) {
    this.id = id;
    this.config = config;
  }

  /**
   * Override this method in your class to do initial setup of the player. This
   * includes things like adding the resource attribute to the player or anything
   * else that should be done when the player is initially given this class
   * @param {Player} player
   */
  setupPlayer(player) {
    if (typeof this.config.setupPlayer === 'function') {
      this.config.setupPlayer(player);
    }
  }

  /**
   * Table of skill => prerequisites & their values.
   * Example:
   *   lunge: {
   *      level:     4,
   *      quickness:  12,
   *      might: 12
   *    },
   * @type {Object<string, Object<string, number>>}
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

  // Retrieve list of abilities that have been
  // learned by this player.
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
    return this.canUseAbility(player, abilityId) &&
               !this.getOwnAbilitiesForPlayer(player).includes(abilityId);
  }

  /**
   * Check if a player can use a given ability
   * @param {Player} player
   * @param {string} abilityId
   * @return {boolean}
   */
  canUseAbility(player, abilityId) {
    return this.getOwnAbilitiesForPlayer(player)
               .includes(abilityId);
  }
}

module.exports = PlayerClass;
