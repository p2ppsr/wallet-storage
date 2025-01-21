import { sdk } from "../../../index.client"
import { ChaintracksServiceClient } from "../chaintracks"

describe('ChaintracksServiceClient tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        const chains: sdk.Chain[] = ['test', 'main']
        for (const chain of chains) {
            const client = new ChaintracksServiceClient(chain, `https://npm-registry.babbage.systems:${chain === 'main' ? 8084 : 8083}`)
            {
                // testnet block
                const r = await client.findHeaderForBlockHash('0000000049686fe721f70614c89df146e410240f838b8f3ef8e6471c6dfdd153')
                if (chain === 'main')
                    expect(r).toBe(undefined)
                else
                    expect(r?.height).toBe(1651723)
            } 
            {
                // mainnet block
                const r = await client.findHeaderForBlockHash('00000000000000000b010edee7422c59ec9131742e35f3e0d5837d710b961406')
                if (chain === 'main')
                    expect(r?.height).toBe(877595)
                else
                    expect(r).toBe(undefined)
            } 
        }
        
    })
})