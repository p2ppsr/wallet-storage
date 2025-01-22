import { verifyOne, verifyOneOrNone, verifyTruthy, wait, WalletStorageManager } from "../../../src/index.client"
import { StorageKnex } from "../../../src/storage/StorageKnex";
import { _tu, TestWalletNoSetup } from "../../utils/TestUtilsWalletStorage"

import * as dotenv from 'dotenv'

dotenv.config();
describe('Wallet sync tests', () => {
    jest.setTimeout(99999999)

    const env = _tu.getEnv('test')
    const ctxs: TestWalletNoSetup[] = []

    beforeAll(async () => {
        if (!env.noMySQL)
            ctxs.push(await _tu.createLegacyWalletMySQLCopy('walletSyncTestSource'));
        ctxs.push(await _tu.createLegacyWalletSQLiteCopy('walletSyncTestSource'))
    })

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })


    test('0 syncToWriter initial-no changes-1 change', async () => {
        for (const { identityKey, activeStorage: storage } of ctxs) {
            const localSQLiteFile = await _tu.newTmpFile('walleltSyncTest0tmp.sqlite', true, false, false)
            const knexSQLite = _tu.createLocalSQLite(localSQLiteFile)
            const tmpStore = new StorageKnex({...StorageKnex.defaultOptions(), chain: env.chain, knex: knexSQLite })
            //await tmpStore.dropAllData()
            await tmpStore.migrate('walletSyncTest0tmp', '1'.repeat(64))
            const dstSettings = await tmpStore.makeAvailable()

            const srcSettings = await storage.makeAvailable()
            const manager = new WalletStorageManager(identityKey, storage, [tmpStore])

            const auth = await manager.getAuth()
            {
                const r = await manager.syncToWriter(auth, tmpStore)
                expect(r.inserts).toBeGreaterThan(1000)
                expect(r.updates).toBe(0)
            }
            {
                const r = await manager.syncToWriter(auth, tmpStore)
                expect(r.inserts).toBe(0)
                expect(r.updates).toBe(0)
            }
            {
                _tu.insertTestOutputBasket(storage, auth.userId)
                await wait(1000)
                const r = await manager.syncToWriter(auth, tmpStore)
                expect(r.inserts).toBe(1)
                expect(r.updates).toBe(0)
            }
            await tmpStore.destroy()
        }
    })

    test('1a setActive to backup and back to original without backup first', async () => {
        // wallet will be the original active wallet, a backup is added, then setActive is used to initiate backup in each direction.
        for (const ctx of ctxs) {

          await setActiveTwice(ctx, false);

        }
      })

    test('1b setActive to backup and back to original with backup first', async () => {
        // wallet will be the original active wallet, a backup is added, then setActive is used to initiate backup in each direction.
        for (const ctx of ctxs) {

          await setActiveTwice(ctx, true);

        }
      })
})

async function setActiveTwice(ctx: TestWalletNoSetup, withBackupFirst: boolean) {
    const { storage: storageManager, activeStorage: original, userId: originalUserId } = ctx;

    const backup = (await _tu.createSQLiteTestWallet({ databaseName: 'walletSyncTest1aBackup', dropAll: true })).activeStorage;

    if (originalUserId === 1) {
        // Inert a dummy user into backup to make sure the userId isn't same as original
        await backup.findOrInsertUser('99'.repeat(32));
    }

    await storageManager.addWalletStorageProvider(backup);

    if (withBackupFirst) {
        await storageManager.updateBackups()
    }

    const backupIdentityKey = (await backup.makeAvailable()).storageIdentityKey;
    const originalIdentityKey = (await original.makeAvailable()).storageIdentityKey;
    expect(backupIdentityKey).not.toBe(originalIdentityKey);

    const originalAuth = await storageManager.getAuth();
    expect(originalAuth.userId).toBe(originalUserId);
    const originalTransactions = await original.findTransactions({ partial: { userId: originalAuth.userId } });

    const originalUserBefore = verifyTruthy(await original.findUserById(originalAuth.userId!));
    const backupUserBefore = verifyOneOrNone(await backup.findUsers({ partial: { identityKey: originalAuth.identityKey } }));

    let now = Date.now();

    expect(originalUserBefore.updated_at.getTime()).toBeLessThan(now);
    expect(!backupUserBefore || backupUserBefore.updated_at.getTime() < now).toBe(true);

    // sync to backup and make it active.
    await storageManager.setActive(backupIdentityKey);

    let originalUserAfter = verifyTruthy(await original.findUserById(originalAuth.userId!));
    let backupUserAfter = verifyOne(await backup.findUsers({ partial: { identityKey: originalAuth.identityKey } }));

    expect(originalUserAfter.updated_at.getTime()).toBeGreaterThan(now);
    expect(backupUserAfter.updated_at.getTime()).toBeGreaterThan(now);
    expect(originalUserAfter.activeStorage).toBe(backupIdentityKey);
    expect(backupUserAfter.activeStorage).toBe(backupIdentityKey);


    const backupAuth = await storageManager.getAuth();
    const backupTransactions = await backup.findTransactions({ partial: { userId: backupAuth.userId } });

    now = Date.now();

    // sync back to original and make it active.
    await storageManager.setActive(original.getSettings().storageIdentityKey);

    originalUserAfter = verifyTruthy(await original.findUserById(originalAuth.userId!));
    backupUserAfter = verifyOne(await backup.findUsers({ partial: { identityKey: originalAuth.identityKey } }));

    expect(originalUserAfter.updated_at.getTime()).toBeGreaterThanOrEqual(now);
    expect(backupUserAfter.updated_at.getTime()).toBeGreaterThanOrEqual(now);
    expect(originalUserAfter.activeStorage).toBe(originalIdentityKey);
    expect(backupUserAfter.activeStorage).toBe(originalIdentityKey);
}

