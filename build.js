const fs = require('fs');
const join = require('path').join;
const PassThrough = require('stream').PassThrough;

const DIST_DIR = join(__dirname, 'dist');
const DIST_LIB = join(DIST_DIR, 'index.js');

function createEsmDist(cb) {
  fs.createReadStream(DIST_LIB)
    .pipe(
      new PassThrough({
        final: function(cb) {
          this.push('\nexport default xbytes;');
          cb();
        },
      })
    )
    .pipe(fs.createWriteStream(join(DIST_DIR, 'index.mjs')))
    .on('close', cb);
}

function main() {
  createEsmDist(function(err) {
    if (err) console.error(err);
  });
}

main();
