declare namespace xbytes {
  type KeyUnitStack = 'B'|'K'|'M'|'G'|'T'|'P'|'E'|'Z'|'Y';
  type ShortUnitStack = 'B'|'KB'|'MB'|'GB'|'TB'|'PB'|'EB'|'ZB'|'YB';
  type ShortBitUnitStack = 'b'|'Kb'|'Mb'|'Gb'|'Tb'|'Pb'|'Eb'|'Zb'|'Yb';
  type ShortIECUnitStack = 'B'|'KiB'|'MiB'|'GiB'|'TiB'|'PiB'|'EiB'|'ZiB'|'YiB';
  type ShortIECBitUnitStack = 'b'|'Kib'|'Mib'|'Gib'|'Tib'|'Pib'|'Eib'|'Zib'|'Yib';
  type AllUnitStacks = ShortUnitStack | ShortBitUnitStack | ShortIECUnitStack | ShortIECBitUnitStack;

  type ByteValue = number;
  type ByteString = string;
  type HybridByte = ByteValue | ByteString;

  interface InternalParsedUnit {
    iec: boolean;
    type: 'b' | 'B';
    bits: boolean;
    byte: boolean;
    prefix: KeyUnitStack;
    prefixIndex: number;
  }

  interface ParsedUnit extends InternalParsedUnit {
    input: AllUnitStacks;
  }

  interface ParsedBytes extends InternalParsedUnit {
    unit: AllUnitStacks;
    input: HybridByte;
    value: ByteValue;
  }

  interface TotalParsedBytes extends ParsedBytes {
    size: ByteString;
    bytes: ByteValue;
    input: HybridByte;
  }

  interface MainOpts {
    iec?: boolean;
    bits?: boolean;
    fixed?: number;
    short?: boolean;
    space?: boolean;
    prefixIndex?: number;
  }

  interface ParseByteOpts {
    iec?: boolean;
    bits?: boolean;
  }

  interface HybridByteRelations {
    raw: string;
    bits: string;
    size: ByteValue;
    bytes: string;
    iecBits: string;
    iecBytes: string;
  }

  interface StaticByteParser {
    (size: number): ByteString;
  }

  interface StaticSizeParser {
    (size: ByteString): ByteValue;
  }

  interface StaticRelativeSizer {
    (size: HybridByte): ByteString;
  }

  interface RelativeStruct {
    /**
     * Show relativity in parsing `size` to all its variations in both decimal and binary
     * @param size A hybrid byte format i.e Either a number or a ByteString
     * @param options Options for internal `xbyte` formatting
     * @example
     *   >>> relative("16 GB")
     *   |>| {
     *   |>|  bits: "128.00 Gb",
     *   |>|  bytes: "16.00 GB",
     *   |>|  iecBits: "119.21 Gib",
     *   |>|  iecBytes: "14.90 GiB",
     *   |>|  raw: "16 GB",
     *   |>|  size: 16000000000,
     *   |>| }
     */
    (size: HybridByte, options?: MainOpts): HybridByteRelations;
    /**
     * Show the input size in relation to its `bit` format
     */
    bits(size: HybridByte): ByteString;
    /**
     * Show the input size in relation to its `byte` format
     */
    bytes(size: HybridByte): ByteString;
    /**
     * Show the input size in relation to its `bit` format under `IEC Standards`
     */
    iecBits(size: HybridByte): ByteString;
    /**
     * Show the input size in relation to its `bytes` format under `IEC Standards`
     */
    iecBytes(size: HybridByte): ByteString;
    /**
     * Parse a hybrid byte into any unit, following the relativity
     * @param size A hybrid byte format i.e Either a number or a ByteString
     * @param unit The unit for relativity
     * @param options Options for internal `xbytes` formatting
     * @example
     *   >>> relative.size('1KiB', 'B')
     *   |>| "1024.00 B"
     *   >>> relative.size('473.47 GiB', 'kib')
     *   |>| "3971754229.76 Kib"
     *   >>> relative.size(28474474857737, 'TiB')
     *   |>| "25.90 TiB"
     */
    size(size: HybridByte, unit: AllUnitStacks, options?: MainOpts): ByteString;
  }

