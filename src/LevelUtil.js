'use strict';

/**
* These formulas are stolen straight from WoW.
* See: http://www.wowwiki.com/Formulas:XP_To_Level
*/

/**
 * Extra difficulty factor to level
 * @param {number} level
 */
const reduction = level => {
  switch (true) {
    case (level <= 10):
      return 1;
    case (level >= 11 && level <= 27):
      return 1 - (level - 10) / 100;
    case (level >= 28 && level <= 59):
      return 0.82;
    default:
      return 1;
  }
};

/**
* Difficulty modifier starting around level 30
* @param int level
* @return int
*/
const diff = level => {
  switch (true) {
    case (level <= 28):
      return 0;
    case (level === 29):
      return 1;
    case (level === 30):
      return 3;
    case (level === 31):
      return 6;
    case (level >= 32):
    case (level <= 59):
      return 5 * (level - 30);
  }
};

/**
* Get the exp that a mob gives
* @param int level
* @return int
*/
const mobExp = level => 45 + (5 * level);


/**
* Helper to get the amount of experience a player needs to level
* @param int level Target level
* @return int
*/
const expToLevel = level => Math.floor(((4 * level) + diff(level)) * mobExp(level) * reduction(level));


module.exports = {
  expToLevel,
  mobExp,
};
