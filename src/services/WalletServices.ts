import * as bsv from '@bsv/sdk'
import { asArray, asString, convertProofToMerklePath, doubleSha256BE, randomBytesHex, sdk, sha256Hash } from '..'
import { WalletServiceOptions as WalletServicesOptions, FiatExchangeRatesApi, GetMerklePathResultApi, GetMerklePathServiceApi, GetRawTxResultApi, GetRawTxServiceApi, GetUtxoStatusOutputFormatApi, GetUtxoStatusResultApi, GetUtxoStatusServiceApi, PostBeefResultApi, PostBeefResultForTxidApi, PostBeefServiceApi, UpdateFiatExchangeRateServiceApi, HashToHeight } from '../sdk/WalletServices.interfaces'
import { ServiceCollection } from './ServiceCollection'
import axios from 'axios'
import { Readable } from 'stream'
import { ChaintracksServiceClient } from './chaintracker'

export class WalletServices implements sdk.WalletServices {
    static createDefaultOptions(chain: sdk.Chain) : WalletServicesOptions {
        const o: WalletServicesOptions = {
            chain,
            taalApiKey: chain === 'main' ? "mainnet_9596de07e92300c6287e4393594ae39c" // Tone's key, no plan
                : "testnet_0e6cf72133b43ea2d7861da2a38684e3", // Tone's personal "starter" key
            bsvExchangeRate: {
                timestamp: new Date('2023-12-13'),
                base: "USD",
                rate: 47.52
            },
            bsvUpdateMsecs: 1000 * 60 * 15, // 15 minutes
            fiatExchangeRates: {
                timestamp: new Date('2023-12-13'),
                base: "USD",
                rates: {
                    "USD": 1,
                    "GBP": 0.8,
                    "EUR": 0.93
                }
            },
            fiatUpdateMsecs: 1000 * 60 * 60 * 24, // 24 hours
            disableMapiCallback: true, // Rely on DojoWatchman by default.
            exchangeratesapiKey: 'bd539d2ff492bcb5619d5f27726a766f',
            chaintracksFiatExchangeRatesUrl: `https://npm-registry.babbage.systems:${chain === 'main' ? 8084 : 8083 }/getFiatExchangeRates`,
            chaintracks: new ChaintracksServiceClient(chain, `https://npm-registry.babbage.systems:${chain === 'main' ? 8084 : 8083}`)
        }
        return o
    }

    options: WalletServicesOptions

    getMerklePathServices: ServiceCollection<GetMerklePathServiceApi>
    getRawTxServices: ServiceCollection<GetRawTxServiceApi>
    postBeefServices: ServiceCollection<PostBeefServiceApi>
    getUtxoStatusServices: ServiceCollection<GetUtxoStatusServiceApi>
    updateFiatExchangeRateServices: ServiceCollection<UpdateFiatExchangeRateServiceApi>

    chain: sdk.Chain

    constructor(optionsOrChain: sdk.Chain | WalletServicesOptions) {
        this.chain = (typeof optionsOrChain === 'string') ? optionsOrChain :  optionsOrChain.chain

        this.options = (typeof optionsOrChain === 'string') ? WalletServices.createDefaultOptions(this.chain) : optionsOrChain
        
        this.getMerklePathServices = new ServiceCollection<GetMerklePathServiceApi>()
        .add({ name: 'WhatsOnChainTsc', service: getMerklePathFromWhatsOnChainTsc})
       // .add({ name: 'Taal', service: this.makeGetProofFromTaal() })
        
        this.getRawTxServices = new ServiceCollection<GetRawTxServiceApi>()
        .add({ name: 'WhatsOnChain', service: getRawTxFromWhatsOnChain})

        this.postBeefServices = new ServiceCollection<PostBeefServiceApi>()
        .add({ name: 'TaalArc', service: postBeefToTaalArcMiner })

        this.getUtxoStatusServices = new ServiceCollection<GetUtxoStatusServiceApi>()
        .add({ name: 'WhatsOnChain', service: getUtxoStatusFromWhatsOnChain})
        
        this.updateFiatExchangeRateServices = new ServiceCollection<UpdateFiatExchangeRateServiceApi>()
        //.add({ name: 'ChaintracksService', service: updateChaintracksFiatExchangeRates })
        //.add({ name: 'exchangeratesapi', service: updateExchangeratesapi })
    }

