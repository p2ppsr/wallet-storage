import { _tu } from '../utils/TestUtilsWalletStorage'
import { entity, maxDate, sdk, StorageKnex, sync } from '../../src';
import { StorageMySQLDojoReader } from '../../src/storage/sync/StorageMySQLDojoReader';

import * as dotenv from 'dotenv'
dotenv.config();

describe('StorageMySQLDojoReader tests', () => {
    jest.setTimeout(99999999)

    const chain: sdk.Chain = 'test'
    let reader: sdk.StorageSyncReader
    let writer: sdk.WalletStorage //sdk.StorageSyncWriter

    beforeAll(async () => {
        const connection = JSON.parse((chain === 'test' ? process.env.TEST_DOJO_CONNECTION : process.env.MAIN_DOJO_CONNECTION) || '')
        const readerKnex = _tu.createMySQLFromConnection(connection)
        reader = new StorageMySQLDojoReader({ chain, knex: readerKnex })

        const writerKnex = _tu.createLocalMySQL('stagingdojotone')
        writer = new StorageKnex({ chain, knex: writerKnex })
        await writer.dropAllData()
        await writer.migrate('stagingdojotone')
    })

    afterAll(async () => {
        await reader.destroy()
        await writer.destroy()
    })

    test('0', async () => {
        const readerSettings = await reader.getSettings()
        const writerSettings = await writer.getSettings()

        const identityKey = process.env.MY_TEST_IDENTITY || ''
        const ss = await entity.SyncState.fromStorage(writer, identityKey, readerSettings)

        for (;;) {
            const args = ss.makeRequestSyncChunkArgs(identityKey)
            const chunk = await reader.requestSyncChunk(args)
            const r = await ss.processRequestSyncChunkResult(writer, args, chunk)
            //console.log(`${r.maxUpdated_at} inserted ${r.inserts} updated ${r.updates}`)
            if (r.done)
                break;
        }
    })

})
