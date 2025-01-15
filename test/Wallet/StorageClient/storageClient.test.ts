/* eslint-disable @typescript-eslint/no-unused-vars */
import * as bsv from '@bsv/sdk'
import { sdk, StorageClient } from '../../../src'
import { _tu, expectToThrowWERR, TestWalletNoSetup, TestWalletOnly } from '../../utils/TestUtilsWalletStorage'

const noLog = false

describe('walletStorageClient test', () => {
    jest.setTimeout(99999999)

    const env = _tu.getEnv('test')
    const testName = () => expect.getState().currentTestName || 'test'

    const ctxs: TestWalletOnly[] = []

    beforeAll(async () => {
        //_tu.mockPostServicesAsSuccess(ctxs)
    })

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })

    test('1 backup to client', async () => {
        const ctx = await _tu.createLegacyWalletSQLiteCopy('walletStorageClient1')
        ctxs.push(ctx)
        const { wallet, storage } = ctx

        {
            const client = new StorageClient(wallet, 'https://staging-dojo.babbage.systems')
            await storage.addWalletStorageProvider(client)
            await storage.updateBackups()
        }
    })

    test('2 create storage client wallet', async () => {
        const ctx = await _tu.createTestWalletWithStorageClient({ rootKeyHex: '1'.repeat(64) })
        ctxs.push(ctx)
        const { wallet, storage } = ctx

        {
            const auth = await storage.getAuth()
            expect(auth.userId).toBeTruthy()
        }
    })
})