    async getBsvExchangeRate(): Promise<number> {
        throw new sdk.WERR_NOT_IMPLEMENTED()
        //this.options.bsvExchangeRate = await updateBsvExchangeRate(this.options.bsvExchangeRate, this.options.bsvUpdateMsecs)
        //return this.options.bsvExchangeRate.rate
    }

    async getFiatExchangeRate(currency: "USD" | "GBP" | "EUR", base?: "USD" | "GBP" | "EUR"): Promise<number> {
        const rates = await this.updateFiatExchangeRates(this.options.fiatExchangeRates, this.options.fiatUpdateMsecs)

        this.options.fiatExchangeRates = rates

        base ||= 'USD'
        const rate = rates.rates[currency] / rates.rates[base]

        return rate
    }

    targetCurrencies = ['USD', 'GBP', 'EUR']

    async updateFiatExchangeRates(rates?: FiatExchangeRatesApi, updateMsecs?: number): Promise<FiatExchangeRatesApi> {

        updateMsecs ||= 1000 * 60 * 15
        const freshnessDate = new Date(Date.now() - updateMsecs)
        if (rates) {
            // Check if the rate we know is stale enough to update.
            updateMsecs ||= 1000 * 60 * 15
            if (rates.timestamp > freshnessDate)
                return rates
        }

        // Make sure we always start with the first service listed (chaintracks aggregator)
        const services = this.updateFiatExchangeRateServices.clone()

        let r0: FiatExchangeRatesApi | undefined

        for (let tries = 0; tries < services.count; tries++) {
            const service = services.service
            try {
                const r = await service(this.targetCurrencies, this.options)
                if (this.targetCurrencies.every(c => typeof r.rates[c] === 'number')) {
                    r0 = r
                    break
                }
            } catch (eu: unknown) {
                const e = sdk.WalletError.fromUnknown(eu)
                console.log(`updateFiatExchangeRates servcice name ${service.name} error ${e.message}`)
            }
            services.next()
        }

        if (!r0) {
            console.error('Failed to update fiat exchange rates.')
            if (!rates) throw new sdk.WERR_INTERNAL()
            return rates
        }

        return r0
    }

    private taalApiKey() {
         const key = this.options.taalApiKey
         if (!key) throw new sdk.WERR_MISSING_PARAMETER(`options.taalApiKey`)
         return key
    }

    private makeGetProofFromTaal() {
        return (txid: string, hashToHeight?: HashToHeight) => {
            return getMerklePathFromTaal(txid, this.taalApiKey(), hashToHeight)
        }
    }

    get getProofsCount() { return this.getMerklePathServices.count }
    get getRawTxsCount() { return this.getRawTxServices.count }
    get postBeefServicesCount() { return this.postBeefServices.count }
    get getUtxoStatsCount() { return this.getUtxoStatusServices.count }

    async getUtxoStatus(output: string, outputFormat?: GetUtxoStatusOutputFormatApi, useNext?: boolean): Promise<GetUtxoStatusResultApi> {
        const services = this.getUtxoStatusServices
        if (useNext)
            services.next()

        let r0: GetUtxoStatusResultApi = { name: "<noservices>", status: "error", error: new sdk.WERR_INTERNAL('No services available.'), details: [] }

        for (let tries = 0; tries < services.count; tries++) {
            const service = services.service
            const r = await service(output, this.chain, outputFormat)
            if (r.status === 'success') {
                r0 = r
                break
            }
            services.next()
        }
        return r0
    }

    /**
     * 
     * @param beef 
     * @param chain 
     * @returns
     */
    async postBeef(beef: number[] | bsv.Beef, txids: string[]): Promise<PostBeefResultApi[]> {
        
        const rs = await Promise.all(this.postBeefServices.allServices.map(async service => {
            const r = await service(beef, txids, this.chain)
            return r
        }))

        return rs
    }

