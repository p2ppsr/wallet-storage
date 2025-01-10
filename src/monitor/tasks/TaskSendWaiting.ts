import { verifyTruthy } from '../../utility';
import { Monitor } from '../Monitor';
import { WalletMonitorTask } from './WalletMonitorTask';


export class TaskSendWaiting extends WalletMonitorTask {
    static taskName = 'SendWaiting';

    constructor(monitor: Monitor, public triggerMsecs = 1000 * 60 * 5, public agedMsecs = 0) {
        super(monitor, TaskSendWaiting.taskName);
    }

    trigger(nowMsecsSinceEpoch: number): { run: boolean; } {
        return { run: nowMsecsSinceEpoch > this.lastRunMsecsSinceEpoch + this.triggerMsecs };
    }

    async runTask(): Promise<void> {
        const limit = 100;
        let offset = 0;
        const agedLimit = new Date(Date.now() - this.agedMsecs);
        for (; ;) {
            let log = '';
            const reqs = await this.storage.findProvenTxReqs({ partial: {}, status: ['unsent'], paged: { limit, offset } });
            if (reqs.length === 0) break;
            log += `SendWaiting: ${reqs.length} reqs with status 'unsent'\n`;
            const agedReqs = reqs.filter(req => verifyTruthy(req.updated_at) < agedLimit);
            log += `  Of those reqs, ${agedReqs.length} where last updated before ${agedLimit.toISOString()}.\n`;
            log += await this.monitor.processUnsent(agedReqs, 2);
            console.log(log);
            if (reqs.length < limit) break;
            offset += limit;
        }
    }
}
