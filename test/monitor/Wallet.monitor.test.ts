import exp from "constants"
import { sdk, verifyOne, wait } from "../../src"
import { TaskCheckForProofs } from "../../src/monitor/tasks/TaskCheckForProofs"
import { TaskClock } from "../../src/monitor/tasks/TaskClock"
import { TaskNewHeader } from "../../src/monitor/tasks/TaskNewHeader"
import { TaskPurge } from "../../src/monitor/tasks/TaskPurge"
import { TaskSendWaiting } from "../../src/monitor/tasks/TaskSendWaiting"
import { _tu, TestSetup1Wallet, TestWallet } from "../utils/TestUtilsWalletStorage"

describe('Monitor tests', () => {
    jest.setTimeout(99999999)

    const ctxs: TestSetup1Wallet[] = []
    
    beforeAll(async () => {
        ctxs.push(await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'walletMonitorMain', chain: 'main', rootKeyHex: '3'.repeat(64)}))
        //ctxs.push(await _tu.createSQLiteTestSetup1Wallet({ databaseName: 'walletMonitorTest', chain: 'test', rootKeyHex: '3'.repeat(64)}))
    })

    afterAll(async () => {
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })

    test.skip('0 TaskClock', async () => {
        // This test takes a bit over a minute to run... un-skip it to work on it.
        for (const { chain, wallet, services, monitor } of ctxs) {

            if (!monitor) throw new sdk.WERR_INTERNAL('test requires setup with monitor');

            {
                // The clock attempts to update nextMinute to msecs for each minute.
                // Starting the clock and waiting a bit over a minute should see the value
                // increase by one minute's worth of msecs.
                const task = new TaskClock(monitor)
                monitor._tasks.push(task)
                const msecsFirst = task.nextMinute
                const startTasksPromise = monitor.startTasks()
                await wait(monitor.oneMinute * 1.1)
                const msecsNext = task.nextMinute
                monitor.stopTasks()
                const elapsed = (msecsNext - msecsFirst) / monitor.oneMinute
                expect(elapsed === 1 || elapsed === 2).toBe(true)
                await startTasksPromise
            }
        }
    })

    test.skip('1 TaskNewHeader', async () => {
        // This test takes 10+ seconds to run... un-skip it to work on it.
        for (const { chain, wallet, services, monitor } of ctxs) {

            if (!monitor) throw new sdk.WERR_INTERNAL('test requires setup with monitor');

            {
                // The new header task polls chaintracks for latest header and if new sets flag to check for proofs.
                // Starting the clock and waiting a bit should cause first header to be fetched and flag to be set.
                const task = new TaskNewHeader(monitor)
                monitor._tasks.push(task)
                expect(TaskCheckForProofs.checkNow).toBe(false)
                const startTasksPromise = monitor.startTasks()
                await wait(monitor.oneSecond * 10)
                expect(task.header).toBeTruthy()
                expect(TaskCheckForProofs.checkNow).toBe(true)
                monitor.stopTasks()
                await startTasksPromise
            }
        }
    })

    test('2 TaskPurge', async () => {
        /*
        ** The following code is too test against un-purged data copied from staging-dojo:
        const ctxs: TestWallet<{}>[] = []
        const env = _tu.getEnv('test')
        const identityKeyTone = '03ac2d10bdb0023f4145cc2eba2fcd2ad3070cb2107b0b48170c46a9440e4cc3fe'
        const rootKeyHex = env.devKeys[identityKeyTone]
        ctxs.push(await _tu.createMySQLTestWallet({ databaseName: 'stagingdojotone', chain: 'test', rootKeyHex, dropAll: false }))
        */

        for (const { chain, wallet, services, monitor } of ctxs) {

            if (!monitor) throw new sdk.WERR_INTERNAL('test requires setup with monitor');

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
        }
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })

    test('3 TaskSendWaiting', async () => {
        const ctxs: TestWallet<{}>[] = []
        ctxs.push(await _tu.createLegacyWalletSQLiteCopy('monitorTest3'))
        let txidsPosted: string[] = []
        _tu.mockPostServicesAsCallback(ctxs, (beef, txids) => { txidsPosted.push(...txids); return 'success' })

        for (const { activeStorage: storage, monitor } of ctxs) {

            if (!monitor) throw new sdk.WERR_INTERNAL('test requires setup with monitor');

            {
                const task = new TaskSendWaiting(monitor, 1, 1)
                monitor._tasks.push(task)
                txidsPosted = []
                const expectedTxids = [
                    "d9ec73b2e0f06e0f482d2d1db9ceccf2f212f0b24afbe10846ac907567be571f",
                    "b7634f08d8c7f3c6244050bebf73a79f40e672aba7d5232663609a58b123b816",
                    "3d2ea64ee584a1f6eb161dbedf3a8d299e3e4497ac7a203d23c044c998c6aa08",
                    "a3a8fe7f541c1383ff7b975af49b27284ae720af5f2705d8409baaf519190d26",
                    "6d68cc6fa7363e59aaccbaa65f0ca613a6ae8af718453ab5d3a2b022c59b5cc6",
                ]
                for (const txid of expectedTxids) {
                    const tx = verifyOne(await storage.findProvenTxReqs({ partial: { txid }}))
                    expect(tx.status).toBe('unsent')
                }

                await monitor.runTask('SendWaiting')

                expect(txidsPosted).toEqual(expectedTxids)
                for (const txid of expectedTxids) {
                    const tx = verifyOne(await storage.findProvenTxReqs({ partial: { txid }}))
                    expect(tx.status).toBe('sending')
                }
            }
        }
        for (const ctx of ctxs) {
            await ctx.storage.destroy()
        }
    })
})