    async getRawTx(txid: string, useNext?: boolean): Promise<GetRawTxResultApi> {
        
        if (useNext)
            this.getRawTxServices.next()

        const r0: GetRawTxResultApi = { txid }

        for (let tries = 0; tries < this.getRawTxServices.count; tries++) {
            const service = this.getRawTxServices.service
            const r = await service(txid, this.chain)
            if (r.rawTx) {
                const hash = asString(doubleSha256BE(r.rawTx!))
                // Confirm transaction hash matches txid
                if (hash === asString(txid)) {
                    // If we have a match, call it done.
                    r0.rawTx = r.rawTx
                    r0.name = r.name
                    r0.error = undefined
                    break
                }
                r.error = new sdk.WERR_INTERNAL(`computed txid ${hash} doesn't match requested value ${txid}`)
                r.rawTx = undefined
            }
            if (r.error && !r0.error && !r0.rawTx)
                // If we have an error and didn't before...
                r0.error = r.error

            this.getRawTxServices.next()
        }
        return r0
    }

    async getMerklePath(txid: string, useNext?: boolean): Promise<GetMerklePathResultApi> {
        const hashToHeight: HashToHeight | undefined = !this.options.chaintracks ? undefined
            : async (hash) => {
                const header = await this.options.chaintracks!.findHeaderHexForBlockHash(hash)
                if (!header) return undefined;
                return header.height
        }
        
        if (useNext)
            this.getMerklePathServices.next()

        const r0: GetMerklePathResultApi = {}

        for (let tries = 0; tries < this.getMerklePathServices.count; tries++) {
            const service = this.getMerklePathServices.service
            const r = await service(txid, this.chain, hashToHeight)
            if (r.merklePath) {
                // If we have a proof, call it done.
                r0.merklePath = r.merklePath
                r0.name = r.name
                r0.error = undefined
                break
            } else if (r.error && !r0.error)
                // If we have an error and didn't before...
                r0.error = r.error

            this.getMerklePathServices.next()
        }
        return r0
    }
}

/**
 * WhatOnChain.com has their own "hash/pos/R/L" proof format and a more TSC compliant proof format.
 * 
 * The "/proof/tsc" endpoint is much closer to the TSC specification. It provides "index" directly and each node is just the provided hash value.
 * The "targetType" is unspecified and thus defaults to block header hash, requiring a Chaintracks lookup to get the merkleRoot...
 * Duplicate hash values are provided in full instead of being replaced by "*".
 * 
 * @param txid
 * @param chain 
 * @returns 
 */
export async function getMerklePathFromWhatsOnChainTsc(txid: string, chain: sdk.Chain, hashToHeight?: HashToHeight): Promise<GetMerklePathResultApi> {
    if (!hashToHeight) throw new sdk.WERR_INVALID_PARAMETER('options.chaintracks', 'valid for getMerklePath to work.')

    const r: GetMerklePathResultApi = { name: 'WoCTsc' }

    try {
        const { data } = await axios.get(`https://api.whatsonchain.com/v1/bsv/${chain}/tx/${txid}/proof/tsc`)
        if (!data || data.length < 1)
           return r 

        const p = data[0]
        const height = await hashToHeight(p.target)
        if (!height) throw new sdk.WERR_INVALID_PARAMETER('blockhash', 'a valid on-chain block hash')
        const proof = { index: p.index, nodes: p.nodes, height }
        r.merklePath = convertProofToMerklePath(txid, proof)

    } catch (err: unknown) {
        r.error = sdk.WalletError.fromUnknown(err)
    }

    return r
}

interface WhatsOnChainProofTsc {
    index: number,
    txOrId: string,
    target: string,
    nodes: string[]
}

/**
 * Taal.com has the most functional txStatus and merkleProof endpoint for both mainNet and testNet
 * 
 * Proofs use targetType "header" which is converted to "merkleRoot".
 * 
 * Proofs correctly use duplicate computed node value symbol "*".
 * 
 * An apiKey must be used and must correspond to the target chain: mainNet or testNet.
 * 
 * @param txid 
 * @param apiKey 
 * @returns 
 */
