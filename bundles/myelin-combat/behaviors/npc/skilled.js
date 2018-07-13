module.exports = (srcPath) => {
  const SkillType = require(srcPath + 'SkillType');

  return  {
    listeners: {
      spawn: state => function(config) {
        this.skills = new Map();
        
        for (const skillName of config.skills) {
          let skill = state.SkillManager.get(skillName);
          if (!skill) continue;

          this.skills.set(skillName, skill);
          skill.activate(this) // Activate passive skills.
        }

        this.skills.types = [...this.skills].reduce((types, [name, skill]) => types.concat(skill.type), []);
      },

      cannotAttack: state => function(config) {
        if (!canUseAbilities.call(this, config)) {
          return;
        }


        const {combatPriorities = ['COMBAT', 'BUFF', 'HEAL']} = config;

        for (const typeName of combatPriorities) {
          const needsTarget = typeName === 'COMBAT';
          const target = typeName === 'COMBAT' ? this.combatants[0] : this;
          const skillType = SkillType[typeName];
          if (!skillType) continue;
          if (tryAllAbilitiesOfType.call(this, skillType, target)) {
            break;
          }
        }
      },

      combatStart: state => function(config, target) {
        if (!config.useOnCombatStart || !canUseAbilities.call(this, config)) {
          return;
        }

        if (this.getAttribute('health') < this.getMaxAttribute('health')) {
          if (tryAllAbilitiesOfType.call(this, SkillType.HEAL, this)) {
            return;
          }
        }

        if (tryAllAbilitiesOfType.call(this, SkillType.BUFF, this)) {
          return;
        }

        tryAllAbilitiesOfType.call(this, SkillType.COMBAT, target);
      },

      damaged: state => function(config, damage) {
        if (!canUseAbilities.call(this, config)) {
          return;
        }

        if (tryAllAbilitiesOfType.call(this, SkillType.HEAL, this)) {
          return;
        }

        if (tryAllAbilitiesOfType.call(this, SkillType.BUFF, this)) {
          return;
        }
        
        if (damage.attacker) {
          tryAllAbilitiesOfType.call(this, SkillType.COMBAT, damage.attacker);
        }
      },
    }
  }
}

function canUseAbilities(config) {
  const {wait = 3000} = config;

  if (!this.combatData) {
    this.combatData = {};
  }
  const now = Date.now();

  if (!this.combatData.lastSkillUse) {
    this.combatData.lastSkillUse = now;
    return true;
  }
  const canUse = (now - this.combatData.lastSkillUse) >= wait;

  return canUse;
}

function tryAllAbilitiesOfType(type, target = null, args = '') {
  if (this.skills.types.includes(type)) {
    const skillsToTry = [...this.skills].filter(([name, skill]) => skill.type === type);

    while(skillsToTry.length) {
      const [name, skill] = skillsToTry.shift();
      if (tryAbility.call(this, skill, target, args)) {
        return true;
      }
    }
  } else {
    log.call(this, 'Failed all abilities of type ', type);
  }
}

function tryAbility(ability, target, args = '') {
  try {
    const success = ability.execute(args, this, target);
    if (success) {
      this.combatData.lastSkillUse = Date.now();
    }
    return success;
  } catch(e) {
    return false;
  }
}

function log(...msg) {
  return;
  if ([...this.combatants].find(c => !c.isNpc)) {
    console.log(...msg);
  }
}