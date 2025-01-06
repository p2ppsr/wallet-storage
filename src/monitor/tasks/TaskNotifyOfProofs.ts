import { sdk } from '../..';
import { WalletMonitor } from '../WalletMonitor';
import { WalletMonitorTask } from './WalletMonitorTask';


export class TaskNotifyOfProofs extends WalletMonitorTask {
    static taskName = 'NotifyOfProofs';

    /**
     * Set to true to trigger running this task
     */
    static checkNow = false;

    constructor(monitor: WalletMonitor, public triggerMsecs = 0) {
        super(monitor, TaskNotifyOfProofs.taskName);
    }

    /**
     * Normally triggered by checkNow getting set to true when a new proof is obtained.
     */
    trigger(nowMsecsSinceEpoch: number): { run: boolean; } {
        return {
            run: (
                TaskNotifyOfProofs.checkNow ||
                this.triggerMsecs > 0 && nowMsecsSinceEpoch - this.lastRunMsecsSinceEpoch > this.triggerMsecs
            )
        };
    }

    async runTask(): Promise<void> {
        TaskNotifyOfProofs.checkNow = false;

        const limit = 100;
        let offset = 0;
        for (; ;) {
            let log = '';
            const reqs = await this.storage.findProvenTxReqs({ partial: { notified: false }, status: sdk.ProvenTxReqTerminalStatus, paged: { limit, offset } });
            if (reqs.length === 0) break;
            log += `NotifyOfProofs: ${reqs.length} reqs with notified false\n`;
            const r = await this.monitor.notifyOfProvenTx(reqs, 2);
            log += r.log;
            console.log(log);
            if (reqs.length < limit) break;
            offset += limit;
        }
    }
}
