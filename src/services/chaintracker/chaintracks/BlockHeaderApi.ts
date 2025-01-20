import { asBuffer, asString } from "../../../index.client"

/**
 * These are fields of 80 byte serialized header in order whose double sha256 hash is a block's hash value
 * and the next block's previousHash value.
 *
 * All block hash values and merkleRoot values are 32 byte Buffer values with the byte order reversed from the serialized byte order.
 */
export interface BaseBlockHeader {
  /**
   * Block header version value. Serialized length is 4 bytes.
   */
  version: number
  /**
   * Hash of previous block's block header. Serialized length is 32 bytes.
   */
  previousHash: Buffer
  /**
   * Root hash of the merkle tree of all transactions in this block. Serialized length is 32 bytes.
   */
  merkleRoot: Buffer
  /**
   * Block header time value. Serialized length is 4 bytes.
   */
  time: number
  /**
   * Block header bits value. Serialized length is 4 bytes.
   */
  bits: number
  /**
   * Block header nonce value. Serialized length is 4 bytes.
   */
  nonce: number
}

/**
 * A `BaseBlockHeader` extended with its computed hash and height in its chain.
 */
export interface BlockHeader extends BaseBlockHeader {
  /**
     * Height of the header, starting from zero.
     */
  height: number
  /**
     * The double sha256 hash of the serialized `BaseBlockHeader` fields.
     */
  hash: Buffer
}

/**
 * Like BlockHeader but 32 byte fields are hex encoded strings.
 */
export interface BaseBlockHeaderHex {
  version: number
  previousHash: string
  merkleRoot: string
  time: number
  bits: number
  nonce: number
}

/**
 * Like BlockHeader but 32 byte fields are hex encoded strings.
 */
export interface BlockHeaderHex extends BaseBlockHeaderHex {
  height: number
  hash: string
}


/**
 * The "live" portion of the block chain is recent history that can conceivably be subject to reorganizations.
 * The additional fields support tracking orphan blocks, chain forks, and chain reorgs.
 */
export interface LiveBlockHeader extends BlockHeader {
  /**
     * The cummulative chainwork achieved by the addition of this block to the chain.
     * Chainwork only matters in selecting the active chain.
     */
  chainWork: Buffer
  /**
     * True only if this header is currently a chain tip. e.g. There is no header that follows it by previousHash or previousHeaderId.
     */
  isChainTip: boolean
  /**
     * True only if this header is currently on the active chain.
     */
  isActive: boolean
  /**
     * As there may be more than one header with identical height values due to orphan tracking,
     * headers are assigned a unique headerId while part of the "live" portion of the block chain.
     */
  headerId: number
  /**
     * Every header in the "live" portion of the block chain is linked to an ancestor header through
     * both its previousHash and previousHeaderId properties.
     *
     * Due to forks, there may be multiple headers with identical `previousHash` and `previousHeaderId` values.
     * Of these, only one (the header on the active chain) will have `isActive` === true.
     */
  previousHeaderId: number | null
}

/**
 * Like LiveBlockHeader but 32 byte fields are hex encoded strings.
 */
export interface LiveBlockHeaderHex extends BlockHeaderHex {
  chainWork: string
  isChainTip: boolean
  isActive: boolean
  headerId: number
  previousHeaderId: number | null
}

//
// TYPE GUARDS
//

/**
 * Type guard function.
 * @publicbody
 */
export function isLive (header: BlockHeader | LiveBlockHeader): header is LiveBlockHeader {
  return (header as LiveBlockHeader).headerId !== undefined
}

/**
 * Type guard function.
 * @publicbody
 */
export function isBaseBlockHeader (header: BaseBlockHeader | BlockHeader | LiveBlockHeader | BaseBlockHeaderHex | BlockHeaderHex | LiveBlockHeaderHex): header is BaseBlockHeader {
  return Buffer.isBuffer(header.previousHash)
}

/**
 * Type guard function.
 * @publicbody
 */
export function isBlockHeader (header: BaseBlockHeader | BlockHeader | LiveBlockHeader | BaseBlockHeaderHex | BlockHeaderHex | LiveBlockHeaderHex): header is LiveBlockHeader {
  return ('height' in header) && Buffer.isBuffer(header.previousHash)
}

