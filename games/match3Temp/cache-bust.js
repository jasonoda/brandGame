'use strict';

const fs = require('fs');
const rawdata = fs.readFileSync('webpack-assets.json');
const assetMap = JSON.parse(rawdata);
console.log(`====================>>>>>>>>>>>>>>>> ${assetMap.index.js}`);

fs.readFile('./dist/game.html', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  } else {
    var newContent = data.replace(/\.\/dist\/index\.build\.js/g, assetMap.index.js);
    fs.writeFile('./dist/game.html', newContent, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  }
});
