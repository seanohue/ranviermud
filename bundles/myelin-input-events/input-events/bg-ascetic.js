/*
  Background story event for ascetic.
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
        title: '<b>Life Before Penitence</b>',
        description: 'Memories flash before you, memories of the vessel you now inhabit. This vessel joined a group of penitent ascetics, who gave up material wealth and lifestyle for simplicity and study. But, why?'
      })
      .addChoices({
        born: { 
          description: 'They were born into the cloistered order.', 
          effect() { attributes.willpower ++ }
        },
        thief: { 
          description: 'They had to atone for their crimes as a petty thief.',
          effect() { attributes.quickness ++ }
        },
        scholar: {
          description: 'They converted later in life, to pursue their scholarship in peace.',
          effect() { attributes.intellect ++ }
        }
      });

      const ifThief = Choices.createScenario('thief', {
        title: '<b>Stolen Goods</b>',
        description: 'You recall your vessel being caught and dragged to prison. What goods were they caught with?',
        prerequisite(choices) { return choices.before === 'thief'; }
      })
      .addChoices({
        weapons: {
          description: 'They were caught smuggling weapons.'
        },
        food: {
          description: 'They were found stealing food to feed their family.'
        },
        rareminerals: {
          description: 'They illegally mined rare minerals used to create black market drugs and other exotic wares.'
        },
        kidnapping: {
          description: 'They were captured running a kidnapping ring.'
        }
      });

      const ifScholar = Choices.createScenario('scholar', {
        title: '<b>Field of Study</b>',
        description: 'You recall the subject matter your vessel was obsessed with studying.',
      })
      .setPrerequisite((choices) => choices.before === 'scholar')
      .addChoices({
        weapons: {
          description: 'They studied the blade.',
          effect() { attributes.might ++ }
        },
        beasts: {
          description: 'They dealt with rare flora and fauna.'
        },
        tech: {
          description: 'They built exotic machinery.'
        },
        medicine: {
          description: 'They were trained in the arts of physiology and medicine.'
        }
      });

      const during = Choices.createScenario('during', {
        title: '<b>Life in the Cloister</b>',
        description: 'You recall a difficult moment in the vessel\'s life after they became an ascetic. What was it?'
      })
      .addChoices({
        ostracized: {
          description: 'They were ostracized by their peers, since they were not born into the order.', 
          prerequisite(choices) {
            return choices.before !== 'born';
          }
        },
        struggled: {
          description: 'They struggled to master the scholarly studies of the order.', 
          prerequisite(choices) {
            return choices.before !== 'scholar';
          },
          effect() { attributes.intellect --; }
        },
        kleptomania: {
          description: 'They were often punished for stealing from the other ascetics, and could not control their compulsion.', 
          prerequisite(choices) {
            return choices.before === 'thief';
          },
          effect() { attributes.willpower --; }
        },
        awkward: {
          description: 'They struggled to socially adapt to those not born into a life of asceticism.', 
          prerequisite(choices) {
            return choices.before === 'born';
          },
          effect() {
            //TODO: Add effect or metadata to indicate being socially stunted :P
          }
        },
        weak: {
          description: 'They were not tough enough for the manual labor of the order, and were silently judged by their peers for such.',
          prerequisite(choices) {
            return choices.before !== 'thief';
          },
          effect() {
            attributes.might --;
          }
        }
      });

      Choices.run({
        scenarios: [before, ifThief, ifScholar, during],
        socket,
        say,
      }).then(() => {
        console.log('Emitting Done!');
        socket.emit('finish-player', socket, args);
      });
    }
  }
};