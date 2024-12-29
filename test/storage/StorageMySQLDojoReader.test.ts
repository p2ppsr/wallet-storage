import { _tu } from '../utils/TestUtilsWalletStorage'
import { Knex } from 'knex'
import { sdk } from '../../src';
import { StorageMySQLDojoReader } from '../../src/storage/sync/StorageMySQLDojoReader';

import * as dotenv from 'dotenv'
dotenv.config();

describe('StorageMySQLDojoReader tests', () => {
    jest.setTimeout(99999999)

    const userId = 6
    const chain: sdk.Chain = 'test'
    let knex: Knex

    beforeAll(async () => {
        const connection = JSON.parse((chain === 'test' ? process.env.TEST_DOJO_CONNECTION : process.env.MAIN_DOJO_CONNECTION) || '')
        knex = _tu.createMySQLFromConnection(connection)
    })

    afterAll(async () => {
        await knex.destroy()
    })

    test('0', async () => {
        const storage = new StorageMySQLDojoReader({ chain, knex })
        const settings = await storage.getSettings()

        let offset = 0

        const outputTagMaps = await storage.getOutputTagMapsForUser(userId, undefined, { limit: 10, offset })

        const txLabelMaps = await storage.getTxLabelMapsForUser(userId, undefined, { limit: 10, offset })

        const provenTxReqs = await storage.getProvenTxReqsForUser(userId, undefined, { limit: 10, offset })

        const provenTxs = await storage.getProvenTxsForUser(userId, undefined, { limit: 10, offset })
    })

})
