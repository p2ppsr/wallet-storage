import { sdk, wait } from "../../../src"
import { TaskCheckForProofs } from "../../../src/monitor/tasks/TaskCheckForProofs"
import { TaskClock } from "../../../src/monitor/tasks/TaskClock"
import { TaskNewHeader } from "../../../src/monitor/tasks/TaskNewHeader"
import { TaskPurge } from "../../../src/monitor/tasks/TaskPurge"
import { _tu, TestSetup1Wallet, TestWallet } from "../../utils/TestUtilsWalletStorage"

describe('Wallet services tests', () => {
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

    test('0 TaskClock', async () => {
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

    test('1 TaskNewHeader', async () => {
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
        const ctxs: TestWallet<{}>[] = []
        const env = _tu.getEnv('test')
        const identityKeyTone = '03ac2d10bdb0023f4145cc2eba2fcd2ad3070cb2107b0b48170c46a9440e4cc3fe'
        const rootKeyHex = env.devKeys[identityKeyTone]
        ctxs.push(await _tu.createMySQLTestWallet({ databaseName: 'stagingdojotone', chain: 'test', rootKeyHex, dropAll: false }))

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
})
