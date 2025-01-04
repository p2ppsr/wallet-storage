import * as bsv from '@bsv/sdk'
import { asArray, randomBytesHex, sdk, WalletServices } from "../..";

import axios from 'axios'
import { Readable } from 'stream'
import { PostTxResultForTxid } from '../../sdk';

// Documentation:
// https://docs.taal.com/
// https://docs.taal.com/core-products/transaction-processing/arc-endpoints
// https://bitcoin-sv.github.io/arc/api.html

export interface ArcServiceConfig {
    name: string,
    url: string,
    arcConfig: bsv.ArcConfig
}

export function getTaalArcServiceConfig(chain: sdk.Chain, apiKey: string): ArcServiceConfig {
    return {
        name: 'TaalArc',
        url: chain === 'main' ? 'https://api.taal.com/arc' : 'https://arc-test.taal.com',
        arcConfig: {
            apiKey,
            deploymentId: `WalletServices-${randomBytesHex(16)}`
        },
    }
}

export function makePostTxsToTaalARC(config: ArcServiceConfig): sdk.PostTxsService {
    return (beef: bsv.Beef, txids: string[], services: sdk.WalletServices) => {
        return postTxsToTaalArcMiner(beef, txids, config, services)
    }
}

export function makePostBeefToTaalARC(config: ArcServiceConfig) : sdk.PostBeefService {
    return (beef: bsv.Beef, txids: string[], services: sdk.WalletServices) => {
        return postBeefToTaalArcMiner(beef, txids, config, services)
    }
}

export function makeGetMerklePathFromTaalARC(config: ArcServiceConfig) : sdk.GetMerklePathService {
    return (txid: string, chain: sdk.Chain, services: sdk.WalletServices) => {
        return getMerklePathFromTaalARC(txid, config, services)
    }
}

class ArcServices {
    readonly URL: string
    readonly apiKey: string | undefined
    readonly deploymentId: string
    readonly callbackUrl: string | undefined
    readonly callbackToken: string | undefined
    readonly headers: Record<string, string> | undefined
    private readonly httpClient: bsv.HttpClient

    /**
     * Constructs an instance of the ARC broadcaster.
     *
     * @param {string} URL - The URL endpoint for the ARC API.
     * @param {ArcConfig} config - Configuration options for the ARC broadcaster.
     */
    constructor(URL: string, config: bsv.ArcConfig) {
        this.URL = URL
        const { apiKey, deploymentId, httpClient, callbackToken, callbackUrl, headers } = config
        this.apiKey = apiKey
        this.httpClient = httpClient ?? bsv.defaultHttpClient()
        this.deploymentId = deploymentId || `WalletServices-${randomBytesHex(16)}`
        this.callbackToken = callbackToken
        this.callbackUrl = callbackUrl
        this.headers = headers
    }

    /**
     * Unfortunately this seems to only work for recently submitted txids...
     * @param txid 
     * @returns 
     */
    async getTxStatus(txid: string): Promise<ArcMinerGetTxData> {

        const requestOptions: bsv.HttpClientRequestOptions = {
            method: 'GET',
            headers: this.requestHeaders(),
        }

        const response = await this.httpClient.request<ArcMinerGetTxData>(`${this.URL}/v1/tx/${txid}`, requestOptions)

        return response.data
    }

    requestHeaders() {
        const headers: Record<string, string> = { 'Content-Type': 'application/json', 'XDeployment-ID': this.deploymentId }
        if (this.apiKey) { headers.Authorization = `Bearer ${this.apiKey}` }
        if (this.callbackUrl) { headers['X-CallbackUrl'] = this.callbackUrl }
        if (this.callbackToken) { headers['X-CallbackToken'] = this.callbackToken }
        if (this.headers) { for (const key in this.headers) { headers[key] = this.headers[key] } }
        return headers
    }

}

export async function getMerklePathFromTaalARC(txid: string, config: ArcServiceConfig, services: sdk.WalletServices): Promise<sdk.GetMerklePathResult>
{
    const r: sdk.GetMerklePathResult = { name: config.name }

    try {
        const arc = new ArcServices(config.url, config.arcConfig)

        const rr = await arc.getTxStatus(txid)

        if (rr.status === 200 && rr.merklePath) {
            const mp = bsv.MerklePath.fromHex(rr.merklePath)
            r.merklePath = mp
            r.header = await services.hashToHeader(rr.blockHash)
        }

    } catch (eu: unknown) {
        r.error = sdk.WalletError.fromUnknown(eu)
    }
    return r
}