/**
 * Type guard function.
 * @publicbody
 */
export function isLiveBlockHeader (header: BaseBlockHeader | BlockHeader | LiveBlockHeader | BaseBlockHeaderHex | BlockHeaderHex | LiveBlockHeaderHex): header is LiveBlockHeader {
  return 'chainwork' in header && Buffer.isBuffer(header.previousHash)
}

/**
 * Type guard function.
 * @publicbody
 */
export function isBaseBlockHeaderHex (header: BaseBlockHeader | BlockHeader | LiveBlockHeader | BaseBlockHeaderHex | BlockHeaderHex | LiveBlockHeaderHex): header is BaseBlockHeaderHex {
  return (typeof header.previousHash === 'string')
}

/**
 * Type guard function.
 * @publicbody
 */
export function isBlockHeaderHex (header: BaseBlockHeader | BlockHeader | LiveBlockHeader | BaseBlockHeaderHex | BlockHeaderHex | LiveBlockHeaderHex): header is BlockHeaderHex {
  return ('height' in header) && (typeof header.previousHash === 'string')
}

/**
 * Type guard function.
 * @publicbody
 */
export function isLiveBlockHeaderHex (header: BaseBlockHeader | BlockHeader | LiveBlockHeader | BaseBlockHeaderHex | BlockHeaderHex | LiveBlockHeaderHex): header is LiveBlockHeaderHex {
  return 'chainwork' in header && (typeof header.previousHash === 'string')
}

/**
 * Type conversion function.
 * @publicbody
 */
export function toBaseBlockHeaderHex (header: BaseBlockHeader | BlockHeader | LiveBlockHeader): BaseBlockHeaderHex {
  return {
    version: header.version,
    previousHash: asString(header.previousHash),
    merkleRoot: asString(header.merkleRoot),
    time: header.time,
    bits: header.bits,
    nonce: header.nonce
  }
}

/**
 * Type conversion function.
 * @publicbody
 */
export function toBlockHeaderHex (header: BlockHeader | LiveBlockHeader): BlockHeaderHex {
  return {
    version: header.version,
    previousHash: asString(header.previousHash),
    merkleRoot: asString(header.merkleRoot),
    time: header.time,
    bits: header.bits,
    nonce: header.nonce,
    height: header.height,
    hash: asString(header.hash)
  }
}

/**
 * Type conversion function.
 * @publicbody
 */
export function toLiveBlockHeaderHex (header: LiveBlockHeader): LiveBlockHeaderHex {
  return {
    ...header,
    previousHash: asString(header.previousHash),
    merkleRoot: asString(header.merkleRoot),
    hash: asString(header.hash),
    chainWork: asString(header.chainWork)
  }
}

/**
 * Type conversion function.
 * @publicbody
 */
export function toBaseBlockHeader (header: BaseBlockHeaderHex | BlockHeaderHex | LiveBlockHeaderHex): BaseBlockHeader {
  return {
    version: header.version,
    previousHash: asBuffer(header.previousHash),
    merkleRoot: asBuffer(header.merkleRoot),
    time: header.time,
    bits: header.bits,
    nonce: header.nonce
  }
}

/**
 * Type conversion function.
 * @publicbody
 */
export function toBlockHeader (header: BlockHeaderHex | LiveBlockHeaderHex): BlockHeader {
  return {
    version: header.version,
    previousHash: asBuffer(header.previousHash),
    merkleRoot: asBuffer(header.merkleRoot),
    time: header.time,
    bits: header.bits,
    nonce: header.nonce,
    height: header.height,
    hash: asBuffer(header.hash)
  }
}

/**
 * Type conversion function.
 * @publicbody
 */
export function toLiveBlockHeader (header: LiveBlockHeaderHex): LiveBlockHeader {
  return {
    ...header,
    previousHash: asBuffer(header.previousHash),
    merkleRoot: asBuffer(header.merkleRoot),
    hash: asBuffer(header.hash),
    chainWork: asBuffer(header.chainWork)
  }
}
