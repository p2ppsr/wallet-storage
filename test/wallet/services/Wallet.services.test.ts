import * as bsv from "@bsv/sdk"
import { sdk, StorageKnex, wait, Wallet, WalletSigner, WalletStorage } from "../../../src"
import { KeyDeriver } from "../../../src/sdk"
import { _tu, TestSetup1Wallet } from "../../utils/TestUtilsWalletStorage"

describe('Wallet services tests', () => {
    jest.setTimeout(99999999)

    const ctxs: TestSetup1Wallet[] = []
    
    beforeAll(async () => {
        ctxs.push(await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'walletServicesMain', chain: 'main', rootKeyHex: '3'.repeat(64)}))
        ctxs.push(await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'walletServicesTest', chain: 'test', rootKeyHex: '3'.repeat(64)}))
    })

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })

    test('0 getUtxoStatus', async () => {
        for (const { chain, wallet, services } of ctxs) {
            if (!wallet.services || !services) throw new sdk.WERR_INTERNAL('test requires setup with services')
            {
                const us = await wallet.services.getUtxoStatus('4104e70a02f5af48a1989bf630d92523c9d14c45c75f7d1b998e962bff6ff9995fc5bdb44f1793b37495d80324acba7c8f537caaf8432b8d47987313060cc82d8a93ac', 'script')
                if (chain === 'main') {
                    expect(us.status).toBe('success')
                    expect(us.isUtxo).toBe(true)
                } else {
                    expect(us.status).toBe('success')
                    expect(us.isUtxo).toBe(false)
                }
            }
        }
    })

    test('1 getBsvExchangeRate', async () => {
        for (const { chain, wallet, services } of ctxs) {
            if (!wallet.services || !services) throw new sdk.WERR_INTERNAL('test requires setup with services')

            {
                const usdPerBsv = await wallet.services.getBsvExchangeRate()
                expect(usdPerBsv).toBeGreaterThan(0) // and really so much more...
            }

        }
    })

    test('2 getFiatExchangeRate', async () => {
        for (const { chain, wallet, services } of ctxs) {
            if (!wallet.services || !services) throw new sdk.WERR_INTERNAL('test requires setup with services')
            {
                const eurPerUsd = await wallet.services.getFiatExchangeRate('EUR', 'USD')
                expect(eurPerUsd).toBeGreaterThan(0)
            }
        }
    })

    test('3 getChainTracker', async () => {
        for (const { chain, wallet, services } of ctxs) {
            if (!wallet.services || !services) throw new sdk.WERR_INTERNAL('test requires setup with services')

            {
                const chaintracker = await wallet.services.getChainTracker()
                const height = await chaintracker.currentHeight()
                expect(height).toBeGreaterThan(800000)
            }
        }
    })

    test('4 getMerklePath', async () => {
        for (const { chain, wallet, services } of ctxs) {
            if (!wallet.services || !services) throw new sdk.WERR_INTERNAL('test requires setup with services')

            {
                const mp = await wallet.services.getMerklePath('9cce99686bc8621db439b7150dd5b3b269e4b0628fd75160222c417d6f2b95e4')
                if (chain === 'main')
                    expect(mp.merklePath?.blockHeight).toBe(877599)
                else
                    expect(mp.merklePath).not.toBeTruthy()
            }

            await wait(3000)
        }
    })

    test('5 getRawTx', async () => {
        for (const { chain, wallet, services } of ctxs) {
            if (!wallet.services || !services) throw new sdk.WERR_INTERNAL('test requires setup with services')
            {
                const rawTx = await wallet.services.getRawTx('9cce99686bc8621db439b7150dd5b3b269e4b0628fd75160222c417d6f2b95e4')
                if (chain === 'main')
                    expect(rawTx.rawTx!.length).toBe(176)
                else
                    expect(rawTx.rawTx).not.toBeTruthy()
            }
        }
    })

    test('6 postBeef', async () => {
        for (const { chain, wallet, services } of ctxs) {
            if (!wallet.services || !services) throw new sdk.WERR_INTERNAL('test requires setup with services')
            {
                if (chain === 'main') {
                    const txid = '9cce99686bc8621db439b7150dd5b3b269e4b0628fd75160222c417d6f2b95e4'
                    const rawTx = await wallet.services.getRawTx(txid)
                    const mp = await wallet.services.getMerklePath(txid)
                    const beef = new bsv.Beef()
                    beef.mergeBump(mp.merklePath!)
                    beef.mergeRawTx(rawTx.rawTx!)
                    console.log(beef.toLogString())
                    const r = await wallet.services.postBeef(beef, [txid])
                    if (r[0].status === 'error') {
                        console.log(beef.toHex())
                    }
                    expect(r[0].txidResults[0].txid).toBe(txid)
                    expect(r[0].status).toBe('error')
                }
            }
        }
    })
})
