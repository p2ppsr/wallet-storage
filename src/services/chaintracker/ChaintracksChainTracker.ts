import { sdk } from '../..'
import { ChainTracker } from "@bsv/sdk";
import { BlockHeaderHex, ChaintracksClientApi } from "./chaintracks";
import { ChaintracksServiceClient } from "./chaintracks/ChaintracksServiceClient";

export interface ChaintracksChainTrackerOptions {
    maxRetries?: number
}

export class ChaintracksChainTracker implements ChainTracker {
    chaintracks: ChaintracksClientApi
    cache: Record<number, string>
    options: ChaintracksChainTrackerOptions

    constructor(chain?: sdk.Chain, chaintracks?: ChaintracksClientApi, options?: ChaintracksChainTrackerOptions) {

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

        let header: BlockHeaderHex | undefined

        const retries = this.options.maxRetries || 3

        for (let tryCount = 1; tryCount <= retries; tryCount++) {

            try {
                header = await this.chaintracks.findHeaderHexForHeight(height)

                if (!header)
                    return false

                break
            } catch (eu: unknown) {
                if (tryCount > retries)
                    throw eu
            }
        }

        if (!header)
            throw new Error("Maximum retry count reached.")

        this.cache[height] = header.merkleRoot

        if (header.merkleRoot !== root)
            return false

        return true
    }
}