export async function getMerklePathFromTaal(txid: string, apiKey: string, hashToHeight?: HashToHeight): Promise<GetMerklePathResultApi> {

    const r: GetMerklePathResultApi = { name: 'Taal' }

    try {
        const headers = { headers: { Authorization: apiKey } }

        const { data } = await axios.get(`https://mapi.taal.com/mapi/tx/${txid}?merkleProof=true&merkleFormat=TSC`, headers)

        //const txStatus = getMapiTxStatusPayload(txid, r.mapi.resp)

        //if (txStatus.returnResult !== 'success' || !txStatus.merkleProof)
        //    return r

        //r.proof = txStatus.merkleProof

    } catch (err: unknown) {
        r.error = sdk.WalletError.fromUnknown(err)
    }

    return r
}

export async function getRawTxFromWhatsOnChain(txid: string, chain: sdk.Chain): Promise<GetRawTxResultApi> {

    const r: GetRawTxResultApi = { name: 'WoC', txid: asString(txid) }

    try {
        const url = `https://api.whatsonchain.com/v1/bsv/${chain}/tx/${txid}/hex`
        const { data } = await axios.get(url)
        if (!data)
            return r

        r.rawTx = asArray(data)

    } catch (err: unknown) {
        r.error = sdk.WalletError.fromUnknown(err)
    }

    return r
}

// Documentation:
// https://docs.taal.com/
// https://docs.taal.com/core-products/transaction-processing/arc-endpoints
// https://bitcoin-sv.github.io/arc/api.html

export const arcMinerTaalMainDefault: ArcMinerApi = {
    name: 'TaalArc',
    url: 'https://tapi.taal.com/arc',
}

export const arcMinerTaalTestDefault: ArcMinerApi = {
    name: 'TaalArc',
    url: 'https://arc-test.taal.com',
}

export interface ArcMinerPostBeefDataApi {
    status: number, // 200
    title: string, // "OK",
    extraInfo: string, // ""

    blockHash?: string, // ""
    blockHeight?: number, // 0
    competingTxs?: null,
    merklePath?: string, // ""
    timestamp?: string, // "2024-08-23T12:55:26.229904Z",
    txStatus?: string, // "SEEN_ON_NETWORK",
    txid?: string, // "272b5cdca9a0aa51846df9be29ee366ff85902691d38210e8c4be2fead3823a5",

    type?: string, // url
    detail?: string,
    instance?: string,
}


export async function postBeefToTaalArcMiner(
    beef: number[] | bsv.Beef,
    txids: string[],
    chain: sdk.Chain,
    miner?: ArcMinerApi
)
: Promise<PostBeefResultApi>
{
    const m = miner || chain === 'main' ? arcMinerTaalMainDefault : arcMinerTaalTestDefault

    const r1 = await postBeefToArcMiner(beef, txids, m)
    if (r1.status === 'success') return r1
    const datas: object = { r1: r1.data }

    const obeef = Array.isArray(beef) ? bsv.Beef.fromBinary(beef) : beef

    // 2024-12-15 Testing still fails to consistently accept multiple new transactions in one Beef.
    // Earlier testing seemed to confirm it worked. Did they break it??
    // This has to work eventually, but for now, break multiple new transactions into
    // individual atomic beefs and send them.
    // Clearly they updated their code since the atomic beef spec wasn't written until after
    // the original tests were done...
    {
        if (obeef.atomicTxid === undefined) {
            const abeef = obeef.toBinaryAtomic(txids[txids.length -1])
            const r2 = await postBeefToArcMiner(abeef, txids, m)
            datas['r2'] = r2.data
            r2.data = datas
            if (r2.status === 'success') return r2
        }
    }

    const r3: PostBeefResultApi = {
        name: m.name,
        status: 'success',
        data: {},
        txids: []
    }
    for (const txid of txids) {
        const ab = obeef.toBinaryAtomic(txid)
        const b = bsv.Beef.fromBinary(ab)
        const rt = await postBeefToArcMiner(b, [txid], m)
        if (rt.status === 'error') r3.status = 'error'
        r3.data![txid] = rt.data
        r3.txids.push(rt.txids[0])
    }
    datas['r3'] = r3.data
    r3.data = datas
    return r3
}

export interface ArcMinerApi {
    name: string
    url: string
    apiKey?: string
    deploymentId?: string
}

