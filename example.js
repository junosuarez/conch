var conch = require('./conch');
var fs = require('fs');

fs.readFile(__dirname + '/README.md', function (err, file) {
  if (err) return console.error(err);
  console.log(
    conch(file.toString())
  );
});