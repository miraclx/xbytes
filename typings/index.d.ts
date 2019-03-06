export type KeyUnitStack = 'B'|'K'|'M'|'G'|'T'|'P'|'E'|'Z'|'Y';
export type ShortUnitStack = 'B'|'KB'|'MB'|'GB'|'TB'|'PB'|'EB'|'ZB'|'YB';
export type ShortBitUnitStack = 'b'|'Kb'|'Mb'|'Gb'|'Tb'|'Pb'|'Eb'|'Zb'|'Yb';
export type ShortIECUnitStack = 'B'|'KiB'|'MiB'|'GiB'|'TiB'|'PiB'|'EiB'|'ZiB'|'YiB';
export type ShortIECBitUnitStack = 'b'|'Kib'|'Mib'|'Gib'|'Tib'|'Pib'|'Eib'|'Zib'|'Yib';
export type AllUnitStacks = ShortUnitStack | ShortBitUnitStack | ShortIECUnitStack | ShortIECBitUnitStack;

export type ByteValue = number;
export type ByteString = string;
export type HybridByte =  ByteValue | ByteString;

interface InternalParsedUnit {
  iec:  boolean;
  type: 'b' | 'B';
  bits: boolean;
  byte: boolean;
  prefix: KeyUnitStack;
  prefixIndex: number;
}

export interface ParsedUnit extends InternalParsedUnit {
  input: AllUnitStacks;
}

export interface ParsedBytes extends InternalParsedUnit {
  unit: AllUnitStacks;
  input: HybridByte;
  value: ByteValue;
}

interface TotalParsedBytes extends ParsedBytes {
  size: ByteString;
  bytes: ByteValue;
  input: HybridByte;
}

export interface MainOpts {
  iec: boolean;
  bits: boolean;
  fixed: number;
  short: boolean;
  space: boolean;
  prefixIndex: number;
}

export interface ParseByteOpts {
  iec: boolean;
  bits: boolean;
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
  size(size: HybridByte, unit: AllUnitStacks, options: MainOpts): ByteString;
}

/**
 * An extension of the `genericMatcher` with the `i` flag
 */
export const byteFilter: RegExp;
/**
 * 
 */
export const unitMatcher: RegExp;
/**
 * The raw Regular expression used in scanning all string units
 */
export const genericMatcher: RegExp;
/**
 * An extension of the `genericMatcher` with the `gi` flags
 */
export const globalByteFilter: RegExp;
/**
 * Check of the provided string is a parsed byte in string format
 * @param stringBytes A parsed byte in string format
 */
export function isBytes(stringBytes: ByteString): boolean;

export const relative: RelativeStruct

/**
 * Extract bytes from a string
 * @param stringOfbytes A string with possible bytes contained
 */
export function extractBytes(stringOfbytes: string): Array<ByteString>;
/**
 * Parse a string size to numeric bytes
 * @param stringBytes A parsed byte in string format
 * @param options.iec Whether or not to enforce compliance to IEC Standards
 * @param options.bits Whether or not to parse a lower case 'b' as bits
*/
export function parseSize(stringBytes: ByteString, options: ParseByteOpts): ByteValue;
/**
 * Parse a unit to its components
 * @param unit The unit to parse into its components
 */
export function parseUnit(unit: AllUnitStacks): ParsedUnit;
/**
 * 
 * @param size A hybrid byte format i.e Either a number or a ByteString
 * @param options.iec Whether or not to enforce compliance to IEC Standards
 * @param options.bits Whether or not to parse a lower case 'b' as bits
 */
export function parseBytes(size: HybridByte, options: ParseByteOpts): TotalParsedBytes
/**
 * Expose a string byte into its component parts
 * @param stringBytes A parsed byte in string format
 */
export function parseString(stringBytes: ByteString): ParsedBytes;
/**
 * Create a byte parser with static, predefined options
 * @param config Static configuration for `xbytes`
 */
export function createByteParser(config: MainOpts): StaticByteParser;
/**
 * Create a size parser with static, predefined options
 * @param config Static configuration for `parseSize`
 */
export function createSizeParser(config: ParseByteOpts): StaticSizeParser;
/**
 * Create a static parser for converting a hybrid byte into any set unit under predefined configuration
 * @param unit The unit for relativity
 * @param config Static configuration for `relative.size`
 */
export function createRelativeSizer(unit: AllUnitStacks, config: MainOpts): StaticRelativeSizer;

/**
 * Make bytes human readable
 * @param size Size in bytes to be parsed
 */
declare function xbytes(size: ByteValue, options?: MainOpts): ByteString;

declare module "xbytes" {
  export = xbytes;
}
