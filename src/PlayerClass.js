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
   * Table of abilityName: prerequisites.
   * Example:
   *   lunge: {
   *      level:     4,
   *      agility:  12,
   *      strength: 12
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
    for (const [ ability, prerequisites ] in abilities) {
      const isEligible = this.determineEligibility(prerequisites, player);
      if (isEligible) {
        totalAbilities.push(ability);
      }
    }
    return totalAbilities;
  }

  /** Given a hash of prerequisites, determine if the player meets all of them or not.
   * @param {Object<string,number>} prerequisites
   * @param {Player}
   * @return {Boolean}
  */
  determineEligibility(prerequisites, player) {
    const prereqList = Object.entries(prerequisites);
    return prereqList.every(([ attribute, level ]) => {
      if (attribute === 'cost') {
        const abilityPoints = parseInt(player.getMeta('abilityPoints'), 10)
        return abilityPoints >= cost;
      }
      return player.getBaseAttribute(attribute) >= level;
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
    return this.getAbilitiesForPlayer(player)
               .includes(abilityId);
  }

  /**
   * Check if a player can use a given ability
   * @param {Player} player
   * @param {string} abilityId
   * @return {boolean}
   */
  canUseAbility(player, abilityId) {
    return player.getMeta('purchasedAbilities')
                 .includes(abilityId);
  }
}

module.exports = PlayerClass;