  /**
   * An extension of the `genericMatcher` with the `i` flag
   */
  const byteFilter: RegExp;
  /**
   * 
   */
  const unitMatcher: RegExp;
  /**
   * The raw Regular expression used in scanning all string units
   */
  const genericMatcher: RegExp;
  /**
   * An extension of the `genericMatcher` with the `gi` flags
   */
  const globalByteFilter: RegExp;
  /**
   * Check if the provided string is a parsed byte in string format
   * @param stringBytes A parsed byte in string format
   */
  function isBytes(stringBytes: ByteString): boolean;
  /**
   * Check if the input value is a parsable byte-related object _i.e_ either a raw byte number or a ByteString
   * @param input
   */
  function isParsable(input: Number | ByteString): boolean;

  const relative: RelativeStruct

  /**
   * Extract bytes from a string
   * @param stringOfbytes A string with possible bytes contained
   */
  function extractBytes(stringOfbytes: string): Array<ByteString>;
  /**
   * Parse a string size to numeric bytes
   * @param stringBytes A parsed byte in string format
   * @param options.iec Whether or not to enforce compliance to IEC Standards
   * @param options.bits Whether or not to parse a lower case 'b' as bits
  */
  function parseSize(stringBytes: ByteString, options?: ParseByteOpts): ByteValue;
  /**
   * Parse a unit to its components
   * @param unit The unit to parse into its components
   */
  function parseUnit(unit: AllUnitStacks): ParsedUnit;
  /**
   * 
   * @param size A hybrid byte format i.e Either a number or a ByteString
   * @param options.iec Whether or not to enforce compliance to IEC Standards
   * @param options.bits Whether or not to parse a lower case 'b' as bits
   */
  function parseBytes(size: HybridByte, options?: ParseByteOpts): TotalParsedBytes
  /**
   * Expose a string byte into its component parts
   * @param stringBytes A parsed byte in string format
   */
  function parseString(stringBytes: ByteString): ParsedBytes;

  /**
   * Create a ByteUnitObject around the specified HybridByte
     * @param size The value to be wrapped
     * @example
     * |> createObject('10 MB').add('20 MB').size
     *  << '30.00 MB'
     * |> createObject('20 GB').divide('10 MB').size
     *  << '2.00 KB'
     */
  function createObject(size: HybridByte): ByteUnitObject;
  class ByteUnitObject extends TotalParsedBytes {
    /**
     * Wrap a HybridByte in a chainable, transformative object
     * @param size The value to be wrapped
     * @example
     * |> new ByteUnitObject('10 MB').add('20 MB').size
     *  << '30.00 MB'
     * |> new ByteUnitObject('20 GB').divide('10 MB').size
     *  << '2.00 KB'
     */
    constructor(size: HybridByte): void
    /**
     * Method to check integrity of internal bytes
     * Throw if there's a detected error
     */
    checkInternalByteVal(): void
    /**
     * Add byte(s) to the internal bytes, resulting in a new ByteUnitObject object with the value
     * @param bytes Byte(s) to add to the root byte
     */
    add(bytes: HybridByte | HybridByte[]): ByteUnitObject
    /**
     * Subtract byte(s) from the internal bytes, resulting in a new ByteUnitObject object with the value
     * @param bytes Byte(s) to subract from the root byte
     */
    subtract(bytes: HybridByte | HybridByte[]): ByteUnitObject
    /**
     * Multiply byte(s) with the internal bytes, resulting in a new ByteUnitObject object with the value
     * @param bytes Byte(s) to multiply with the root byte
     */
    multiply(bytes: HybridByte | HybridByte[]): ByteUnitObject
    /**
     * Divide internal bytes by byte(s) specified, resulting in a new ByteUnitObject object with the value
     * @param bytes Byte(s) to divide with
     */
    divide(bytes: HybridByte | HybridByte[]): ByteUnitObject
  }

  /**
   * Create a byte parser with static, predefined options
   * @param config Static configuration for `xbytes`
   */
  function createByteParser(config: MainOpts): StaticByteParser;
  /**
   * Create a size parser with static, predefined options
   * @param config Static configuration for `parseSize`
   */
  function createSizeParser(config: ParseByteOpts): StaticSizeParser;
  /**
   * Create a static parser for converting a hybrid byte into any set unit under predefined configuration
   * @param unit The unit for relativity
   * @param config Static configuration for `relative.size`
   */
  function createRelativeSizer(unit: AllUnitStacks, config?: MainOpts): StaticRelativeSizer;
}
/**
 * Make bytes human readable
 * @param size Size in bytes to be parsed
 */
declare function xbytes(size: xbytes.ByteValue, options?: xbytes.MainOpts): xbytes.ByteString;

export = xbytes
