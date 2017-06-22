'use strict';

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Random = require(srcPath + 'RandomUtil');
  return  {
    listeners: {
      playerEnter: state => function (player) {
        const quest = state.QuestFactory.create(state, 'spire.intro:1', player);
        if (player.questTracker.canStart(quest)) {
          player.questTracker.start(quest);
          this.emit('giveQuestSpeech', player);
        } else if (player.questTracker.isComplete(quest.id)) {
          if (Random.probability(20)) {
            Broadcast.sayAt(player, 'The automaton lets loose a relieved sigh from its speaker.');
          }
        }
      },

      giveQuestSpeech: state => function (player) {
        if (this.hasEffectType('speaking')) {
          return;
        }

        const speak = state.EffectFactory.create('speak', this, {}, {
          messageList: [
            "Hello... *whirring noise*",
            "...According to my data orb, you are /%player%/. Yes?",
            "Welcome back, /%player%/. We have a small problem.",
            "Some of my autonomic brethren have malfunctioned and taken the key that will open this airlock.",
            "You will find them in the airlock to the west.",
            "Please, destroy them, and retrieve the key.",
            "I would do it myself, but they scavenged my legs to use as weapons."
          ],
          outputFn: message => {
            message = message.replace(/%player%/, player.name);
            state.ChannelManager.get('say').send(state, this, message);
          }
        });
        this.addEffect(speak);
      },

    }
  };
};