/**
 * 
 * @param txs All transactions must have source transactions. Will just source locking scripts and satoshis do?? toHexEF() is used.
 * @param config 
 */
export async function postTxsToTaalArcMiner(beef: bsv.Beef, txids: string[], config: ArcServiceConfig, services: sdk.WalletServices): Promise<sdk.PostTxsResult> {
    const r: sdk.PostTxsResult = { name: config.name, status: 'error', txidResults: [] }

    try {
        const arc = new bsv.ARC(config.url, config.arcConfig)

        /**
         * This service requires an array of EF serialized transactions:
         * Pull the transactions matching txids array out of the Beef and fill in input sourceTransations,
         * either from Beef or by external service lookup.
         */
        const txs: bsv.Transaction[] = []
        for (const txid of txids) {
            const btx = beef.findTxid(txid)
            if (btx) {
                const tx = btx.tx
                for (const input of tx.inputs) {
                    if (!input.sourceTXID || input.sourceTXID === '0'.repeat(64)) continue; // all zero txid is a coinbase input.
                    let itx = beef.findTxid(input.sourceTXID!)
                    if (!itx) {
                        const rawTx = await services.getRawTx(input.sourceTXID!)
                        if (!rawTx || !rawTx.rawTx)
                            throw new sdk.WERR_INVALID_PARAMETER('sourceTXID', `contained in beef or found on chain. ${input.sourceTXID}`);
                        beef.mergeRawTx(rawTx.rawTx!)
                        itx = beef.findTxid(input.sourceTXID!)
                    }
                    input.sourceTransaction = itx!.tx
                }
                txs.push(tx)
            } else
                throw new sdk.WERR_INVALID_PARAMETER('beef', `merged with rawTxs matching txids. Missing ${txid}`)
        }

        const rrs = await arc.broadcastMany(txs) as ArcMinerPostTxsData[]

        r.status = 'success'
        for (const txid of txids) {
            const txr: PostTxResultForTxid = { txid, status: 'success' }
            const rr = rrs.find(r => r.txid === txid)
            if (!rr) {
                r.status = txr.status = 'error'
            } else {
                txr.data = rr
                if (rr.status !== 200)
                    r.status = txr.status = 'error';
                else {
                    txr.blockHash = rr.blockHash
                    txr.blockHeight = rr.blockHeight
                    txr.merklePath = !rr.merklePath ? undefined : bsv.MerklePath.fromHex(rr.merklePath)
                }
            }
            r.txidResults.push(txr)
        }
        r.data = rrs

    } catch (eu: unknown) {
        r.error = sdk.WalletError.fromUnknown(eu)
    }
    return r
}

export interface ArcMinerGetTxData {
    status: number // 200
    title: string // OK
    blockHash: string
    blockHeight: number
    competingTxs: null | string[]
    extraInfo: string
    merklePath: string
    timestamp: string // ISO Z
    txid: string
    txStatus: string // 'SEEN_IN_ORPHAN_MEMPOOL'
}

export interface ArcMinerPostTxsData {
    status: number // 200
    title: string // OK
    blockHash: string
    blockHeight: number
    competingTxs: null | string[]
    extraInfo: string
    merklePath: string
    timestamp: string // ISO Z
    txid: string
    txStatus: string // 'SEEN_IN_ORPHAN_MEMPOOL'
}

export interface ArcMinerPostBeefDataApi {
    status: number, // 200
    title: string, // "OK",
    blockHash?: string, // ""
    blockHeight?: number, // 0
    competingTxs?: null,
    extraInfo: string, // ""
    merklePath?: string, // ""
    timestamp?: string, // "2024-08-23T12:55:26.229904Z",
    txid?: string, // "272b5cdca9a0aa51846df9be29ee366ff85902691d38210e8c4be2fead3823a5",
    txStatus?: string, // "SEEN_ON_NETWORK",


    type?: string, // url
    detail?: string,
    instance?: string,
}

