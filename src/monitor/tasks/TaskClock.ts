import { WalletMonitor } from '../WalletMonitor';
import { WalletMonitorTask } from './WalletMonitorTask';


export class TaskClock extends WalletMonitorTask {
    static taskName = 'Clock';
    nextMinute: number

    constructor(monitor: WalletMonitor, public triggerMsecs = 1 * monitor.oneSecond) {
        super(monitor, TaskClock.taskName);
        this.nextMinute = this.getNextMinute()
    }

    trigger(nowMsecsSinceEpoch: number): { run: boolean; } {
        const s = this.storage;

        const run = Date.now() > this.nextMinute

        return { run };
    }

    async runTask(): Promise<void> {
        console.log(`clock: ${new Date(this.nextMinute).toISOString()}`)
        this.nextMinute = this.getNextMinute()
    }

    getNextMinute() : number {
        return Math.ceil(Date.now() / this.monitor.oneMinute) * this.monitor.oneMinute 
    }
}
