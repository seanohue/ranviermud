'use strict';

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath, bundlePath) => {
  const B = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');

  const say = B.sayAt;
  const CommandManager = require(srcPath + 'CommandManager');
  const Crafting = require(bundlePath + 'myelin-crafting/lib/Crafting');
  const ItemUtil = require(bundlePath + 'myelin-lib/lib/ItemUtil');

  const subcommands = new CommandManager();

  /** LIST **/
  subcommands.add({
    name: 'list',
    command: state => (args, player) => {
      const craftingCategories = Crafting.getCraftingCategories(state);

      // list categories
      if (!args || !args.length) {
        say(player, '<b>Crafting Categories</b>');
        say(player, B.line(40));

        craftingCategories.forEach((category, index) => {
          say(player, sprintf('%2d) %s', parseInt(index, 10) + 1, craftingCategories[index].title));
        });

        return say(player, 'Type `craft list [number/title]` to see the recipes for each category.');
      }

      let [search, itemNumber] = args.split(' ');

      let index = parseInt(search, 10) - 1;
      const category = craftingCategories[index]
        || craftingCategories.find(category => search === category.title.toLowerCase());

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

        const knownRecipes = player.getMeta('learnedCrafts') || [];
        const craftableItems = category.items.filter(categoryEntry => 
          knownRecipes.includes(categoryEntry.item) || 
          Crafting.canCraft(state, player, Object.entries(categoryEntry.recipe)).success
        );
        if (!craftableItems.length) {
          return say(player, 'Gather more resources to craft these items.');
        }

        return craftableItems.forEach((craftable) => {
          const item = craftable.item;
          say(player, sprintf('%2d) ', craftable.index + 1) + ItemUtil.display(item));
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
        if (resource === 'tools') {
          say(player);
          say(player, `<b>Tools:</b>`)
          for (const tool of [].concat(amount)) {
            const toolItem = state.ItemFactory.create(
              state.AreaManager.getAreaByReference(tool),
              tool
            );
            say(player, `  ${ItemUtil.display(toolItem)}`);
          }
          continue;
        }
        if (resource === 'items') {
          say(player);
          say(player, `<b>Items:</b>    (will be consumed)`);
          for (const itemRef of [].concat(amount)) {
            const item = state.ItemFactory.create(
              state.AreaManager.getAreaByReference(itemRef),
              itemRef
            );
            say(player, `  ${ItemUtil.display(item)}`);
          }
        }
        const ingredient = Crafting.getResourceItem(resource);
        say(player, `  ${ItemUtil.display(ingredient)} x ${amount}`);
      }
    }
  });

  /* SEARCH */
  subcommands.add({
    name: 'search',
    aliases: ['find'],
    command: state => (args, player) => {
      if (!args || !args.length) {
        return say(player, `Search for what? For example, 'craft search sword'.`)
      }

      const results = Crafting.getCraftByKeyword(state, args);
      const noResults = () => say(player, `No results found for '${args}'. You may need more resources. Try searching again, or use 'craft list'.`);
      if (!results.length) {
        return noResults();
      }

      const possibleResults = results.filter(recipe => {
        const recipeEntries = Object.entries(recipe.recipe);
        return Crafting.canCraft(state, player, recipeEntries);
      });

      if (!possibleResults.length) {
        return noResults();
      }

      const amount = possibleResults.length === 1 ? '1 result' : `${possibleResults.length} results`;
      say(player, `Found ${amount} when searching for '${args}'.`);
      for (const recipe of possibleResults) {
        say(player, `<b>[${recipe.category + 1} ${recipe.index + 1}]</b> ${ItemUtil.display(recipe.item)}`);
      }

      const example = `${possibleResults[0].category + 1} ${possibleResults[0].index + 1}`;

      say(player);
      say(player, `Use the numbers in brackets as a reference for other commands.`);
      say(player, `For example: <b>[${example}]</b>`);
      say(player, `-- 'craft list ${example}' will show you the recipe for this item.`);
      say(player, `-- 'craft create ${example}' will create the item.`);
      say(player);
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

      const craftingCategories = Crafting.getCraftingCategories(state);
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
        return say(player, "Invalid item.");
      }

      const recipeEntries = Object.entries(item.recipe);
      const results = Crafting.canCraft(state, player, recipeEntries);

      if (!results.success) {
        return say(player, `You don't have enough resources. 'craft list ${args}' to see recipe. You need ${results.difference} more ${results.name}.`);
      }

      if (player.isInventoryFull()) {
        return say(player, "You can't hold any more items.");
      }

      // deduct resources
      let totalRequired = 0;
      for (const [resource, amount] of recipeEntries) {
        if (resource === 'tools') {
          const howManyTools = [].concat(amount).length
          totalRequired += (howManyTools * 5);
          continue;
        }

        if (resource === 'items') {
          const howManyItems = [].concat(amount).length
          totalRequired += (howManyItems * 8);
          [].concat(amount).forEach(itemRef => {
            const item = ItemUtil.getItemByReference(player.inventory, itemRef);
            console.log({itemRef, item});
            if (!item) return Logger.error(`[CRAFTING] No item found for ${itemRef}`);
            state.ItemManager.remove(item);
          });
          continue;
        }

        player.setMeta(`resources.${resource}`, player.getMeta(`resources.${resource}`) - amount);
        const resItem = Crafting.getResourceItem(resource);
        say(player, `<green>You spend ${amount} x ${ItemUtil.display(resItem)}.</green>`);

        totalRequired += amount;
      }

      state.ItemManager.add(item.item);
      player.addItem(item.item);
      player.emit('craft', item.item);
      say(player, `<b><green>You create: ${ItemUtil.display(item.item)}.</green></b>`);
      player.emit('experience', Crafting.getExperience(totalRequired, item.item.metadata.quality || 'common'), 'crafting');

      player.save();
    }
  });

  return {
    aliases: ['create'],
    usage: 'craft <list/create> [category #] [item #] | craft search [item keyword]',
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
        return say(player, "Invalid command. Use craft list, craft create, craft search.");
      }

      subcommand.command(state)(subArgs.join(' '), player);
    }
  };
};
