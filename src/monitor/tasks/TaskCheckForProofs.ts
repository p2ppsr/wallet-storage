import { Monitor } from '../Monitor';
import { WalletMonitorTask } from './WalletMonitorTask';

/**
 * `TaskCheckForProofs` is a WalletMonitor task that retreives merkle proofs for
 * transactions.
 *
 * It is normally triggered by the Chaintracks new block header event.
 *
 * When a new block is found, cwi-external-services are used to obtain proofs for
 * any transactions that are currently in the 'unmined' or 'unknown' state.
 *
 * If a proof is obtained and validated, a new ProvenTx record is created and
 * the original ProvenTxReq status is advanced to 'notifying'.
 */

export class TaskCheckForProofs extends WalletMonitorTask {
    static taskName = 'CheckForProofs';

    /**
     * An external service such as the chaintracks new block header
     * listener can set this true to cause
     */
    static checkNow = false;

    constructor(monitor: Monitor, public triggerMsecs = 0) {
        super(monitor, TaskCheckForProofs.taskName);
    }

    /**
     * Normally triggered by checkNow getting set by new block header found event from chaintracks
     */
    trigger(nowMsecsSinceEpoch: number): { run: boolean; } {
        return {
            run: (
                TaskCheckForProofs.checkNow ||
                this.triggerMsecs > 0 && nowMsecsSinceEpoch - this.lastRunMsecsSinceEpoch > this.triggerMsecs
            )
        };
    }

    async runTask(): Promise<string> {
        let log = '';
        const countsAsAttempt = TaskCheckForProofs.checkNow;
        TaskCheckForProofs.checkNow = false;

        const limit = 100;
        let offset = 0;
        for (; ;) {
            const reqs = await this.storage.findProvenTxReqs({ partial: {}, status: ['callback', 'unmined', 'nosend', 'sending', 'unknown', 'unconfirmed'], paged: { limit, offset } });
            if (reqs.length === 0) break;
            log += `${reqs.length} reqs with status 'callback', 'unmined', 'nosend', 'sending', 'unknown', or 'unconfirmed'\n`;
            const r = await this.monitor.getProofs(reqs, 2, countsAsAttempt);
            log += `${r.log}\n`;
            console.log(log);
            if (reqs.length < limit) break;
            offset += limit;
        }
        return log
    }
}
