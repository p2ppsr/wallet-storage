import { Monitor } from '../Monitor';
import { WalletMonitorTask } from './WalletMonitorTask';


export class TaskCheckProofs extends WalletMonitorTask {
    static taskName = 'CheckProofs';

    /**
     * Set to true to trigger running this task
     */
    static checkNow = false;

    constructor(monitor: Monitor, public triggerMsecs = 1000 * 60 * 60 * 4) {
        super(monitor, TaskCheckProofs.taskName);
    }

    trigger(nowMsecsSinceEpoch: number): { run: boolean; } {
        return {
            run: (
                TaskCheckProofs.checkNow ||
                nowMsecsSinceEpoch - this.lastRunMsecsSinceEpoch > this.triggerMsecs
            )
        };
    }

    async runTask(): Promise<void> {
        TaskCheckProofs.checkNow = false;

        //    const r = await checkCompletedWithoutProofs(this.storage)
        //    console.log("CheckProofs", JSON.stringify(r))
    }
}
