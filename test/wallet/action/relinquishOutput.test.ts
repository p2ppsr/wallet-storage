import * as bsv from '@bsv/sdk'
import { sdk, StorageKnex } from '../../../src'
import { _tu, expectToThrowWERR, TestWalletNoSetup } from '../../utils/TestUtilsWalletStorage'
import { getBeefForTransaction } from '../../../src/storage/methods/getBeefForTransaction'

describe('RelinquishOutputArgs tests', () => {
  jest.setTimeout(99999999)

  const env = _tu.getEnv('test')
  const ctxs: TestWalletNoSetup[] = []

  beforeAll(async () => {
    if (!env.noMySQL) ctxs.push(await _tu.createLegacyWalletMySQLCopy('abortActionTests'))
    ctxs.push(await _tu.createLegacyWalletSQLiteCopy('abortActionTests'))
  })

  afterAll(async () => {
    for (const ctx of ctxs) {
      await ctx.storage.destroy()
    }
  })

  test('001_default', async () => {
    //const storage = ctxs[0].activeStorage as StorageKnex // Initialize storage
    const outputTxid = '2795b293c698b2244147aaba745db887a632d21990c474df46d842ec3e52f122'
    const expectedResult = {relinquished: true}
    
    for (const { wallet } of ctxs) {
      try {const args: sdk.RelinquishOutputArgs = {
    basket:'default',
    output: `${outputTxid}.0`
  }

    const outputs = await _tu.getOutputs(nr)
    expect(outputs.outputs[0].basketId).toBe(1)
    const r1 = await wallet.relinquishOutput(args)
    await expect(Promise.resolve(r2a)).resolves.toEqual(expectedResult)

    expect(r1).toEqual(expectedResult)
      }
  })
})