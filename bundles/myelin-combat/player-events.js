'use strict';
const leftPad = require('left-pad');

const Combat = require('./lib/Combat');
const CombatErrors = require('./lib/CombatErrors');
const LevelUtil = require('../ranvier-lib/lib/LevelUtil');
const WebsocketStream = require('../ranvier-websocket/lib/WebsocketStream');

/**
 * Auto combat module
 */
module.exports = (srcPath) => {
  const B = require(srcPath + 'Broadcast');

  return  {
    listeners: {
      updateTick: state => function () {
        Combat.startRegeneration(state, this);

        let hadActions = false;
        try {
          hadActions = Combat.updateRound(state, this);
        } catch (e) {
          if (e instanceof CombatErrors.CombatInvalidTargetError) {
            B.sayAt(this, "You can't attack that target.");
          } else {
            throw e;
          }
        }

        if (!hadActions) {
          return;
        }

        const usingWebsockets = this.socket instanceof WebsocketStream;
        // don't show the combat prompt to a websockets server
        if (!this.hasPrompt('combat') && !usingWebsockets) {
          this.addPrompt('combat', _ => promptBuilder(this));
        }

        B.sayAt(this, '');
        if (!usingWebsockets) {
          B.prompt(this);
        }
      },

      /**
       * When the player hits a target
       * @param {Damage} damage
       * @param {Character} target
       */
      hit: state => function (damage, target) {
        const shouldBroadcast = !damage.hidden && (damage.ranged || (target.room === this.room)); 
        if (shouldBroadcast) {
          let buf = '';
          let verb = damage.verb || 'hit';
          if (damage.source) {
            buf = `Your <b>${damage.source.name}</b> ${verb}`;
          } else {
            buf = "You " + verb;
          }
  
          buf += ` <b>${target.name}</b> for <b>${damage.finalAmount}</b> damage.`;
  
          if (damage.critical) {
            buf += ' <red><b>(Critical)</b></red>';
          }
  
          B.sayAt(this, buf);
        }

        if (this.equipment.has('wield')) {
          this.equipment.get('wield').emit('hit', damage, target);
        }

        // show damage to party members
        if (!this.party || damage.hidden) {
          return;
        }

        for (const member of this.party) {
          if (member === this || (member.room !== target.room && member.room !== this.room)) {
            continue;
          }

          let buf = '';
          if (damage.source) {
            buf = `${this.name} <b>${damage.source.name}</b> hit`;
          } else {
            buf = `${this.name} hit`;
          }

          buf += ` <b>${target.name}</b> for <b>${damage.finalAmount}</b> damage.`;
          B.sayAt(member, buf);
        }
      },

      /**
       * @param {Heal} heal
       * @param {Character} target
       */
      heal: state => function (heal, target) {
        if (heal.hidden) {
          return;
        }

        if (target !== this) {
          let buf = '';
          if (heal.source) {
            buf = `Your <b>${heal.source.name}</b> healed`;
          } else {
            buf = "You heal";
          }

          buf += `<b> ${target.name}</b> for <b><green>${heal.finalAmount}</green></b> ${heal.attribute}.`;
          B.sayAt(this, buf);
        }

        // show heals to party members
        if (!this.party) {
          return;
        }

        for (const member of this.party) {
          if (member === this || member.room !== this.room) {
            continue;
          }

          let buf = '';
          if (heal.source) {
            buf = `${this.name} <b>${heal.source.name}</b> healed`;
          } else {
            buf = `${this.name} healed`;
          }

          buf += ` <b>${target.name}</b>`;
          buf += ` for <b><green>${heal.finalAmount}</green></b> ${heal.attribute}.`;
          B.sayAt(member, buf);
        }
      },

      damaged: state => function (damage) {
        if (damage.hidden || damage.attribute !== 'health') {
          return;
        }

        if (this.getAttribute('health') <= 0 && damage.attacker) {
          this.combatData.killedBy = damage.attacker;
        }

        let buf = '';
        if (damage.attacker) {
          buf = `<b>${damage.attacker.name}</b>`;
        }

        if (damage.source) {
          let source = damage.source.name;
          let isNpc = damage.attacker && damage.attacker.isNpc;
          if (isNpc) {
            const Skill = require(srcPath + 'Skill');
            const isSkill = damage.source instanceof Skill;
            if (!isSkill) {
              //TODO: get weapon first if exists.
              source = damage.attacker.metadata.attackVerb || 'attack';
            }
          }

          buf += (damage.attacker ? "'s " : " ") + `<b>${source}</b>`;
        } else if (!damage.attacker) {
          buf += "Something";
        }

        buf += ` ${damage.verb || 'hit'} <b>You</b> for <b><red>${damage.finalAmount}</red></b> damage.`;

        if (damage.critical) {
          buf += ' <red><b>(Critical)</b></red>';
        }

        B.sayAt(this, buf);

        // show damage to party members
        if (!this.party) {
          return;
        }

        for (const member of this.party) {
          if (member === this || member.room !== this.room) {
            continue;
          }

          let buf = '';
          if (damage.attacker) {
            buf = `<b>${damage.attacker.name}</b>`;
          }

          if (damage.source) {
            buf += (damage.attacker ? "'s " : ' ') + `<b>${damage.source.name}</b>`;
          } else if (!damage.attacker) {
            buf += "Something";
          }

          buf += ` hit <b>${this.name}</b> for <b><red>${damage.finalAmount}</red></b> damage`;
          B.sayAt(member, buf);
        }
      },

      healed: state => function (heal) {
        if (heal.hidden) {
          return;
        }

        let buf = '';
        let attacker = '';
        let source = '';

        if (heal.attacker && heal.attacker !== this) {
          attacker = `<b>${heal.attacker.name}</b> `;
        }

        if (heal.source) {
          attacker = attacker ? attacker + "'s " : '';
          source = `<b>${heal.source.name}</b>`;
        } else if (!heal.attacker) {
          source = "Something";
        }

        if (heal.attribute === 'health') {
          buf = `${attacker}${source} heals you for <b><red>${heal.finalAmount}</red></b>.`;
        } else {
          buf = `${attacker}${source} restores <b>${heal.finalAmount}</b> ${heal.attribute}.`;
        }
        B.sayAt(this, buf);

        // show heal to party members only if it's to health and not restoring a different pool
        if (!this.party || heal.attribute !== 'health') {
          return;
        }

        for (const member of this.party) {
          if (member === this || member.room !== this.room) {
            continue;
          }

          let buf = `${attacker}${source} heals ${this.name} for <b><red>${heal.finalamount}</red></b>.`;
          B.sayAt(member, buf);
        }
      },

      /**
       * Player was killed
       * @param {Character} killer
       */
      killed: state => function (killer) {
        const Death = require('./lib/Death')(srcPath);
        const Item = require(srcPath + 'Item');
        const Logger = require(srcPath + 'Logger');

        Logger.log(`${this.name} killed by ${killer && killer.name || 'something'} at ${this.room && this.room.entityReference}.`);
        this.removePrompt('combat');

        const othersDeathMessage = killer
          ? `<b><red>${this.name} collapses to the ground, dead at the hands of ${killer.name}.</b></red>`
          : `<b><red>${this.name} collapses to the ground, dead.</b></red>`;
        const except = killer && !killer.isNpc
          ? [killer, this]
          : this;

        B.sayAtExcept(this.room, othersDeathMessage, except);

        if (this.party) {
          B.sayAt(this.party, `<b><green>${this.name} was killed!</green></b>`);
        }

        // Leave a good-looking corpse.
        const items = [];

        if (this.inventory) {
          items.push(...this.inventory.values());
        }

        if (this.equipment) {
          items.push(...this.equipment.values());
        }

        const corpse = new Item(this.area, {
          id: 'corpse',
          name: `Corpse of ${this.name}`,
          roomDesc: `Corpse of ${this.name}`,
          description: `The rotting corpse of ${this.name}`,
          keywords: ['corpse', this.name],
          type: 'CONTAINER',
          properties: {
            noPickup: true,
          },
          maxItems: items.length + 1,
          behaviors: {
            decay: {
              // To prevent killing yourself to harvest own items.
              duration: this.level < 9 ? 30 : 600
            }
          },
        });
        corpse.hydrate(state);

        Logger.log(`Generated corpse: ${corpse.uuid}`);

        items.forEach(item => {
          item.hydrate(state);
          corpse.addItem(item)
        });
        this.room.addItem(corpse);
        state.ItemManager.add(corpse);

        // Calculate Memories
        const memoriesEarned = Death.calculateMemories(this);
        this.account.setMeta('memories',
          (this.account.getMeta('memories') || 0) + memoriesEarned
        );

        // Record as dead.
        this.setMeta('deceased', true);
        this.setMeta('killedBy', killer && killer.name || null);
        this.setMeta('killedOn', Date.now());

        const deceased = (this.account.getMeta('deceased') || []).concat(this.name);

        this.account.setMeta('deceased', deceased);

        // Disconnect player
        this.save(() => {
          if (this.level <= 5) B.sayAt(this, `<red><b>HINT:</b> ${Death.hint()}</red>`)
          B.sayAt(this, `~* <red>* <b>* YOU DIED *</b> *</red> *~`); // rethink this, or at least make it less corny.
          B.sayAtExcept(this.room, `<red><b>${this.name}'s soul leaves the body.</red></b>`, this);
          this.socket.emit('close');
        });
      },

      /**
       * Player killed a target
       * @param {Character} target
       */
      deathblow: state => function (target, skipParty) {
        const xp = LevelUtil.mobExp(target.level) + (target._xp || 0); // _xp is bonus from NPCs killing players or other NPCs.

        this.setMeta('kills',
          (this.getMeta('kills') || 0) + 1
        );

        const strongest = this.getMeta('strongestKilled') || { level: 0 };
        if (target.level > strongest.level) {
          this.setMeta('strongestKilled', {
            name: target.name,
            level: target.level
          });
        }

        if (this.party && !skipParty) {
          // if they're in a party proxy the deathblow to all members of the party in the same room.
          // this will make sure party members get quest credit trigger anything else listening for deathblow
          for (const member of this.party) {
            if (member.room === this.room) {
              member.emit('deathblow', target, true);
            }
          }
          return;
        }

        if (target && !this.isNpc) {
          B.sayAt(this, `<b><red>You killed ${target.name}!</red></b>`);
        }

        this.emit('experience', xp);
      }
    }
  };

  function promptBuilder(promptee) {
    if (!promptee.isInCombat()) {
      return '';
    }

    // Set up some constants for formatting the health bars
    const playerName = "You";
    const targetNameLengths = [...promptee.combatants].map(t => t.name.length);
    const nameWidth = Math.max(playerName.length, ...targetNameLengths);
    const getHealthPercentage = entity => Math.floor((entity.getAttribute('health') / entity.getMaxAttribute('health')) * 100);
    
    const shouldShowBars = typeof promptee.metadata.config.combatbars === 'boolean' ? promptee.metadata.config.combatbars : true;
    if (shouldShowBars) {
      const progWidth = 60 - (nameWidth + ':  ').length;

      // Set up helper functions for health-bar-building.
      const formatProgressBar = (name, progress, entity) => {
        const pad = B.line(nameWidth - name.length, ' ');
        return `<b>${name}${pad}</b>: ${progress} <b>${entity.getAttribute('health')}/${entity.getMaxAttribute('health')}</b>`;
      }

      // Build player health bar.
      let currentPerc = getHealthPercentage(promptee);
      let progress = B.progress(progWidth, currentPerc, "green");
      let buf = formatProgressBar(playerName, progress, promptee);

      // Build and add target health bars.
      for (const target of promptee.combatants) {
        let currentPerc = Math.floor((target.getAttribute('health') / target.getMaxAttribute('health')) * 100);
        let progress = B.progress(progWidth, currentPerc, "red");
        buf += `\r\n${formatProgressBar(target.name, progress, target)}`;
      }

      return buf;
    }


    const getHealthColor = percentage => percentage >= 80 ? 'green' : percentage >= 40 ? 'yellow' : 'red';
    const makeHealthString = (entity, name) => {
      const pad = B.line(nameWidth - name.length, ' ');
      const percentage = getHealthPercentage(entity);
      const color = getHealthColor(percentage);
      return `${name}: ${pad}<${color}>${percentage}%</${color}> (<b>${entity.getAttribute('health')}/${entity.getMaxAttribute('health')}</b>)`;
    }

    let buf = makeHealthString(promptee, 'You');
    for (const target of promptee.combatants) {
      buf += `\r\n${makeHealthString(target, target.name)}`;
    }
    return buf;
  }
};
