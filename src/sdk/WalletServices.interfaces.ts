import * as bsv from '@bsv/sdk'
import { sdk } from '..'
import { ChaintracksClientApi } from '../services/chaintracker'
/**
 * Defines standard interfaces to access functionality implemented by external transaction processing services.
 */
export interface WalletServices {

    /**
     * Approximate exchange rate US Dollar / BSV, USD / BSV
     * 
     * This is the US Dollar price of one BSV
     */
    getBsvExchangeRate() : Promise<number>

    /**
     * Approximate exchange rate currency per base.
     */
    getFiatExchangeRate(currency: "USD" | "GBP" | "EUR", base?: "USD" | "GBP" | "EUR") : Promise<number>

    /**
     * Attempts to obtain the raw transaction bytes associated with a 32 byte transaction hash (txid).
     * 
     * Cycles through configured transaction processing services attempting to get a valid response.
     * 
     * On success:
     * Result txid is the requested transaction hash
     * Result rawTx will be Buffer containing raw transaction bytes.
     * Result name will be the responding service's identifying name.
     * Returns result without incrementing active service.
     * 
     * On failure:
     * Result txid is the requested transaction hash
     * Result mapi will be the first mapi response obtained (service name and response), or null
     * Result error will be the first error thrown (service name and CwiError), or null
     * Increments to next configured service and tries again until all services have been tried.
     *
     * @param txid transaction hash for which raw transaction bytes are requested
     * @param useNext optional, forces skip to next service before starting service requests cycle.
     */
    getRawTx(txid: string, useNext?: boolean): Promise<GetRawTxResultApi>

    /**
     * Attempts to obtain the merkle proof associated with a 32 byte transaction hash (txid).
     * 
     * Cycles through configured transaction processing services attempting to get a valid response.
     * 
     * On success:
     * Result txid is the requested transaction hash
     * Result proof will be the merkle proof.
     * Result name will be the responding service's identifying name.
     * Returns result without incrementing active service.
     * 
     * On failure:
     * Result txid is the requested transaction hash
     * Result mapi will be the first mapi response obtained (service name and response), or null
     * Result error will be the first error thrown (service name and CwiError), or null
     * Increments to next configured service and tries again until all services have been tried.
     *
     * @param txid transaction hash for which proof is requested
     * @param useNext optional, forces skip to next service before starting service requests cycle.
     */
    getMerklePath(txid: string, useNext?: boolean): Promise<GetMerklePathResultApi>

    /**
     * 
     * @param beef 
     * @param txids
     * @param chain 
     * @returns
     */
    postBeef(beef: number[], txids: string[]): Promise<PostBeefResultApi[]>

    /**
     * Attempts to determine the UTXO status of a transaction output.
     * 
     * Cycles through configured transaction processing services attempting to get a valid response.
     * 
     * @param output transaction output identifier in format determined by `outputFormat`.
     * @param chain which chain to post to, all of rawTx's inputs must be unspent on this chain.
     * @param outputFormat optional, supported values:
     *      'hashLE' little-endian sha256 hash of output script
     *      'hashBE' big-endian sha256 hash of output script
     *      'script' entire transaction output script
     *      undefined if asBuffer length of `output` is 32 then 'hashBE`, otherwise 'script'.
     * @param useNext optional, forces skip to next service before starting service requests cycle.
     */
    getUtxoStatus(output: string, outputFormat?: GetUtxoStatusOutputFormatApi, useNext?: boolean): Promise<GetUtxoStatusResultApi>

}

export type GetUtxoStatusOutputFormatApi = 'hashLE' | 'hashBE' | 'script'

export interface BsvExchangeRateApi {
    timestamp: Date,
    base: "USD",
    rate: number
}

export interface FiatExchangeRatesApi {
    timestamp: Date,
    base: "USD",
    rates: Record<string, number>
}

export interface WalletServiceOptions {
    chain: sdk.Chain
    taalApiKey?: string
    bsvExchangeRate: BsvExchangeRateApi
    bsvUpdateMsecs: number
    fiatExchangeRates: FiatExchangeRatesApi
    fiatUpdateMsecs: number
    disableMapiCallback?: boolean,
    exchangeratesapiKey?: string
    chaintracksFiatExchangeRatesUrl?: string
    chaintracks?: ChaintracksClientApi
}

/**
 * Properties on result returned from `CwiExternalServicesApi` function `getRawTx`.
 */
