module.exports = (srcPath) => {
  return  {
    listeners: {
      spawn: state => function(config) {
        this.skills = new Map();
        for (const skillName of config) {
          let skill = state.SkillManager.get(skillName);
          if (!skill) continue;

          this.skills.set(skillName, skill);
          skill.activate(this) // Activate passive skills.
        }
      }
    }
  }
}