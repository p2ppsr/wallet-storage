import * as bsv from '@bsv/sdk'
import { asArray, asString, convertProofToMerklePath, doubleSha256BE, randomBytesHex, sdk, sha256Hash } from '..'
import { ServiceCollection } from './ServiceCollection'
import axios from 'axios'
import { Readable } from 'stream'
import Whatsonchain from 'whatsonchain'

import { createDefaultWalletServicesOptions } from './createDefaultWalletServicesOptions'
import { ChaintracksChainTracker, ChaintracksChainTrackerOptions } from './chaintracker'

export class WalletServices implements sdk.WalletServices {
    static createDefaultOptions(chain: sdk.Chain) : sdk.WalletServicesOptions {
        return createDefaultWalletServicesOptions(chain)
    }

    options: sdk.WalletServicesOptions

    getMerklePathServices: ServiceCollection<sdk.GetMerklePathServiceApi>
    getRawTxServices: ServiceCollection<sdk.GetRawTxServiceApi>
    postBeefServices: ServiceCollection<sdk.PostBeefServiceApi>
    getUtxoStatusServices: ServiceCollection<sdk.GetUtxoStatusServiceApi>
    updateFiatExchangeRateServices: ServiceCollection<sdk.UpdateFiatExchangeRateServiceApi>

    chain: sdk.Chain

    constructor(optionsOrChain: sdk.Chain | sdk.WalletServicesOptions) {
        this.chain = (typeof optionsOrChain === 'string') ? optionsOrChain :  optionsOrChain.chain

        this.options = (typeof optionsOrChain === 'string') ? WalletServices.createDefaultOptions(this.chain) : optionsOrChain
        
        this.getMerklePathServices = new ServiceCollection<sdk.GetMerklePathServiceApi>()
        .add({ name: 'WhatsOnChainTsc', service: getMerklePathFromWhatsOnChainTsc})
       // .add({ name: 'Taal', service: this.makeGetProofFromTaal() })
        
        this.getRawTxServices = new ServiceCollection<sdk.GetRawTxServiceApi>()
        .add({ name: 'WhatsOnChain', service: getRawTxFromWhatsOnChain})

        this.postBeefServices = new ServiceCollection<sdk.PostBeefServiceApi>()
        .add({ name: 'TaalArc', service: postBeefToTaalArcMiner })

        this.getUtxoStatusServices = new ServiceCollection<sdk.GetUtxoStatusServiceApi>()
        .add({ name: 'WhatsOnChain', service: getUtxoStatusFromWhatsOnChain})
        
        this.updateFiatExchangeRateServices = new ServiceCollection<sdk.UpdateFiatExchangeRateServiceApi>()
        .add({ name: 'ChaintracksService', service: updateChaintracksFiatExchangeRates })
        .add({ name: 'exchangeratesapi', service: updateExchangeratesapi })
    }

    async getChainTracker() : Promise<bsv.ChainTracker> {
        if (!this.options.chaintracks)
            throw new sdk.WERR_INVALID_PARAMETER('options.chaintracks', `valid to enable 'getChainTracker' service.`)
        return new ChaintracksChainTracker(this.chain, this.options.chaintracks)
    }

    async getBsvExchangeRate(): Promise<number> {
        this.options.bsvExchangeRate = await updateBsvExchangeRate(this.options.bsvExchangeRate, this.options.bsvUpdateMsecs)
        return this.options.bsvExchangeRate.rate
    }

    async getFiatExchangeRate(currency: "USD" | "GBP" | "EUR", base?: "USD" | "GBP" | "EUR"): Promise<number> {
        const rates = await this.updateFiatExchangeRates(this.options.fiatExchangeRates, this.options.fiatUpdateMsecs)

        this.options.fiatExchangeRates = rates

        base ||= 'USD'
        const rate = rates.rates[currency] / rates.rates[base]

        return rate
    }

    targetCurrencies = ['USD', 'GBP', 'EUR']

