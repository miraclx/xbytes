const fs = require('fs');
const join = require('path').join;
const PassThrough = require('stream').PassThrough;

const DIST_DIR = join(__dirname, 'dist');
const DIST_LIB = join(DIST_DIR, 'index.js');

let lib = require(DIST_LIB);

function createEsmDist(cb) {
  fs.createReadStream(DIST_LIB)
    .pipe(
      new PassThrough({
        final: function(cb) {
          this.push('\nexport {\n');
          for (let key in lib) this.push(`  ${key},\n`);
          this.push('};\nexport default xbytes;\n');
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
