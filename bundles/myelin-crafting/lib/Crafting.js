'use strict';

const srcPath = '../../../src/';

const Logger = require(srcPath + 'Logger');
const Data = require(srcPath + 'Data');
const Item = require(srcPath + 'Item');

const dataPath = __dirname + '/../data/';
const _loadedResources = Data.parseFile(dataPath + 'resources.yml');
const _loadedRecipes = Data.parseFile(dataPath + 'recipes.yml');

const qualityMap = {
  poor: 1,
  common: 3,
  uncommon: 5,
  rare: 8,
  epic: 10
};

class Crafting {
  static getResource(resourceKey) {
    return _loadedResources[resourceKey];
  }

  static getRecipeEntries(item) {
    return Object.entries(item.recipe);
  }

  static canCraft(player, recipeEntries) {
    for (const [resource, recipeRequirement] of recipeEntries) {
      const playerResource = player.getMeta(`resources.${resource}`) || 0;
      if (playerResource < recipeRequirement) {
        const resItem = Crafting.getResourceItem(resource);
        return {success: false, name: resItem.name, difference: recipeRequirement - playerResource };
      }
    }
    return {success: true}
  }

  static getExperience(totalRequired, quality = 'common') {
    return Math.ceil(totalRequired / 5) * qualityMap[quality];
  }

  static getResourceItem(resourceKey) {
    const resourceDef = this.getResource(resourceKey);
    if (!resourceDef) {
      return Logger.error('Invalid or missing resource definition.');
    }
    // create a temporary fake item for the resource for rendering purposes
    return new Item(null, {
      name: resourceDef.title,
      metadata: {
        quality: resourceDef.quality,
      },
      keywords: resourceKey,
      id: 1
    });
  }

  static getRecipes() {
    return _loadedRecipes;
  }
}

module.exports = Crafting;