    async updateFiatExchangeRates(rates?: sdk.FiatExchangeRatesApi, updateMsecs?: number): Promise<sdk.FiatExchangeRatesApi> {

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

        let r0: sdk.FiatExchangeRatesApi | undefined

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
                console.error(`updateFiatExchangeRates servcice name ${service.name} error ${e.message}`)
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
        return (txid: string, hashToHeader?: sdk.HashToHeader) => {
            return getMerklePathFromTaal(txid, this.taalApiKey(), hashToHeader)
        }
    }

    get getProofsCount() { return this.getMerklePathServices.count }
    get getRawTxsCount() { return this.getRawTxServices.count }
    get postBeefServicesCount() { return this.postBeefServices.count }
    get getUtxoStatsCount() { return this.getUtxoStatusServices.count }

    async getUtxoStatus(output: string, outputFormat?: sdk.GetUtxoStatusOutputFormatApi, useNext?: boolean): Promise<sdk.GetUtxoStatusResultApi> {
        const services = this.getUtxoStatusServices
        if (useNext)
            services.next()

        let r0: sdk.GetUtxoStatusResultApi = { name: "<noservices>", status: "error", error: new sdk.WERR_INTERNAL('No services available.'), details: [] }

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
    async postBeef(beef: number[] | bsv.Beef, txids: string[]): Promise<sdk.PostBeefResultApi[]> {
        
        const rs = await Promise.all(this.postBeefServices.allServices.map(async service => {
            const r = await service(beef, txids, this.chain)
            return r
        }))

        return rs
    }

    async getRawTx(txid: string, useNext?: boolean): Promise<sdk.GetRawTxResultApi> {
        
        if (useNext)
            this.getRawTxServices.next()

        const r0: sdk.GetRawTxResultApi = { txid }

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

    async getMerklePath(txid: string, useNext?: boolean): Promise<sdk.GetMerklePathResultApi> {
        const hashToHeader: sdk.HashToHeader | undefined = !this.options.chaintracks ? undefined
            : async (hash) => {
                for (let retry = 0; retry < 3; retry++) {
                    try {
                        const header = await this.options.chaintracks!.findHeaderHexForBlockHash(hash)
                        if (!header) return undefined;
                        return header
                    } catch (eu: unknown) {
                        const e = sdk.WalletError.fromUnknown(eu)
                        if (e.code != 'ECONNRESET')
                            throw eu
                    }
                }
                throw new sdk.WERR_INVALID_OPERATION('hashToHeader service unavailable')
        }
        
        if (useNext)
            this.getMerklePathServices.next()

        const r0: sdk.GetMerklePathResultApi = {}

        for (let tries = 0; tries < this.getMerklePathServices.count; tries++) {
            const service = this.getMerklePathServices.service
            const r = await service(txid, this.chain, hashToHeader)
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
export async function getMerklePathFromWhatsOnChainTsc(txid: string, chain: sdk.Chain, hashToHeader?: sdk.HashToHeader): Promise<sdk.GetMerklePathResultApi> {
    if (!hashToHeader) throw new sdk.WERR_INVALID_PARAMETER('options.chaintracks', 'valid for getMerklePath to work.')

    const r: sdk.GetMerklePathResultApi = { name: 'WoCTsc' }

    try {
        let { data } = await axios.get(`https://api.whatsonchain.com/v1/bsv/${chain}/tx/${txid}/proof/tsc`)
        if (!data || data.length < 1)
           return r 

        if (!data['target'])
            data = data[0]
        const p = data
        const header = await hashToHeader(p.target)
        if (!header) throw new sdk.WERR_INVALID_PARAMETER('blockhash', 'a valid on-chain block hash')
        const proof = { index: p.index, nodes: p.nodes, height: header.height }
        r.merklePath = convertProofToMerklePath(txid, proof)
        r.header = header

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
export async function getMerklePathFromTaal(txid: string, apiKey: string, hashToHeader?: sdk.HashToHeader): Promise<sdk.GetMerklePathResultApi> {

    const r: sdk.GetMerklePathResultApi = { name: 'Taal' }

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

export async function getRawTxFromWhatsOnChain(txid: string, chain: sdk.Chain): Promise<sdk.GetRawTxResultApi> {

    const r: sdk.GetRawTxResultApi = { name: 'WoC', txid: asString(txid) }

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
: Promise<sdk.PostBeefResultApi>
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

    const r3: sdk.PostBeefResultApi = {
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
: Promise<sdk.PostBeefResultApi>
{
    const m = {...miner}

    let url = ''

    let r: sdk.PostBeefResultApi | undefined = undefined
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
        console.error(err)
        const error = new sdk.WERR_INTERNAL(`service: ${url}, error: ${JSON.stringify(sdk.WalletError.fromUnknown(err))}`)
        r = makeErrorResult(error, miner, beefBinary, txids)
    }

    return r
}

export function makePostBeefResult(dd: ArcMinerPostBeefDataApi, miner: ArcMinerApi, beef: number[], txids: string[]) : sdk.PostBeefResultApi {
    let r: sdk.PostBeefResultApi
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
): sdk.PostBeefResultApi {
    const r: sdk.PostBeefResultApi = {
        status: 'success',
        name: miner.name,
        data: dd,
        txids: []
    }
    for (let i = 0; i < txids.length; i++) {
        const rt: sdk.PostBeefResultForTxidApi = {
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
): sdk.PostBeefResultApi {
    const r: sdk.PostBeefResultApi = {
        status: 'error',
        name: miner.name,
        error,
        data: dd,
        txids: []
    }
    for (let i = 0; i < txids.length; i++) {
        const rt: sdk.PostBeefResultForTxidApi = {
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

export async function getUtxoStatusFromWhatsOnChain(output: string, chain: sdk.Chain, outputFormat?: sdk.GetUtxoStatusOutputFormatApi)
: Promise<sdk.GetUtxoStatusResultApi>
{
    const r: sdk.GetUtxoStatusResultApi = { name: 'WoC', status: 'error', error: new sdk.WERR_INTERNAL(), details: [] }

    for (let retry = 0; ; retry++) {

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

            return r

        } catch (eu: unknown) {
            const e = sdk.WalletError.fromUnknown(eu)
            if (e.code !== 'ECONNRESET' || retry > 2) {
                r.error = new sdk.WERR_INTERNAL(`service failure: ${url}, error: ${JSON.stringify(sdk.WalletError.fromUnknown(eu))}`)
                return r
            }
        }
    }
    return r
}

interface WhatsOnChainScriptHistory {
    fee?: number
    height?: number
    tx_hash: string
}

export function validateScriptHash(output: string, outputFormat?: sdk.GetUtxoStatusOutputFormatApi) : string {
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

export async function updateBsvExchangeRate(rate?: sdk.BsvExchangeRateApi, updateMsecs?: number): Promise<sdk.BsvExchangeRateApi> {

    if (rate) {
        // Check if the rate we know is stale enough to update.
        updateMsecs ||= 1000 * 60 * 15
        if (new Date(Date.now() - updateMsecs) < rate.timestamp)
            return rate
    }

    // TODO: Expand to redundant services with caching...
    const woc = new Whatsonchain()
    const r = await woc.exchangeRate()
    const wocrate = <{ rate: number, time: number, currency: string }>r
    if (wocrate.currency !== 'USD')
        wocrate.rate = NaN

    const newRate: sdk.BsvExchangeRateApi = {
        timestamp: new Date(),
        base: 'USD',
        rate: wocrate.rate
    }

    //console.log(`new bsv rate=${JSON.stringify(newRate)}`)

    return newRate
}

export async function updateChaintracksFiatExchangeRates(targetCurrencies: string[], options: sdk.WalletServicesOptions): Promise<sdk.FiatExchangeRatesApi> {
    const url = options.chaintracksFiatExchangeRatesUrl

    if (!url)
        throw new sdk.WERR_MISSING_PARAMETER('options.chaintracksFiatExchangeRatesUrl')

    const r = await axios.get(url)

    if (r.status !== 200 || !r.data || r.data.status != "success") {
        throw new sdk.WERR_BAD_REQUEST(`${url} returned status ${r.status}`)
    }

    const rates = <sdk.FiatExchangeRatesApi>r.data.value
    rates.timestamp = new Date(rates.timestamp)

    return rates
}

export async function updateExchangeratesapi(targetCurrencies: string[], options: sdk.WalletServicesOptions): Promise<sdk.FiatExchangeRatesApi> {

    if (!options.exchangeratesapiKey)
        throw new sdk.WERR_MISSING_PARAMETER('options.exchangeratesapiKey')

    const iorates = await getExchangeRatesIo(options.exchangeratesapiKey)

    if (!iorates.success)
        throw new sdk.WERR_BAD_REQUEST(`getExchangeRatesIo returned success ${iorates.success}`)

    if (!iorates.rates["USD"] || !iorates.rates[iorates.base])
        throw new sdk.WERR_BAD_REQUEST(`getExchangeRatesIo missing rates for 'USD' or base`)

    const r: sdk.FiatExchangeRatesApi = {
        timestamp: new Date(iorates.timestamp * 1000),
        base: 'USD',
        rates: {}
    }

    const basePerUsd = iorates.rates[iorates.base] / iorates.rates["USD"] 

    let updates = 0
    for (const [key, value] of Object.entries(iorates.rates)) {
        if (targetCurrencies.indexOf(key) > -1) {
            r.rates[key] = value * basePerUsd
            updates++
        }
    }

    if (updates !== targetCurrencies.length)
        throw new sdk.WERR_BAD_REQUEST(`getExchangeRatesIo failed to update all target currencies`)

    //console.log(`new fiat rates=${JSON.stringify(r)}`)

    return r
}

export interface ExchangeRatesIoApi {
    success: boolean,
    timestamp: number,
    base: "EUR" | "USD"
    date: string
    rates: Record<string, number>
}

export async function getExchangeRatesIo(key: string): Promise<ExchangeRatesIoApi> {
    const url = `http://api.exchangeratesapi.io/v1/latest?access_key=${key}`

    const r = await axios.get(url)

    if (r.status !== 200 || !r.data) {
        throw new sdk.WERR_BAD_REQUEST(`getExchangeRatesIo returned status ${r.status}`)
    }

    const rates = <ExchangeRatesIoApi>r.data

    return rates
}

/*
{
    "success": true,
    "timestamp": 1702405384,
    "base": "EUR",
    "date": "2023-12-12",
    "rates": {
        "AED": 3.96261,
        "AFN": 74.453362,
        "ALL": 101.807155,
        "AMD": 435.489459,
        "ANG": 1.944069,
        "AOA": 897.226337,
        "ARS": 395.468082,
        "AUD": 1.646886,
        "AWG": 1.942271,
        "AZN": 1.832044,
        "BAM": 1.95407,
        "BBD": 2.177971,
        "BDT": 118.654929,
        "BGN": 1.956827,
        "BHD": 0.406753,
        "BIF": 3078.499675,
        "BMD": 1.079039,
        "BND": 1.446102,
        "BOB": 7.4534,
        "BRL": 5.35741,
        "BSD": 1.07874,
        "BTC": 0.000026145469,
        "BTN": 89.916078,
        "BWP": 14.715901,
        "BYN": 3.553337,
        "BYR": 21149.174075,
        "BZD": 2.174364,
        "CAD": 1.468287,
        "CDF": 2875.640503,
        "CHF": 0.945353,
        "CLF": 0.034313,
        "CLP": 948.09775,
        "CNY": 7.743512,
        "COP": 4307.525658,
        "CRC": 569.093422,
        "CUC": 1.079039,
        "CUP": 28.594547,
        "CVE": 110.978933,
        "CZK": 24.507795,
        "DJF": 191.766554,
        "DKK": 7.457544,
        "DOP": 61.505535,
        "DZD": 145.236415,
        "EGP": 33.367028,
        "ERN": 16.185592,
        "ETB": 60.199033,
        "EUR": 1,
        "FJD": 2.416779,
        "FKP": 0.859886,
        "GBP": 0.859574,
        "GEL": 2.880527,
        "GGP": 0.859886,
        "GHS": 12.980915,
        "GIP": 0.859886,
        "GMD": 72.726644,
        "GNF": 9285.134874,
        "GTQ": 8.443457,
        "GYD": 225.859997,
        "HKD": 8.426031,
        "HNL": 26.685156,
        "HRK": 7.598132,
        "HTG": 142.513142,
        "HUF": 382.707793,
        "IDR": 16801.292339,
        "ILS": 4.007585,
        "IMP": 0.859886,
        "INR": 89.987955,
        "IQD": 1414.081256,
        "IRR": 45602.907562,
        "ISK": 151.109018,
        "JEP": 0.859886,
        "JMD": 167.700721,
        "JOD": 0.765366,
        "JPY": 157.115675,
        "KES": 165.523229,
        "KGS": 96.379362,
        "KHR": 4440.24707,
        "KMF": 493.571281,
        "KPW": 971.097551,
        "KRW": 1417.685123,
        "KWD": 0.332733,
        "KYD": 0.8989,
        "KZT": 493.04112,
        "LAK": 22368.488843,
        "LBP": 16154.243871,
        "LKR": 352.747636,
        "LRD": 203.02122,
        "LSL": 20.582684,
        "LTL": 3.186123,
        "LVL": 0.6527,
        "LYD": 5.211954,
        "MAD": 10.976529,
        "MDL": 19.340873,
        "MGA": 4939.301335,
        "MKD": 61.507276,
        "MMK": 2265.283559,
        "MNT": 3705.780074,
        "MOP": 8.676817,
        "MRU": 42.727878,
        "MUR": 47.690625,
        "MVR": 16.584924,
        "MWK": 1816.023037,
        "MXN": 18.69803,
        "MYR": 5.052606,
        "MZN": 68.249194,
        "NAD": 20.588506,
        "NGN": 865.924709,
        "NIO": 39.6024,
        "NOK": 11.848426,
        "NPR": 143.865605,
        "NZD": 1.761931,
        "OMR": 0.415394,
        "PAB": 1.07864,
        "PEN": 4.073376,
        "PGK": 4.025102,
        "PHP": 59.974075,
        "PKR": 306.446851,
        "PLN": 4.334063,
        "PYG": 7963.910929,
        "QAR": 3.928776,
        "RON": 4.973399,
        "RSD": 117.196649,
        "RUB": 97.248412,
        "RWF": 1351.496966,
        "SAR": 4.047186,
        "SBD": 9.12268,
        "SCR": 14.561036,
        "SDG": 648.5028,
        "SEK": 11.285032,
        "SGD": 1.449037,
        "SHP": 1.312921,
        "SLE": 24.488188,
        "SLL": 21311.029931,
        "SOS": 616.131981,
        "SRD": 40.655509,
        "STD": 22333.938945,
        "SYP": 14029.21897,
        "SZL": 20.587826,
        "THB": 38.597298,
        "TJS": 11.757734,
        "TMT": 3.776638,
        "TND": 3.377493,
        "TOP": 2.551714,
        "TRY": 31.312865,
        "TTD": 7.321483,
        "TWD": 34.012943,
        "TZS": 2697.598652,
        "UAH": 39.917867,
        "UGX": 4102.367289,
        "USD": 1.079039,
        "UYU": 42.422631,
        "UZS": 13299.161683,
        "VEF": 3838024.202021,
        "VES": 38.392542,
        "VND": 26188.28851,
        "VUV": 129.693288,
        "WST": 2.964402,
        "XAF": 655.37362,
        "XAG": 0.047456,
        "XAU": 0.000545,
        "XCD": 2.916158,
        "XDR": 0.811478,
        "XOF": 657.134976,
        "XPF": 119.331742,
        "YER": 270.110528,
        "ZAR": 20.470755,
        "ZMK": 9712.646776,
        "ZMW": 26.319693,
        "ZWL": 347.450277
    }
}
*/