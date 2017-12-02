const fs = require('fs');
const {promisify} = require('util');

const readdir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);

module.exports = async function () {
  const files = await readdir(__dirname + '/backgrounds');
  const backgrounds = {};

  for (const filename of files) {
    if (filename.endsWith('.json')) {
      const fileRecord = require('./backgrounds/' + filename);
      backgrounds[filename.split('.')[0]] = JSON.parse(fileRecord);    
    }

    if (filename.endsWith('.js')) {
      const fileRecord = require('./backgrounds/' + filename);
      backgrounds[filename.split('.')[0]] = fileRecord;
    }

    //TODO: Handle YAML
  }

  return backgrounds;
}