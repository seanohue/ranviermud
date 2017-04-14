'use strict';
const bcrypt = require('bcryptjs');
const Data   = require('./Data');
const Config  = require('./Config');

class Account {

  constructor(data) {
    this.username   = data.username;
    this.characters = data.characters || [];
    this.password   = data.password;
    this.meta       = data.meta || { karma: 0 };
    this.banned = data.banned || false;
  }

  getUsername() {
    return this.username;
  }

  addCharacter(username) {
    this.characters.push(username);
  }

  hasCharacter(name) {
    return this.characters.indexOf(name) !== -1;
  }

  setPassword(pass) {
    this.password = this._hashPassword(pass);
    this.save();
  }

  checkPassword(pass) {
    return bcrypt.compareSync(pass, this.password);
  }

  save(callback) {
    Data.save('account', this.username, this, callback);
  }

  ban() {
    this.banned = true;
    this.save();

    // There is no unban because this can just be done by manually editing the account file
  }

  setMeta(key, value) {
    this.data[key] = value;
  }

  getMeta(key) {
    return this.data[key];
  }

  _hashPassword(pass) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(pass, salt);
  }

  static validateName(name) {
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
    return false;
  }

  serialize() {
    const {
      username,
      characters,
      password,
      meta
    } = this;

    return {
      username,
      characters,
      password,
      meta
    };
  }

}

module.exports = Account;
