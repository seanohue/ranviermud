/*
  Background story event for abomination.
*/

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const Choices   = require('lobus').Choices;

  return {
    event: state => (socket, args) => {
      const { background } = args;
      const {
        id,
        name: bgName,
        description,
        attributes,
        equipment,
        skills,
        attributePoints,
        abilityPoints
      } = background; 

      const say = EventUtil.genSay(socket);
      const write = EventUtil.genWrite(socket);

      /*
        Choose your own adventure ~~~~
      */

      const before = Choices.createScenario('before', {
        title: '<b>Life Before Abuction</b>',
        description: 'Memories flash before you, memories of the vessel you now inhabit. This vessel was part of an early trial for a new mutation. But, why?'
      })
      .addChoices({
        poor: {
          description: 'They were born into the lower case, and had to sleep rough and work odd jobs.', 
          effect() { attributes.willpower ++; attributes.intellect --; }
        },
        risky: { 
          description: 'They were in debt, and had to take a gamble with their own life.',
          effect() { attributes.intellect ++; attributes.willpower --; }
        },
        science: {
          description: 'They volunteered themselves for a scientific study they believed in.',
          effect() { attributes.intellect ++; attributes.might --; }
        }
      });

      const mutation = Choices.createScenario('mutation', {
        title: '<b>Volunteer Mutant</b>',
        description: 'You recall your vessel volunteering for a specific trial. What was it?',
      })
      .addChoices({
        claws: {
          description: 'They volunteered to have chitin claws implanted.',
          effect() {
            skills = (skills || []).concat('rend');
          }
        },
        fire: {
          description: 'They volunteered to have fingers of fire.',
          effect() {
            skills = (skills || []).concat('combust');
          }
        },
        jolt: { // defibrillations.
          description: 'They elected to have their nerves electrified.',
          effect() {
            skills = (skills || []).concat('jolt');
          }
        },
      });

      Choices.run({
        scenarios: [before, mutation],
        socket,
        say,
      }).then(() => {
        console.log('Emitting Done!');
        socket.emit('finish-player', socket, args);
      });
    }
  }
};