import { Monitor } from '../Monitor';
import { WalletMonitorTask } from './WalletMonitorTask';


export class TaskValidate extends WalletMonitorTask {
    static taskName = 'Validate';

    /**
     * Set to true to trigger running this task
     */
    static checkNow = false;

    constructor(monitor: Monitor, public triggerMsecs = 0) {
        super(monitor, TaskValidate.taskName);
    }

    trigger(nowMsecsSinceEpoch: number): { run: boolean; } {
        return {
            run: (
                TaskValidate.checkNow ||
                this.triggerMsecs > 0 && nowMsecsSinceEpoch - this.lastRunMsecsSinceEpoch > this.triggerMsecs
            )
        };
    }

    async runTask(): Promise<void> {
        TaskValidate.checkNow = false;

        //await this.monitor.validate(ValidateWhat.All, 'fix')
        console.log("Validate done");
    }
}
