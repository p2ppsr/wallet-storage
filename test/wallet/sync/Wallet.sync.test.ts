import { sdk, StorageSyncReader, wait } from "../../../src"
import { TaskCheckForProofs } from "../../../src/monitor/tasks/TaskCheckForProofs"
import { TaskClock } from "../../../src/monitor/tasks/TaskClock"
import { TaskNewHeader } from "../../../src/monitor/tasks/TaskNewHeader"
import { TaskPurge } from "../../../src/monitor/tasks/TaskPurge"
import { _tu, TestSetup1Wallet } from "../../utils/TestUtilsWalletStorage"

describe('Wallet sync tests', () => {
    jest.setTimeout(99999999)

    beforeAll(async () => {
    })

    afterAll(async () => {
    })

    test('0', async () => {
        const env = _tu.getEnv('test')
        const identityKeyTone = '03ac2d10bdb0023f4145cc2eba2fcd2ad3070cb2107b0b48170c46a9440e4cc3fe'
        const rootKeyHex = env.devKeys[identityKeyTone]
        const reader = await _tu.createMySQLTestWallet({ databaseName: 'stagingdojotone', chain: 'test', rootKeyHex })
        const writer = await _tu.createSQLiteTestWallet({ databaseName: 'walletSyncTest', chain: 'test', rootKeyHex, dropAll: true })

        await writer.storage.SyncFromReader(writer.identityKey, reader.activeStorage)

        await reader.activeStorage.destroy()
        await writer.activeStorage.destroy()
    })

})

