'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  const say = B.sayAt;
  const CommandManager = require(srcPath + 'CommandManager');
  const ItemType = require(srcPath + 'ItemType');
  const Crafting = require(bundlePath + 'myelin-crafting/lib/Crafting');
  const ItemUtil = require(bundlePath + 'myelin-lib/lib/ItemUtil');

  const subcommands = new CommandManager();

  /** LIST **/
  subcommands.add({
    name: 'list',
    command: state => (args, player) => {
      const craftingCategories = getCraftingCategories(state);

      // list categories
      if (!args || !args.length) {
        say(player, '<b>Crafting Categories</b>');
        say(player, B.line(40));

        craftingCategories.forEach((category, index) => {
          say(player, sprintf('%2d) %s', parseInt(index, 10) + 1, craftingCategories[index].title));
        });

        return say(player, 'Type `craft list [number]` to see the recipes for each category.');
      }

      let [itemCategory, itemNumber] = args.split(' ');

      itemCategory = parseInt(itemCategory, 10) - 1;
      const category = craftingCategories[itemCategory];
      if (!category) {
        return say(player, "Invalid category.");
      }

      // list items within a category
      if (!itemNumber) {
        say(player, `<b>${category.title}</b>`);
        say(player, B.line(40));

        if (!category.items.length) {
          return say(player, B.center(40, "No recipes."));
        }

        return category.items.forEach((categoryEntry, index) => {
          say(player, sprintf('%2d) ', index + 1) + ItemUtil.display(categoryEntry.item));
        });
      }

      itemNumber = parseInt(itemNumber, 10) - 1;
      const item = category.items[itemNumber];
      if (!item) {
        return say(player, "Invalid item.");
      }

      say(player, ItemUtil.renderItem(state, item.item, player));
      say(player, '<b>Recipe:</b>');
      for (const [resource, amount] of Object.entries(item.recipe)) {
        const ingredient = Crafting.getResourceItem(resource);
        say(player, `  ${ItemUtil.display(ingredient)} x ${amount}`);
      }
    }
  });

  /** CREATE **/
  subcommands.add({
    name: 'create',
    command: state => (args, player) => {
      if (!args || !args.length) {
        return say(player, "Create what? 'craft create 1 1' for example.");
      }

      const isInvalidSelection = categoryList => category =>
        isNaN(category) || category < 0 || category > categoryList.length;

      const craftingCategories = getCraftingCategories(state);
      const isInvalidCraftingCategory = isInvalidSelection(craftingCategories);

      let [itemCategory, itemNumber] = args.split(' ');

      itemCategory = parseInt(itemCategory, 10) - 1;
      if (isInvalidCraftingCategory(itemCategory)) {
        return say(player, "Invalid category.");
      }

      const category = craftingCategories[itemCategory];
      const isInvalidCraftableItem = isInvalidSelection(category.items);
      itemNumber = parseInt(itemNumber, 10) - 1;
      if (isInvalidCraftableItem(itemNumber)) {
        return say(player, "Invalid item.");
      }

      const item = category.items[itemNumber];
      // check to see if player has resources available
      
      if (!item) {
        Logger.error(`Trying to craft ${itemNumber} in ${category.items} via ${args}`);
      }
      
      const recipeEntries = Object.entries(item.recipe);

      for (const [resource, recipeRequirement] of recipeEntries) {
        const playerResource = player.getMeta(`resources.${resource}`) || 0;
        if (playerResource < recipeRequirement) {
          const resItem = Crafting.getResourceItem(resource);
          return say(player, `You don't have enough resources. 'craft list ${args}' to see recipe. You need ${recipeRequirement - playerResource} more ${resItem.name}.`);
        }
      }

      if (player.isInventoryFull()) {
        return say(player, "You can't hold any more items.");
      }

      // deduct resources
      let totalRequired = 0;
      for (const [resource, amount] of recipeEntries) {
        player.setMeta(`resources.${resource}`, player.getMeta(`resources.${resource}`) - amount);
        const resItem = Crafting.getResourceItem(resource);
        say(player, `<green>You spend ${amount} x ${ItemUtil.display(resItem)}.</green>`);

        totalRequired += amount;
      }

      state.ItemManager.add(item.item);
      player.addItem(item.item);
      player.emit('craft', item.item);
      say(player, `<b><green>You create: ${ItemUtil.display(item.item)}.</green></b>`);
      player.emit('experience', Crafting.getExperience(totalRequired, item.item.metadata.quality || 'common'));

      player.save();
    }
  });

  function getCraftingCategories(state) {
    let craftingCategories = [
      {
        type: ItemType.POTION,
        title: "Consumable",
        items: []
      },
      {
        type: ItemType.WEAPON,
        title: "Weapon",
        items: []
      },
      {
        type: ItemType.ARMOR,
        title: "Armor",
        items: []
      },
      {
        type: ItemType.CONTAINER,
        title: "Containers",
        items: []
      },
    ];

    const recipes = Crafting.getRecipes();
    for (const recipe of recipes) {
      const recipeItem = state.ItemFactory.create(
        state.AreaManager.getAreaByReference(recipe.item),
        recipe.item
      );

      const catIndex = craftingCategories.findIndex(cat => {
        return cat.type === recipeItem.type;
      });

      if (catIndex === -1) {
        continue;
      }

    recipeItem.hydrate(state);
      craftingCategories[catIndex].items.push({
        item: recipeItem,
        recipe: recipe.recipe
      });
    }

    return craftingCategories;
  }

  return {
    aliases: ['create'],
    usage: 'craft <list/create> [category #] [item #]',
    command: state => (args, player, arg0) => {
      if (arg0 === 'create') {
        args = 'create ' + args;
      }

      if (!args.length) {
        return say(player, "Missing craft command. See 'help craft'");
      }

      const [ command, ...subArgs ] = args.split(' ');

      const subcommand = subcommands.find(command);
      if (!subcommand) {
        return say(player, "Invalid command. Use craft list or craft create.");
      }

      subcommand.command(state)(subArgs.join(' '), player);
    }
  };
};
