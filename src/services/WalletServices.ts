import * as bsv from '@bsv/sdk'
import { asArray, asString, convertProofToMerklePath, doubleSha256BE, sdk, sha256Hash } from '..'
import { ServiceCollection } from './ServiceCollection'

import { createDefaultWalletServicesOptions } from './createDefaultWalletServicesOptions'
import { ChaintracksChainTracker } from './chaintracker'
import { getTaalArcServiceConfig, makeGetMerklePathFromTaalARC, makePostBeefToTaalARC, makePostTxsToTaalARC } from './providers/arcServices'
import { getMerklePathFromWhatsOnChainTsc, getRawTxFromWhatsOnChain, getUtxoStatusFromWhatsOnChain, updateBsvExchangeRate } from './providers/whatsonchain'
import { updateChaintracksFiatExchangeRates, updateExchangeratesapi } from './providers/echangeRates'
import { getHeight } from '@babbage/sdk-ts'

export class WalletServices implements sdk.WalletServices {
    static createDefaultOptions(chain: sdk.Chain) : sdk.WalletServicesOptions {
        return createDefaultWalletServicesOptions(chain)
    }

    options: sdk.WalletServicesOptions

    getMerklePathServices: ServiceCollection<sdk.GetMerklePathService>
    getRawTxServices: ServiceCollection<sdk.GetRawTxService>
    postTxsServices: ServiceCollection<sdk.PostTxsService>
    postBeefServices: ServiceCollection<sdk.PostBeefService>
    getUtxoStatusServices: ServiceCollection<sdk.GetUtxoStatusService>
    updateFiatExchangeRateServices: ServiceCollection<sdk.UpdateFiatExchangeRateService>

    chain: sdk.Chain

