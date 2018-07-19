'use strict';

/**
 * General functions used on the myelin-input-events bundle
 */

const srcPath = '../../../src/'
const Config  = require(srcPath + 'Config');

/**
 * @param {string} name
 * @return {boolean}
 */
exports.validateName = function(name, state) {
  const maxLength = Config.get('maxAccountNameLength');
  const minLength = Config.get('minAccountNameLength');

  if (!name) {
    return 'Please enter a name.';
  }
  if (name.length > maxLength) {
    return 'Too long, try a shorter name.';
  }
  if (name.length < minLength) {
    return 'Too short, try a longer name.';
  }
  if (!/^[a-z]+$/i.test(name)) {
    return 'Your name may only contain A-Z without spaces or special characters.';
  }

  if (state.NAME_BLACKLIST.includes(name)) {
    return 'Name not allowed.';
  }

  return false;
}

