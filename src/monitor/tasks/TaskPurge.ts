import { sdk } from '../..';
import { Monitor } from '../Monitor';
import { WalletMonitorTask } from './WalletMonitorTask';

/**
 * The database stores a variety of data that may be considered transient.
 * 
 * At one extreme, the data that must be preserved:
 *   - unspent outputs (UTXOs)
 *   - in-use metadata (labels, baskets, tags...)
 * 
 * At the other extreme, everything can be preserved to fully log all transaction creation and processing actions.
 * 
 * The following purge actions are available to support sustained operation:
 *   - Failed transactions, delete all associated data including:
 *       + Delete tag and label mapping records
 *       + Delete output records
 *       + Delete transaction records
 *       + Delete mapi_responses records
 *       + Delete proven_tx_reqs records
 *       + Delete commissions records
 *       + Update output records marked spentBy failed transactions
 *   - Completed transactions, delete transient data including:
 *       + transactions table set truncatedExternalInputs = null
 *       + transactions table set beef = null
 *       + transactions table set rawTx = null
 *       + Delete mapi_responses records
 *       + proven_tx_reqs table delete records
 */
export interface TaskPurgeParams extends sdk.PurgeParams {
}

export class TaskPurge extends WalletMonitorTask {
    static taskName = 'Purge';

    /**
     * Set to true to trigger running this task
     */
    static checkNow = false;

    constructor(monitor: Monitor, public params: TaskPurgeParams, public triggerMsecs = 0) {
        super(monitor, TaskPurge.taskName);
    }

    trigger(nowMsecsSinceEpoch: number): { run: boolean; } {
        return {
            run: (
                TaskPurge.checkNow ||
                this.triggerMsecs > 0 && nowMsecsSinceEpoch - this.lastRunMsecsSinceEpoch > this.triggerMsecs
            )
        };
    }

    async runTask(): Promise<void> {
        TaskPurge.checkNow = false;

        const r = await this.storage.purgeData(this.params)
        console.log(`TaskPurge ${r.count} records updated or deleted.\n${r.log}`)
    }
}
