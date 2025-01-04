import { sdk } from "../../../src"
import { _tu, expectToThrowWERR, TestWalletNoSetup } from "../../utils/TestUtilsWalletStorage"

describe('abortAction tests', () => {
    jest.setTimeout(99999999)

    const env = _tu.getEnv('test')
    const ctxs: TestWalletNoSetup[] = []

    beforeAll(async () => {
        if (!env.noMySQL)
            ctxs.push(await _tu.createLegacyWalletMySQLCopy('abortActionTests'));
        ctxs.push(await _tu.createLegacyWalletSQLiteCopy('abortActionTests'))
    })

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })

    test('0 invalid params', async () => {
        for (const { wallet } of ctxs) {
            const invalidArgs: sdk.AbortActionArgs[] = [
        { reference: '' },
        { reference: '====' },
        { reference: 'a'.repeat(301) },
        { reference: 'a'.repeat(300) },
                // Oh so many things to test...
            ]

            for (const args of invalidArgs) {
                await expectToThrowWERR(sdk.WERR_INVALID_PARAMETER, () => wallet.abortAction(args))
            }
        }
    })

    test('1 abort noSend', async () => {
        for (const { wallet } of ctxs) {
            let noSendChange: string[] | undefined
            const root = '02135476'
            const kp = _tu.getKeyPair(root.repeat(8));

            const r = await _tu.createNoSendP2PKHTestOutpoint(kp.address, 42, noSendChange, wallet)

            await wallet.abortAction({ reference: r.cr.signableTransaction!.reference })
        }
    })
})