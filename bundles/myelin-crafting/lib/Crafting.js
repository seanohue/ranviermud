'use strict';

const srcPath = '../../../src/';

const Logger = require(srcPath + 'Logger');
const Data =require(srcPath + 'Data');
const Item = require(srcPath + 'Item');

const dataPath = __dirname + '/../data/';
const _loadedResources = Data.parseFile(dataPath + 'resources.yml');
const _loadedRecipes = Data.parseFile(dataPath + 'recipes.yml');

class Crafting {
  static getResource(resourceKey) {
    return _loadedResources[resourceKey];
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
