const axolemma = require('axolemma');
const configs = require('./configs');

const defaults = {
  writeToFile: true,
  filePath: __dirname + '../areas/'
};

modules.exports = {
  generate(srcPath, state) {
    const Random = require(srcPath + 'RandomUtil');
    const config = Random.fromArray(configs);
    defaults.filePath += `${config._name}_${Date.now()}`;
    return axolemma.generate(Object.assign({}, config, defaults));
  }
};