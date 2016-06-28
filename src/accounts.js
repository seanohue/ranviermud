'use strict';
const crypto = require('crypto');

const Accounts = function() {
  this.accounts = [];
};

const Account = function() {

  this.username   = '';
  this.characters = [];
  this.password   = null;
  this.karma      = 0;
  this.uid        = null;
  this.score = {
    totalKarma:    0,
    totalKills:    0,
    totalExplored: 0,
    totalLevels:   0,
    grandTotal:    0,
  };

  /* Mutators */
  this.getUsername  = ()   => this.username;
  this.setUsername  = name => this.username = name;

  this.setUuid = uid => this.uid = uid;
  this.getUuid = ()  => this.uid;

  this.addCharacter  = char => this.characters.push(char);
  this.getCharacters = ()   => this.characters;
  this.getCharacter  = uid  => this.characters.find(
    char => uid === char.getUuid());

  this.getLivingCharacters = () =>
    this.characters.filter(char => char.isAlive);
  this.getDeadCharacters   = () =>
    this.characters.filter(char => !char.isAlive);

  this.getPassword = ()   => this.password; // Returns hash.
  this.setPassword = pass =>
    this.password  = crypto
      .createHash('md5')
      .update(pass)
      .digest('hex');

  this.getKarma    = ()    => this.karma;
  this.deductKarma = karma => this.karma -= karma;
  this.addKarma    = karma => {
    this.karma += karma;
    this.score.totalKarma += karma;
  };

  this.getScore = key => key ? this.score[key] : this.score;

  this.updateScore = () => {
    const sumScore = score =>
      (sum, char) => char[score].length ? sum + char[score].length : sum;

    this.score.totalKilled = this.characters
      .reduce(sumScore('killed'), 0);

    this.score.totalExplored = this.characters
      .reduce(sumScore('explored'), 0);

    this.score.totalLevels = this.characters
      .reduce((sum, char) => sum + char.level, 0);

    const sumGT = obj => {
      const scoring = {
        'Killed':   n => Math.round(n / 50),
        'Explored': n => Math.round(n / 40),
        'Levels':   n => Math.round(n / 5),
        'Karma':    n => n,
      };

      let points = 0;
      for (const conversion in scoring) {
        const converter = scoring[conversion];
        const total     = 'total' + conversion;
        const amount    = this.score[total];

        points += converter(amount);
      }
      return points;
    };

    this.score.grandTotal = sumGT(this.score);
    console.log(this.score);
  };

  return this;
};

module.exports = { Accounts, Account };
