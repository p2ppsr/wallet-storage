import { sdk, StorageSyncReader, wait } from "../../../src"
import { TaskCheckForProofs } from "../../../src/monitor/tasks/TaskCheckForProofs"
import { TaskClock } from "../../../src/monitor/tasks/TaskClock"
import { TaskNewHeader } from "../../../src/monitor/tasks/TaskNewHeader"
import { TaskPurge } from "../../../src/monitor/tasks/TaskPurge"
import { StorageMySQLDojoReader } from "../../../src/storage/sync"
import { _tu, TestSetup1Wallet } from "../../utils/TestUtilsWalletStorage"

import * as dotenv from 'dotenv'

dotenv.config();

/**
 * NOTICE: These tests are designed to chain one after the other.
 * Disable the "await WaitFor*()" lines to run them individually.
 * 
 * The inital import from staging dojo takes around 100 seconds... be patient.
 */
describe('Wallet sync tests', () => {
    jest.setTimeout(99999999)

    beforeAll(async () => {
    })

    afterAll(async () => {
    })

    let done0 = false
    const waitFor0 = async () => { while (!done0) await wait(100) }
    let done1 = false
    const waitFor1 = async () => { while (!done1) await wait(100) }
    let done2 = false
    const waitFor2 = async () => { while (!done2) await wait(100) }

    const env = _tu.getEnv('test')
    const identityKeyTone = '03ac2d10bdb0023f4145cc2eba2fcd2ad3070cb2107b0b48170c46a9440e4cc3fe'
    const rootKeyHex = env.devKeys[identityKeyTone]

    test('0 sync staging dojo to local MySQL', async () => {
        console.log('Importing from staging dojo to local MySQL stagingdojotone')
        const chain: sdk.Chain = 'test'
        const connection = JSON.parse(process.env.TEST_DOJO_CONNECTION || '')
        const readerKnex = _tu.createMySQLFromConnection(connection)
        const reader = new StorageMySQLDojoReader({ chain, knex: readerKnex })
        const writer = await _tu.createMySQLTestWallet({ databaseName: 'stagingdojotone', chain: 'test', rootKeyHex, dropAll: true })

        await writer.storage.SyncFromReader(writer.identityKey, reader)

        await reader.destroy()
        await writer.activeStorage.destroy()
        done0 = true
    })

    test('1 aggressively purge records from MySQL stagingdojotone', async () => {
        await waitFor0()

        const { monitor, activeStorage } = await _tu.createMySQLTestWallet({ databaseName: 'stagingdojotone', chain: 'test', rootKeyHex })

        {
            const task = new TaskPurge(monitor, {
                purgeCompleted: true,
                purgeFailed: true,
                purgeSpent: true,
                purgeCompletedAge: 1,
                purgeFailedAge: 1,
                purgeSpentAge: 1,
            })
            TaskPurge.checkNow = true
            monitor._tasks.push(task)
            await monitor.runTask('Purge')
        }

        await activeStorage.destroy()

        done1 = true
    })

    test('2 sync pruned MySQL stagingdojotone to SQLite walletLegacyTestData', async () => {
        await waitFor1()
        console.log('syncing local MySQL stagingdojotone to local SQLite walletLegacyTestData in tmp folder')
        const reader = await _tu.createMySQLTestWallet({ databaseName: 'stagingdojotone', chain: 'test', rootKeyHex })
        const writer = await _tu.createSQLiteTestWallet({ databaseName: 'walletLegacyTestData', chain: 'test', rootKeyHex, dropAll: true })

        await writer.storage.SyncFromReader(writer.identityKey, reader.activeStorage)

        await reader.activeStorage.destroy()
        await writer.activeStorage.destroy()

        console.log('REMEMBER: copy walletLegacyTestData.sqlite from tmp up to data!')
        done2 = true
    })

    test('3 sync pruned MySQL stagingdojotone to MySQL walletLegacyTestData', async () => {
        //await waitFor2()
        console.log('syncing local MySQL stagingdojotone to local SQLite walletLegacyTestData in tmp folder')
        const reader = await _tu.createMySQLTestWallet({ databaseName: 'stagingdojotone', chain: 'test', rootKeyHex })
        const writer = await _tu.createMySQLTestWallet({ databaseName: 'walletLegacyTestData', chain: 'test', rootKeyHex, dropAll: true })

        await writer.storage.SyncFromReader(writer.identityKey, reader.activeStorage)

        await reader.activeStorage.destroy()
        await writer.activeStorage.destroy()
    })

})

