/* eslint-disable @typescript-eslint/no-unused-vars */
import { asBuffer, asString, sdk } from '../../../index.all'

import { ChaintracksClientApi, ChaintracksInfoApi, HeaderListener, ReorgListener } from './ChaintracksClientApi'
import { BaseBlockHeader, BaseBlockHeaderHex, BlockHeader, BlockHeaderHex, isBaseBlockHeader, toBaseBlockHeaderHex, toBlockHeader } from './BlockHeaderApi'

interface FetchStatus<T> {
    status: 'success' | 'error',
    code?: string,
    description?: string,
    value?: T
}

export interface ChaintracksServiceClientOptions {
    useAuthrite: boolean
}

/**
 * Connects to a ChaintracksService to implement 'ChaintracksClientApi'
 *
 */
export class ChaintracksServiceClient implements ChaintracksClientApi {
    static createChaintracksServiceClientOptions(): ChaintracksServiceClientOptions {
        const options: ChaintracksServiceClientOptions = {
            useAuthrite: false
        }
        return options
    }

    options: ChaintracksServiceClientOptions

    constructor(public chain: sdk.Chain, public serviceUrl: string, options?: ChaintracksServiceClientOptions) {
        this.options = options || ChaintracksServiceClient.createChaintracksServiceClientOptions()
    }

    async currentHeight(): Promise<number> {
        return await this.getPresentHeight()
    }

    async isValidRootForHeight(root: string, height: number): Promise<boolean> {
        const r = await this.findHeaderForHeight(height)
        if (!r) return false
        const isValid = root === asString(r.merkleRoot)
        return isValid
    }

    async subscribeHeaders(listener: HeaderListener): Promise<string> { throw new sdk.WERR_NOT_IMPLEMENTED() }
    async subscribeReorgs(listener: ReorgListener): Promise<string> { throw new sdk.WERR_NOT_IMPLEMENTED() }
    async unsubscribe(subscriptionId: string): Promise<boolean> { throw new sdk.WERR_NOT_IMPLEMENTED() }

    async getJsonOrUndefined<T>(path: string): Promise<T | undefined> {
        let e: Error | undefined = undefined
        for (let retry = 0; retry < 3; retry++) {
            try {
                const r = await fetch(`${this.serviceUrl}${path}`)
                const v = <FetchStatus<T>>await r.json()
                if (v.status === 'success')
                    return v.value
                else
                    e = new Error(JSON.stringify(v))
            } catch (eu: unknown) {
                e = eu as Error
            }
            if (e && e.name !== 'ECONNRESET')
                break
        }
        if (e) throw e
    }

    async getJson<T>(path: string): Promise<T> {
        const r = await this.getJsonOrUndefined<T>(path)
        if (r === undefined)
            throw new Error('Value was undefined. Requested object may not exist.')
        return r
    }

    async postJsonVoid<T>(path: string, params: T): Promise<void> {
        const headers = {}
        headers['Content-Type'] = 'application/json'
        const r = await fetch(`${this.serviceUrl}${path}`, {
            body: JSON.stringify(params),
            method: 'POST',
            headers,
            //cache: 'no-cache',
        })
        try {
            const s = <FetchStatus<void>>await r.json()
            if (s.status === 'success')
                return
            throw new Error(JSON.stringify(s))
        } catch (e) {
            console.log(`Exception: ${JSON.stringify(e)}`)
            throw new Error(JSON.stringify(e))
        }
    }

    //
    // HTTP API FUNCTIONS
    //

    async addHeaderHex(header: BaseBlockHeaderHex): Promise<void> {
        const r = await this.postJsonVoid('/addHeaderHex', header)
        if (typeof r === 'string')
            throw new Error(r)
    }

    async startListening(): Promise<void> {
        return await this.getJsonOrUndefined('/startListening')
    }
    async listening(): Promise<void> { return await this.getJsonOrUndefined('/listening') }
    async getChain(): Promise<sdk.Chain> {
        return this.chain
        //return await this.getJson('/getChain')
    }
    async getInfo(wait?: number): Promise<ChaintracksInfoApi> {
        return await this.getJson(`/getInfo?wait=${wait || ''}`)
    }

    async isListening(): Promise<boolean> { return await this.getJson('/isListening') }
    async isSynchronized(): Promise<boolean> { return await this.getJson('/isSynchronized') }
    async getPresentHeight(): Promise<number> { return await this.getJson('/getPresentHeight') }
    async findChainTipHeaderHex(): Promise<BlockHeaderHex> { return await this.getJson('/findChainTipHeaderHex') }
    async findChainTipHashHex(): Promise<string> { return await this.getJson('/findChainTipHashHex') }

    async getHeadersHex(height: number, count: number): Promise<string> {
        return await this.getJson(`/getHeaders?height=${height}&count=${count}`)
    }
    async findHeaderHexForHeight(height: number): Promise<BlockHeaderHex | undefined> {
        return await this.getJsonOrUndefined(`/findHeaderHexForHeight?height=${height}`)
    }
    async findChainWorkHexForBlockHash(hash: string | Buffer): Promise<string | undefined> {
        return await this.getJsonOrUndefined(`/findChainWorkHexForBlockHash?hash=${asString(hash)}`)
    }
    async findHeaderHexForBlockHash(hash: Buffer | string): Promise<BlockHeaderHex | undefined> {
        return await this.getJsonOrUndefined(`/findHeaderHexForBlockHash?hash=${asString(hash)}`)
    }
    async findHeaderHexForMerkleRoot(merkleRoot: Buffer | string, height?: number): Promise<BlockHeaderHex | undefined> {
        return await this.getJsonOrUndefined(`/findHeaderHexForMerkleRoot?root=${asString(merkleRoot)}&height=${height}`)
    }

    //
    // IMPLEMENTED IN TERMS OF OTHER API FUNCTIONS
    //

    async findChainTipHeader(): Promise<BlockHeader> {
        return toBlockHeader(await this.findChainTipHeaderHex())
    }
    async findChainTipHash(): Promise<Buffer> {
        return asBuffer(await this.findChainTipHashHex())
    }
    async findChainWorkForBlockHash(hash: string | Buffer): Promise<Buffer | undefined> {
        const chainWork = await this.findChainWorkHexForBlockHash(hash)
        return chainWork ? asBuffer(chainWork) : undefined
    }
    async findHeaderForBlockHash(hash: string | Buffer): Promise<BlockHeader | undefined> {
        const header = await this.findHeaderHexForBlockHash(hash)
        return header ? toBlockHeader(header) : undefined
    }
    async getHeaders(height: number, count: number): Promise<Buffer> {
        return asBuffer(await this.getHeadersHex(height, count))
    }
    async findHeaderForHeight(height: number): Promise<BlockHeader | undefined> {
        const header = await this.findHeaderHexForHeight(height)
        return header ? toBlockHeader(header) : undefined
    }
    async findHeaderForMerkleRoot(root: string | Buffer, height?: number): Promise<BlockHeader | undefined> {
        const header = await this.findHeaderHexForMerkleRoot(root, height)
        return header ? toBlockHeader(header) : undefined
    }

    async addHeader(header: BaseBlockHeader | BaseBlockHeaderHex): Promise<void> {
        const bbhh = isBaseBlockHeader(header) ? toBaseBlockHeaderHex(header) : header
        return this.addHeaderHex(bbhh)
    }
}