export async function postBeefToArcMiner(
    beef: number[] | bsv.Beef,
    txids: string[],
    miner: ArcMinerApi
)
: Promise<PostBeefResultApi>
{
    const m = {...miner}

    let url = ''

    let r: PostBeefResultApi | undefined = undefined
    let beefBinary = Array.isArray(beef) ? beef : beef.toBinary()
    beef = Array.isArray(beef) ? bsv.Beef.fromBinary(beef) : beef


    // HACK to resolve ARC error when row has zero leaves.
    beef.addComputedLeaves()
    beefBinary = beef.toBinary()

    try {
        const length = beefBinary.length

        const makeRequestHeaders = () => {
            const headers: Record<string, string> = {
                'Content-Type': 'application/octet-stream',
                'Content-Length': length.toString(),
                'XDeployment-ID': m.deploymentId || `WalletServices-${randomBytesHex(16)}`,
            }

            if (m.apiKey) {
                headers['Authorization'] = `Bearer ${m.apiKey}`
            }

            return headers
        }

        const headers = makeRequestHeaders()

        const stream = new Readable({
            read() {
                this.push(Buffer.from(beefBinary as number[]))
                this.push(null)
            }
        })

        url = `${miner.url}/v1/tx`

        const data = await axios.post(
            url,
            stream,
            {
                headers,
                maxBodyLength: Infinity,
                validateStatus: () => true,
            }
        )
        
        if (!data || !data.data || typeof data.data !== 'object')
            throw new sdk.WERR_BAD_REQUEST('no response data object')

        const dd = data.data as ArcMinerPostBeefDataApi

        r = makePostBeefResult(dd, miner, beefBinary, txids)

    } catch (err: unknown) {
        console.log(err)
        const error = new sdk.WERR_INTERNAL(`service: ${url}, error: ${JSON.stringify(sdk.WalletError.fromUnknown(err))}`)
        r = makeErrorResult(error, miner, beefBinary, txids)
    }

    return r
}

export function makePostBeefResult(dd: ArcMinerPostBeefDataApi, miner: ArcMinerApi, beef: number[], txids: string[]) : PostBeefResultApi {
    let r: PostBeefResultApi
    switch (dd.status) {
        case 200: // Success
            r = makeSuccessResult(dd, miner, beef, txids)
            break
        case 400: // Bad Request
            r = makeErrorResult(new sdk.WERR_BAD_REQUEST(), miner, beef, txids, dd)
            break
        case 401: // Security Failed
            r = makeErrorResult(new sdk.WERR_BAD_REQUEST(`Security Failed (401)`), miner, beef, txids, dd)
            break
        case 409: // Generic Error
        case 422: // RFC 7807 Error
        case 460: // Not Extended Format
        case 467: // Mined Ancestor Missing
        case 468: // Invalid BUMPs
            r = makeErrorResult(new sdk.WERR_BAD_REQUEST(`status ${dd.status}, title ${dd.title}`), miner, beef, txids, dd)
            break
        case 461: // Malformed Transaction
        case 463: // Malformed Transaction
        case 464: // Invalid Outputs
            r = makeErrorResult(new sdk.WERR_BAD_REQUEST(`status ${dd.status}, title ${dd.title}`), miner, beef, txids, dd)
            break
        case 462: // Invalid Inputs
            if (dd.txid)
                r = makeErrorResult(new sdk.WERR_BAD_REQUEST(`status ${dd.status}, title ${dd.title}`), miner, beef, txids, dd)
            else
                r = makeErrorResult(new sdk.WERR_BAD_REQUEST(`status ${dd.status}, title ${dd.title}`), miner, beef, txids, dd)
            break
        case 465: // Fee Too Low
        case 473: // Cumulative Fee Validation Failed
            r = makeErrorResult(new sdk.WERR_BAD_REQUEST(`status ${dd.status}, title ${dd.title}`), miner, beef, txids, dd)
            break
        case 469: // Invalid Merkle Root
            r = makeErrorResult(new sdk.WERR_BAD_REQUEST(`status ${dd.status}, title ${dd.title}`), miner, beef, txids, dd)
            break
        default:
            r = makeErrorResult(new sdk.WERR_BAD_REQUEST(`status ${dd.status}, title ${dd.title}`), miner, beef, txids, dd)
            break
    }
    return r
}