export interface GetRawTxResultApi {
    /**
     * Transaction hash or rawTx (and of initial request)
     */
    txid: string
    /**
     * The name of the service returning the rawTx, or undefined if no rawTx
     */
    name?: string
    /**
     * Multiple proofs may be returned when a transaction also appears in
     * one or more orphaned blocks
     */
    rawTx?: number[]
    /**
     * The first exception error that occurred during processing, if any.
     */
    error?: sdk.WalletError
}

/**
 * Properties on result returned from `CwiExternalServicesApi` function `getMerkleProof`.
 */
export interface GetMerklePathResultApi {
    /**
     * The name of the service returning the proof, or undefined if no proof
     */
    name?: string
    /**
     * Multiple proofs may be returned when a transaction also appears in
     * one or more orphaned blocks
     */
    merklePath?: bsv.MerklePath
    /**
     * The first exception error that occurred during processing, if any.
     */
    error?: sdk.WalletError
}

export interface PostBeefResultForTxidApi {
    txid: string

    /**
     * 'success' - The transaction was accepted for processing
     */
    status: 'success' | 'error'

    /**
     * if true, the transaction was already known to this service. Usually treat as a success.
     * 
     * Potentially stop posting to additional transaction processors.
     */
    alreadyKnown?: boolean

    blockHash?: string
    blockHeight?: number
    merklePath?: bsv.MerklePath
}

/**
 * Properties on array items of result returned from `CwiExternalServicesApi` function `postBeef`.
 */
export interface PostBeefResultApi {
    /**
     * The name of the service to which the transaction was submitted for processing
     */
    name: string
    /**
     * 'success' - The beef was accepted for processing
     */
    status: 'success' | 'error'
    /**
     * When status is 'error', provides code and description
     * 
     * Specific potential errors:
     * ERR_BAD_REQUEST
     * ERR_EXTSVS_DOUBLE_SPEND
     * ERR_EXTSVS_ALREADY_MINED (description has error details)
     * ERR_EXTSVS_INVALID_TRANSACTION (description has error details)
     * ERR_EXTSVS_TXID_INVALID (service response txid doesn't match rawTx)
     */
    error?: sdk.WalletError

    txids: PostBeefResultForTxidApi[]

    /**
     * Service response object. Use service name and status to infer type of object.
     */
    data?: object
}

export interface GetUtxoStatusDetailsApi {
    /**
     * if isUtxo, the block height containing the matching unspent transaction output
     * 
     * typically there will be only one, but future orphans can result in multiple values
     */
    height?: number
    /**
     * if isUtxo, the transaction hash (txid) of the transaction containing the matching unspent transaction output
     * 
     * typically there will be only one, but future orphans can result in multiple values
     */
    txid?: string
    /**
     * if isUtxo, the output index in the transaction containing of the matching unspent transaction output
     * 
     * typically there will be only one, but future orphans can result in multiple values
     */
    index?: number
    /**
     * if isUtxo, the amount of the matching unspent transaction output
     * 
     * typically there will be only one, but future orphans can result in multiple values
     */
    satoshis?: number
}

export interface GetUtxoStatusResultApi {
    /**
     * The name of the service to which the transaction was submitted for processing
     */
    name: string
    /**
     * 'success' - the operation was successful, non-error results are valid.
     * 'error' - the operation failed, error may have relevant information.
     */
    status: 'success' | 'error'
    /**
     * When status is 'error', provides code and description
     */ 
    error?: sdk.WalletError
    /**
     * true if the output is associated with at least one unspent transaction output
     */
    isUtxo?: boolean
    /**
     * Additional details about occurances of this output script as a utxo.
     * 
     * Normally there will be one item in the array but due to the possibility of orphan races
     * there could be more than one block in which it is a valid utxo.
     */
    details: GetUtxoStatusDetailsApi[]
}

export type GetUtxoStatusServiceApi = (output: string, chain: sdk.Chain, outputFormat?: GetUtxoStatusOutputFormatApi) => Promise<GetUtxoStatusResultApi>

export type GetMerklePathServiceApi = (txid: string, chain: sdk.Chain, hashToHeight?: HashToHeight) => Promise<GetMerklePathResultApi>

export type GetRawTxServiceApi = (txid: string, chain: sdk.Chain) => Promise<GetRawTxResultApi>

export type PostBeefServiceApi = (beef: number[] | bsv.Beef, txids: string[], chain: sdk.Chain) => Promise<PostBeefResultApi>

export type UpdateFiatExchangeRateServiceApi = (targetCurrencies: string[], options: WalletServiceOptions) => Promise<FiatExchangeRatesApi>

export type HashToHeight = (hash: string) => Promise<number | undefined>