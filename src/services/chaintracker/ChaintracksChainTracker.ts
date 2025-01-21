import { sdk, wait } from '../../index.client'
import { ChainTracker } from "@bsv/sdk";
import { BlockHeader } from "./chaintracks";
import { ChaintracksServiceClient } from "./chaintracks/ChaintracksServiceClient";

export interface ChaintracksChainTrackerOptions {
    maxRetries?: number
}

export class ChaintracksChainTracker implements ChainTracker {
    chaintracks: ChaintracksServiceClient
    cache: Record<number, string>
    options: ChaintracksChainTrackerOptions

    constructor(chain?: sdk.Chain, chaintracks?: ChaintracksServiceClient, options?: ChaintracksChainTrackerOptions) {

        chain ||= 'main'
        this.chaintracks = chaintracks ?? new ChaintracksServiceClient(chain, `https://npm-registry.babbage.systems:808${chain === 'main' ? '4' : '3'}`)
        this.cache = {}
        this.options = options || {}
    }

    async currentHeight() : Promise<number> {
        return await this.chaintracks.getPresentHeight()
    }

    async isValidRootForHeight(root: string, height: number) : Promise<boolean> {
        const cachedRoot = this.cache[height]
        if (cachedRoot) {
            return cachedRoot === root
        }

        let header: BlockHeader | undefined

        const retries = this.options.maxRetries || 3

        let error: sdk.WalletError | undefined = undefined

        for (let tryCount = 1; tryCount <= retries; tryCount++) {

            try {
                header = await this.chaintracks.findHeaderForHeight(height)

                if (!header) {
                    return false
                }

                break
            } catch (eu: unknown) {
                error = sdk.WalletError.fromUnknown(eu)
                if (tryCount > retries) {
                    throw error
                }
                await wait(1000)
            }
        }

        if (!header)
            throw new sdk.WERR_INTERNAL('no header should have returned false or thrown an error.')

        this.cache[height] = header.merkleRoot

        if (header.merkleRoot !== root) {
            return false
        }

        return true
    }
}