    constructor(optionsOrChain: sdk.Chain | sdk.WalletServicesOptions) {
        this.chain = (typeof optionsOrChain === 'string') ? optionsOrChain :  optionsOrChain.chain

        this.options = (typeof optionsOrChain === 'string') ? WalletServices.createDefaultOptions(this.chain) : optionsOrChain
        
        this.getMerklePathServices = new ServiceCollection<sdk.GetMerklePathService>()
        .add({ name: 'WhatsOnChainTsc', service: getMerklePathFromWhatsOnChainTsc})
        //.add({ name: 'Taal', service: makeGetMerklePathFromTaalARC(getTaalArcServiceConfig(this.chain, this.options.taalApiKey!)) })
        
        this.getRawTxServices = new ServiceCollection<sdk.GetRawTxService>()
        .add({ name: 'WhatsOnChain', service: getRawTxFromWhatsOnChain})

        this.postTxsServices = new ServiceCollection<sdk.PostTxsService>()
        .add({ name: 'TaalArcTxs', service: makePostTxsToTaalARC(getTaalArcServiceConfig(this.chain, this.options.taalApiKey!)) })

        this.postBeefServices = new ServiceCollection<sdk.PostBeefService>()
        .add({ name: 'TaalArcBeef', service: makePostBeefToTaalARC(getTaalArcServiceConfig(this.chain, this.options.taalApiKey!)) })

        this.getUtxoStatusServices = new ServiceCollection<sdk.GetUtxoStatusService>()
        .add({ name: 'WhatsOnChain', service: getUtxoStatusFromWhatsOnChain})
        
        this.updateFiatExchangeRateServices = new ServiceCollection<sdk.UpdateFiatExchangeRateService>()
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

    get getProofsCount() { return this.getMerklePathServices.count }
    get getRawTxsCount() { return this.getRawTxServices.count }
    get postTxsServicesCount() { return this.postTxsServices.count }
    get postBeefServicesCount() { return this.postBeefServices.count }
    get getUtxoStatsCount() { return this.getUtxoStatusServices.count }

    async getUtxoStatus(output: string, outputFormat?: sdk.GetUtxoStatusOutputFormat, useNext?: boolean): Promise<sdk.GetUtxoStatusResult> {
        const services = this.getUtxoStatusServices
        if (useNext)
            services.next()

        let r0: sdk.GetUtxoStatusResult = { name: "<noservices>", status: "error", error: new sdk.WERR_INTERNAL('No services available.'), details: [] }

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
     * The beef must contain at least each rawTx for each txid.
     * Some services may require input transactions as well.
     * These will be fetched if missing, greatly extending the service response time.
     * @param beef 
     * @param txids
     * @returns
     */
    async postTxs(beef: bsv.Beef, txids: string[]): Promise<sdk.PostTxsResult[]> {
        
        const rs = await Promise.all(this.postTxsServices.allServices.map(async service => {
            const r = await service(beef, txids, this)
            return r
        }))

        return rs
    }

    /**
     * 
     * @param beef 
     * @param chain 
     * @returns
     */
    async postBeef(beef: bsv.Beef, txids: string[]): Promise<sdk.PostBeefResult[]> {
        
        const rs = await Promise.all(this.postBeefServices.allServices.map(async service => {
            const r = await service(beef, txids, this)
            return r
        }))

        return rs
    }

    async getRawTx(txid: string, useNext?: boolean): Promise<sdk.GetRawTxResult> {
        
        if (useNext)
            this.getRawTxServices.next()

        const r0: sdk.GetRawTxResult = { txid }

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

    async invokeChaintracksWithRetry<R>(method: () => Promise<R>) : Promise<R> {
        if (!this.options.chaintracks)
            throw new sdk.WERR_INVALID_PARAMETER('options.chaintracks', 'valid for this service operation.');
        for (let retry = 0; retry < 3; retry++) {
            try {
                const r: R = await method()
                return r
            } catch (eu: unknown) {
                const e = sdk.WalletError.fromUnknown(eu)
                if (e.code != 'ECONNRESET')
                    throw eu
            }
        }
        throw new sdk.WERR_INVALID_OPERATION('hashToHeader service unavailable')
    }

    async getHeaderForHeight(height: number) : Promise<number[]> {
        const method = async () => {
                const header = await this.options.chaintracks!.findHeaderHexForHeight(height)
                if (!header)
                    throw new sdk.WERR_INVALID_PARAMETER('hash', `valid height '${height}' on mined chain ${this.chain}`);
                return toBinaryBaseBlockHeaderHex(header)
        }
        return this.invokeChaintracksWithRetry(method)
    }

    async getHeight() : Promise<number> {
        const method = async () => {
                return await this.options.chaintracks!.currentHeight()
        }
        return this.invokeChaintracksWithRetry(method)
    }

    async hashToHeader(hash: string): Promise<sdk.BlockHeaderHex> {
        const method = async () => {
                const header = await this.options.chaintracks!.findHeaderHexForBlockHash(hash)
                if (!header)
                    throw new sdk.WERR_INVALID_PARAMETER('hash', `valid blockhash '${hash}' on mined chain ${this.chain}`);
                return header
        }
        return this.invokeChaintracksWithRetry(method)
    }

    async getMerklePath(txid: string, useNext?: boolean): Promise<sdk.GetMerklePathResult> {
        
        if (useNext)
            this.getMerklePathServices.next()

        const r0: sdk.GetMerklePathResult = {}

        for (let tries = 0; tries < this.getMerklePathServices.count; tries++) {
            const service = this.getMerklePathServices.service
            const r = await service(txid, this.chain, this)
            if (r.merklePath) {
                // If we have a proof, call it done.
                r0.merklePath = r.merklePath
                r0.header = r.header
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

    targetCurrencies = ['USD', 'GBP', 'EUR']

    async updateFiatExchangeRates(rates?: sdk.FiatExchangeRates, updateMsecs?: number): Promise<sdk.FiatExchangeRates> {

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

        let r0: sdk.FiatExchangeRates | undefined

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

}

export function validateScriptHash(output: string, outputFormat?: sdk.GetUtxoStatusOutputFormat) : string {
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

/**
 * Serializes a block header as an 80 byte Buffer.
 * The exact serialized format is defined in the Bitcoin White Paper
 * such that computing a double sha256 hash of the buffer computes
 * the block hash for the header.
 * @returns 80 byte Buffer
 * @publicbody
 */
export function toBinaryBaseBlockHeaderHex (header: sdk.BaseBlockHeaderHex): number[] {
    const writer = new bsv.Utils.Writer()
    writer.writeUInt32BE(header.version)
    writer.writeReverse(asArray(header.previousHash))
    writer.writeReverse(asArray(header.merkleRoot))
    writer.writeUInt32BE(header.time)
    writer.writeUInt32BE(header.bits)
    writer.writeUInt32BE(header.nonce)
    const r = writer.toArray()
    return r
}
