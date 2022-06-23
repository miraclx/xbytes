const fs = require('fs');
const join = require('path').join;
const PassThrough = require('stream').PassThrough;

const DIST_DIR = join(__dirname, 'dist');
const DIST_LIB = join(DIST_DIR, 'index.js');

const exportedMembers = [
  'ByteUnitObject',
  'byteFilter',
  'createByteParser',
  'createRelativeSizer',
  'createSizeParser',
  'extractBytes',
  'genericMatcher',
  'globalByteFilter',
  'isBytes',
  'isParsable',
  'isUnit',
  'parse',
  'parseBytes',
  'parseSize',
  'parseString',
  'parseUnit',
  'relative',
  'unitMatcher',
];

function createEsmDist(cb) {
  fs.createReadStream(DIST_LIB)
    .pipe(
      new PassThrough({
        final: function(cb) {
          this.push('\nexport {\n  ');
          this.push(exportedMembers.join(',\n  '));
          this.push(',\n};\nexport default xbytes;\n');
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
