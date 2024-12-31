import { ChaintracksChainTracker } from ".."
import { sdk } from "../../.."

describe('ChaintracksChaintracker tests', () => {
    jest.setTimeout(99999999)

    test('0', async () => {
        const chains: sdk.Chain[] = ['main', 'test']
        for (const chain of chains) {
            const tracker = new ChaintracksChainTracker(chain)
            const height = await tracker.currentHeight()
            expect(height).toBeGreaterThan(877598)
            const okMain = await tracker.isValidRootForHeight('2bf2edb5fa42aa773c6c13bc90e097b4e7de7ca1df2227f433be75ceace339e9', 877599)
            expect(okMain).toBe(chain === 'main')
            const okTest = await tracker.isValidRootForHeight('5513f13554442588dd9acf395072bf1d2e7d5d360fbc42d3ab1fa2026b17c200', 1654265)
            expect(okTest).toBe(chain === 'test')
        }
    })
})