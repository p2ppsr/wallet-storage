import { _tu } from '../../utils/TestUtilsWalletStorage'

describe('createWalletSQLite tests', () => {
  jest.setTimeout(99999999)

  test('0 demo problem createWalletSQLite', async () => {
    const ctxSend = await _tu.createLegacyWalletSQLiteCopy('internalizeActionTests')
    expect(ctxSend).toBeTruthy()
    const ctxReceive = await _tu.createWalletSQLite('./test/data/tmp/walletNewTestData.sqlite', 'walletNewTestData')
    expect(ctxReceive).toBeTruthy()
    await ctxSend.storage.destroy()
    await ctxReceive.storage.destroy()
  })
})
