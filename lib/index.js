/**
 * @module xbytes
 * @license Apache-2.0
 * @author Miraculous Owonubi
 * @copyright (c) 2019 Miraculous Owonubi
 */

/* eslint-disable no-restricted-properties */

function xbytes(size = 0, options) {
  if (Number.isNaN((size = +size)) || typeof size !== 'number') return null;
  const {iec = false, bits = false, short = true, space = true, fixed = 2, prefixIndex} = options || {};
  size *= bits ? 8 : 1;
  const sizes = ['-', 'Kilo', 'Mega', 'Giga', 'Tera', 'Peta', 'Exa', 'Zetta', 'Yotta'];
  const exponent =
    typeof prefixIndex === 'number' ? prefixIndex : Math.floor(Math.log(Math.abs(size)) / Math.log(iec ? 1024 : 1000)) || 0;
  size /= ~exponent && exponent in sizes ? Math.pow(iec ? 1024 : 1000, exponent) : 1;
  const select = sizes[exponent] || sizes[0];
  const byteStr = !short
    ? select.replace(/(\w{2})(\w+)/, `$1${iec ? 'bi' : '$2'}-`).replace(/-/, !bits ? 'Bytes' : 'Bits')
    : select[0].replace(/(-?|[^\w])$/, `${iec && exponent in sizes && exponent > 0 ? 'i' : ''}${!bits ? 'B' : 'b'}`);
  return [size < 1 ? size : size.toFixed(fixed), byteStr].join(space ? ' ' : '');
}

const unitMatcher = /^(?:([kmgtpezy])(i?))?(b)/i;

const genericMatcher = new RegExp(`\\b([+-]?\\d+(?:\\.\\d+)?(?:e[+-]\\d+)?)\\s*((?:([kmgtpezy])(i?))?(b))\\b`);

const globalByteFilter = new RegExp(genericMatcher.source, 'gi');

const byteFilter = new RegExp(`^${genericMatcher.source}`, 'i');

function parseUnit(stringUnit) {
  let scan;
  if (typeof stringUnit === 'string' && (scan = stringUnit.match(unitMatcher))) {
    const [input, key, iec, type] = scan;
    const prefix = key ? key.toUpperCase() : '';
    scan = {
      unitInput: input,
      prefix,
      iec: !!iec,
      type,
      unit: prefix.concat(type),
      bits: type === 'b',
      byte: type === 'B',
      prefixIndex: 'BKMGTPEZY'.indexOf(prefix.toUpperCase()),
    };
  }
  return scan;
}

function parseString(stringBytes) {
  let scan;
  if (typeof stringBytes === 'string' && (scan = stringBytes.match(byteFilter))) {
    const [input, value, unit] = scan;
    scan = {
      ...parseUnit(unit),
      input,
      value: parseFloat(value),
    };
  }
  return scan;
}

function isBytes(stringBytes) {
  return !!parseString(stringBytes);
}

function extractBytes(stringOfbytes) {
  return (stringOfbytes.match(globalByteFilter) || []).filter(isBytes);
}

function parseSize(stringBytes, parseOptions) {
  let scan;
  const {bits = true, iec = true} = parseOptions || {};
  if (isBytes(stringBytes) && (scan = parseString(stringBytes))) {
    const index = scan.prefixIndex;
    scan =
      (scan.value * (iec && !scan.iec ? Math.pow(10, index * 3) : Math.pow(2, 10 * index))) / (bits && scan.type === 'b' ? 8 : 1);
  }
  return scan;
}

function isParsable(input) {
  return (
    isBytes(input) || (Number.isFinite(input) && Math.abs(input) < 0x40000000000000000000000) // All values under 1024 YiB are parsable
  );
}

function parseBytes(input, options) {
  let struct;
  if (!isParsable(input))
    throw Error(
      `<input> argument [${input}] of type '${typeof input}' must either be a finite number or a ByteString e.g "10 MB"`,
    );
  let bytes = (isBytes(input) ? parseSize(input) : +input) || 0;
  if (isBytes(input)) [bytes, struct] = [parseSize(input), input];
  else [bytes, struct] = [+input || 0, xbytes(+input || 0)];
  return {...(struct = parseString(struct, options)), input, bytes, size: xbytes(bytes, struct)};
}

