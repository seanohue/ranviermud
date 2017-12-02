/*
  Background story event for ascetic.
*/

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');

  return {
    event: state => (socket, args) => {
      const { foundBackground, choices = {} } = args;
      const {
        id,
        name: bgName,
        description,
        attributes,
        equipment,
        skills,
        attributePoints,
        abilityPoints
      } = foundBackground;

      console.log('In ascetic story, found ', foundBackground);


      const say = EventUtil.genSay(socket);
      const write = EventUtil.genWrite(socket);

      /*
        Choose your own adventure ~~~~
      */
      say(`\r\n|${Broadcast.line(40)}/`);
      say("|      An Ascetic's Story");
      say(`|${Broadcast.line(40)}/`);

      let options = [];
      const choicesMade = Object.keys(choices).length;

      switch (choicesMade) {
        case 0: {
          say("|\r\n|You were not always an Ascetic of your Order.");
          say("| How did you find yourself in the ragged robes of an Ascetic?");

          options.push({
            display: 'As punishment, after being caught stealing from the orphanage I was living in.',
            onSelect: () => {
              choices.origin = 'orphan';
              socket.emit(`bg-${id}`, socket, { foundBackground, choices });
            },
          });

          options.push({
            display: 'I was unable to repay my debts after failing out of Clerical school.',
            onSelect: () => {
              choices.origin = 'cleric';
              socket.emit(`bg-${id}`, socket, { foundBackground, choices });
            }
          });

          options.push({
            display: 'Out of desire to escape the rat race of everyday society',
            onSelect: () => {
              choices.origin = 'escapist';
              socket.emit(`bg-${id}`, socket, { foundBackground, choices });
            }
          });

          break;
        }

        case 1: {
          say(`|\r\n|As a former ${choices.origin}, The Elders of the Order treated you differently.`);
          const scenarios = {
            orphan: ['They took you under their wings as though you were their child.', ' The Elders made for strict but caring parents in absentia.'],
            cleric: ['They treated you as a student,','enacting harsh discipline and filling your days with','rigorous scholarship.'],
            escapist: ['They treated you as an outcast,','forcing you into solitude for days at a time,','and filling your free time with hard labor.']
          };

          for (const line of scenarios[choices.origin]) {
            say(`| ${line}`);
          }

          say("| How do you respond to this treatment?");

          const rebel = {
            orphan: 'They are not your parents.',
            cleric: 'You need exercise and freedom.',
            escapist: 'You do not deserve such abuse.'
          };

          options.push({
            display: 'Push back against it. ' + rebel[choices.origin],
            onSelect: () => {
              choices.treatment = 'rebellious';
              socket.emit(`bg-${id}`, socket, { foundBackground, choices });
            }
          });


          const question = {
            orphan: 'Why are they so kind?',
            cleric: 'Why do they push you?',
            escapist: 'Why are they so harsh?'
          };

          options.push({
            display: 'Question them. ' + question[choices.origin],
            onSelect: () => {
              choices.treatment = 'questioning';
              socket.emit(`bg-${id}`, socket, { foundBackground, choices });
            }
          });

          const accept = {
            orphan: 'You want to make them proud.',
            cleric: 'You secretly hope for an academic future.',
            escapist: 'You enjoy the solitude.'
          };

          options.push({
            display: 'Abide by their rules.' + accept[choices.origin],
            onSelect: () => {
              choices.treatment = 'accepting';
              socket.emit(`bg-${id}`, socket, { foundBackground, choices });
            }
          });
          break;
        }

        case 2: {
          say("|\r\n|How did you come to leave your Cloister?");

          options.push({
            display: "A daring midnight escape.",
            onSelect: () => {
              choices.left = 'escape';
              socket.emit(`bg-${id}`, socket, { foundBackground, choices });
            }
          });

          options.push({
            display: "Excommunication.",
            onSelect: () => {
              choices.left = 'excommunication';
              socket.emit(`bg-${id}`, socket, { foundBackground, choices });
            }
          });

          options.push({
            display: "Sent to find a rare herb and kidnapped.",
            onSelect: () => {
              choices.left = 'kidnapped';
              socket.emit(`bg-${id}`, socket, { foundBackground, choices });
            }
          });

          break;
        }

        default: {
          // Handle results of choices.
          // Emit next event then return;
        }
      }

      say("|");

      // Display and let choose.
      let optionI = 0;
      options.forEach((opt) => {
        if (opt.onSelect) {
          optionI++;
          say(`| <cyan>[${optionI}]</cyan> ${opt.display}`);
        } else {
          say(`| <bold>${opt.display}</bold>`);
        }
      });

      socket.write('|\r\n`-> ');

      socket.once('data', choice => {
        choice = choice.toString().trim();
        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          return socket.emit(`bg-${id}`, socket, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selected ' + selection.display);
          return selection.onSelect();
        }

        return socket.emit(`bg-${id}`, socket, args);
      });
    }
  }
};