function makeSuccessResult(
    dd: ArcMinerPostBeefDataApi,
    miner: ArcMinerApi,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    beef: number[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    txids: string[]
): PostBeefResultApi {
    const r: PostBeefResultApi = {
        status: 'success',
        name: miner.name,
        data: dd,
        txids: []
    }
    for (let i = 0; i < txids.length; i++) {
        const rt: PostBeefResultForTxidApi = {
            txid: txids[i],
            status: 'success'
        }
        if (dd.txid === txids[i]) {
            rt.alreadyKnown = !!dd.txStatus && ['SEEN_ON_NETWORK', 'MINED'].indexOf(dd.txStatus) >= 0
            rt.txid = dd.txid
            rt.blockHash = dd.blockHash
            rt.blockHeight = dd.blockHeight
            rt.merklePath = bsv.MerklePath.fromBinary(asArray(dd.merklePath!))
        }
        r.txids.push(rt)
    }
    return r
}

export function makeErrorResult(
    error: sdk.WalletError,
    miner: ArcMinerApi,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    beef: number[],
    txids: string[],
    dd?: ArcMinerPostBeefDataApi
): PostBeefResultApi {
    const r: PostBeefResultApi = {
        status: 'error',
        name: miner.name,
        error,
        data: dd,
        txids: []
    }
    for (let i = 0; i < txids.length; i++) {
        const rt: PostBeefResultForTxidApi = {
            txid: txids[i],
            status: 'error'
        }
        if (dd?.txid === txids[i]) {
            rt.alreadyKnown = !!dd.txStatus && ['SEEN_ON_NETWORK', 'MINED'].indexOf(dd.txStatus) >= 0
            rt.txid = dd.txid
            rt.blockHash = dd.blockHash
            rt.blockHeight = dd.blockHeight
            rt.merklePath = bsv.MerklePath.fromBinary(asArray(dd.merklePath!))
        }
        r.txids.push(rt)
    }
    return r
}

interface WhatsOnChainUtxoStatus {
    value: number
    height: number
    tx_pos: number
    tx_hash: string
}

export async function getUtxoStatusFromWhatsOnChain(output: string, chain: sdk.Chain, outputFormat?: GetUtxoStatusOutputFormatApi)
: Promise<GetUtxoStatusResultApi>
{
    
    const r: GetUtxoStatusResultApi = { name: 'WoC', status: 'error', error: new sdk.WERR_INTERNAL(), details: [] }

    let url: string = ''

    try {
        
        const scriptHash = validateScriptHash(output, outputFormat)
        
        url = `https://api.whatsonchain.com/v1/bsv/${chain}/script/${scriptHash}/unspent`

        const { data } = await axios.get(url)
        
        if (Array.isArray(data)) {
            if (data.length === 0) {
                r.status = 'success'
                r.error = undefined
                r.isUtxo = false
            } else {
                r.status = 'success'
                r.error = undefined
                r.isUtxo = true
                for (const s of <WhatsOnChainUtxoStatus[]>data) {
                    r.details.push({
                        txid: s.tx_hash,
                        satoshis: s.value,
                        height: s.height,
                        index: s.tx_pos
                    })
                }
            }
        } else {
            throw new sdk.WERR_INTERNAL("data is not an array")
        }

    } catch (eu: unknown) {
        r.error = new sdk.WERR_INTERNAL(`service failure: ${url}, error: ${JSON.stringify(sdk.WalletError.fromUnknown(eu))}`)
    }

    return r
}

interface WhatsOnChainScriptHistory {
    fee?: number
    height?: number
    tx_hash: string
}

export function validateScriptHash(output: string, outputFormat?: GetUtxoStatusOutputFormatApi) : string {
    let b = asArray(output)
    if (!outputFormat) {
        if (b.length === 32)
            outputFormat = 'hashLE'
        else
            outputFormat = 'script'
    }
    switch (outputFormat) {
        case 'hashBE':
            break;
        case 'hashLE':
            b = b.reverse()
            break;
        case 'script':
            b = sha256Hash(b).reverse()
            break;
        default:
            throw new sdk.WERR_INVALID_PARAMETER('outputFormat', `not be ${outputFormat}`)
    }
    return asString(b)
}
