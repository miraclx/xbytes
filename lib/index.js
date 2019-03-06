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

const genericMatcher = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*((?:([kmgtpezy])(i?))?(b))`);

const globalByteFilter = new RegExp(genericMatcher.source, 'gi');

const byteFilter = new RegExp(`^${genericMatcher.source}`, 'i');

function parseUnit(stringUnit) {
  let scan;
  if (typeof stringUnit === 'string' && (scan = stringUnit.match(unitMatcher))) {
    const [input, key, iec, type] = scan;
    const prefix = key ? key.toUpperCase() : '' || type;
    scan = {
      input,
      prefix,
      iec: !!iec,
      type,
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
      unit,
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

function parseBytes(input, options) {
  let struct;
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
relative.bits = data => relative(data).bits;
relative.bytes = data => relative(data).bytes;
relative.iecBits = data => relative(data).iecBits;
relative.iecBytes = data => relative(data).iecBytes;
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

xbytes.byteFilter = byteFilter;
xbytes.unitMatcher = unitMatcher;
xbytes.genericMatcher = genericMatcher;
xbytes.globalByteFilter = globalByteFilter;

xbytes.isBytes = isBytes;
xbytes.relative = relative;
xbytes.extractBytes = extractBytes;

xbytes.parseSize = parseSize;
xbytes.parseUnit = parseUnit;
xbytes.parseBytes = parseBytes;
xbytes.parseString = parseString;

xbytes.createByteParser = createByteParser;
xbytes.createSizeParser = createSizeParser;
xbytes.createRelativeSizer = createRelativeSizer;

if (typeof module !== 'undefined') module.exports = xbytes;