export async function postBeefToTaalArcMiner(
    beef: bsv.Beef,
    txids: string[],
    config: ArcServiceConfig,
    services: sdk.WalletServices
)
: Promise<sdk.PostBeefResult>
{
    const r1 = await postBeefToArcMiner(beef, txids, config)
    return r1

    if (r1.status === 'success') return r1
    const datas: object = { r1: r1.data }

    // 2024-12-15 Testing still fails to consistently accept multiple new transactions in one Beef.
    // Earlier testing seemed to confirm it worked. Did they break it??
    // This has to work eventually, but for now, break multiple new transactions into
    // individual atomic beefs and send them.
    // Clearly they updated their code since the atomic beef spec wasn't written until after
    // the original tests were done...
    {
        if (beef.atomicTxid === undefined) {
            const abeef = beef.toBinaryAtomic(txids[txids.length -1])
            const r2 = await postBeefToArcMiner(abeef, txids, config)
            datas['r2'] = r2.data
            r2.data = datas
            if (r2.status === 'success') return r2
        }
    }

    const r3: sdk.PostBeefResult = {
        name: config.name,
        status: 'success',
        data: {},
        txidResults: []
    }
    for (const txid of txids) {
        const ab = beef.toBinaryAtomic(txid)
        const b = bsv.Beef.fromBinary(ab)
        const rt = await postBeefToArcMiner(b, [txid], config)
        if (rt.status === 'error') r3.status = 'error'
        r3.data![txid] = rt.data
        r3.txidResults.push(rt.txidResults[0])
    }
    datas['r3'] = r3.data
    r3.data = datas
    return r3
}

export async function postBeefToArcMiner(
    beef: bsv.Beef,
    txids: string[],
    config: ArcServiceConfig
)
: Promise<sdk.PostBeefResult>
{
    const m = {...config}

    let url = ''

    let r: sdk.PostBeefResult | undefined = undefined

    // HACK to resolve ARC error when row has zero leaves.
    // beef.addComputedLeaves()

    const beefBinary = beef.toBinary()

    try {
        const length = beefBinary.length

        const makeRequestHeaders = () => {
            const headers: Record<string, string> = {
                'Content-Type': 'application/octet-stream',
                'Content-Length': length.toString(),
                'XDeployment-ID': m.arcConfig.deploymentId || `WalletServices-${randomBytesHex(16)}`,
            }

            if (m.arcConfig.apiKey) {
                headers['Authorization'] = `Bearer ${m.arcConfig.apiKey}`
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

        url = `${config.url}/v1/tx`

        const data = await axios.post(
            url,
            stream,
            {
                headers,
                maxBodyLength: Infinity,
                validateStatus: () => true,
            }
        )
        
        if (!data || !data.data)
            throw new sdk.WERR_BAD_REQUEST('no response data')
        if (data.data === 'No Authorization' || data.status === 403 || data.statusText === 'Forbiden')
            throw new sdk.WERR_BAD_REQUEST('No Authorization')
        if (typeof data.data !== 'object')
            throw new sdk.WERR_BAD_REQUEST('no response data object')

        const dd = data.data as ArcMinerPostBeefDataApi

        r = makePostBeefResult(dd, config, beefBinary, txids)

    } catch (err: unknown) {
        console.error(err)
        const error = new sdk.WERR_INTERNAL(`service: ${url}, error: ${JSON.stringify(sdk.WalletError.fromUnknown(err))}`)
        r = makeErrorResult(error, config, beefBinary, txids)
    }

    return r
}

export function makePostBeefResult(dd: ArcMinerPostBeefDataApi, miner: ArcServiceConfig, beef: number[], txids: string[]) : sdk.PostBeefResult {
    let r: sdk.PostBeefResult
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
    miner: ArcServiceConfig,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    beef: number[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    txids: string[]
): sdk.PostBeefResult {
    const r: sdk.PostBeefResult = {
        status: 'success',
        name: miner.name,
        data: dd,
        txidResults: []
    }
    for (let i = 0; i < txids.length; i++) {
        const rt: sdk.PostTxResultForTxid = {
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
        r.txidResults.push(rt)
    }
    return r
}

export function makeErrorResult(
    error: sdk.WalletError,
    miner: ArcServiceConfig,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    beef: number[],
    txids: string[],
    dd?: ArcMinerPostBeefDataApi
): sdk.PostBeefResult {
    const r: sdk.PostBeefResult = {
        status: 'error',
        name: miner.name,
        error,
        data: dd,
        txidResults: []
    }
    for (let i = 0; i < txids.length; i++) {
        const rt: sdk.PostTxResultForTxid = {
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
        r.txidResults.push(rt)
    }
    return r
}