function relative(data, options) {
  const parsed = parseBytes(data).bytes;
  const bits = xbytes(parsed, {...options, iec: false, bits: true});
  const bytes = xbytes(parsed, {...options, iec: false, bits: false});
  const iecBits = xbytes(parsed, {...options, iec: true, bits: true});
  const iecBytes = xbytes(parsed, {...options, iec: true, bits: false});
  return {raw: data, size: parsed, bytes, iecBytes, bits, iecBits};
}
relative.bits = (data, opts) => relative(data, opts).bits;
relative.bytes = (data, opts) => relative(data, opts).bytes;
relative.iecBits = (data, opts) => relative(data, opts).iecBits;
relative.iecBytes = (data, opts) => relative(data, opts).iecBytes;
relative.size = (size, unit, options) => {
  const parsed = parseBytes(size);
  const {prefixIndex, bits, iec} = parseUnit(unit) || {};
  return xbytes(parsed.bytes, {...options, prefixIndex, bits, iec});
};

function createByteParser(config) {
  return function staticByteParser(size) {
    return xbytes(size, config);
  };
}

function createSizeParser(config) {
  return function staticSizeParser(size) {
    return parseSize(size, config);
  };
}

function createRelativeSizer(unit, config) {
  return function staticRelativeSizer(size) {
    return relative.size(size, unit, config);
  };
}

function parseByteOrByteArray(input) {
  return (Array.isArray(input) ? input : [input]).map(byte => parseBytes(byte).bytes);
}

class ByteUnitObject {
  constructor(bytes) {
    if (!isParsable(bytes)) throw Error('<bytes> argument must be a finite value');
    Object.assign(this, parseBytes(bytes));
    delete this.input;
    this.checkInternalByteVal();
  }

  checkInternalByteVal() {
    if (!Number.isFinite(this.bytes))
      throw Error('Internal container for bytes value invalid, probably corrupted from external source');
  }

  add(bytes) {
    // eslint-disable-next-line no-underscore-dangle
    this.checkInternalByteVal(bytes);
    return new ByteUnitObject(this.bytes + parseByteOrByteArray(bytes).reduce((a, v) => a + v, 0));
  }

  subtract(bytes) {
    // eslint-disable-next-line no-underscore-dangle
    this.checkInternalByteVal(bytes);
    return new ByteUnitObject(this.bytes - parseByteOrByteArray(bytes).reduce((a, v) => a + v, 0));
  }

  multiply(bytes) {
    // eslint-disable-next-line no-underscore-dangle
    this.checkInternalByteVal(bytes);
    return new ByteUnitObject(this.bytes * parseByteOrByteArray(bytes).reduce((a, v) => a * v, 1));
  }

  divide(bytes) {
    // eslint-disable-next-line no-underscore-dangle
    this.checkInternalByteVal(bytes);
    return new ByteUnitObject(this.bytes / parseByteOrByteArray(bytes).reduce((a, v) => a * v, 1));
  }
}

function createObject(bytes) {
  return new ByteUnitObject(bytes);
}

xbytes.byteFilter = byteFilter;
xbytes.unitMatcher = unitMatcher;
xbytes.genericMatcher = genericMatcher;
xbytes.globalByteFilter = globalByteFilter;

xbytes.isBytes = isBytes;
xbytes.relative = relative;
xbytes.isParsable = isParsable;
xbytes.extractBytes = extractBytes;

xbytes.parseSize = parseSize;
xbytes.parseUnit = parseUnit;
xbytes.parseBytes = parseBytes;
xbytes.parseString = parseString;

xbytes.createObject = createObject;
xbytes.ByteUnitObject = ByteUnitObject;
xbytes.createByteParser = createByteParser;
xbytes.createSizeParser = createSizeParser;
xbytes.createRelativeSizer = createRelativeSizer;

if (typeof module !== 'undefined') module.exports = xbytes;
