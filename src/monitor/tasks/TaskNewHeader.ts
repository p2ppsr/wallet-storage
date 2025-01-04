import { sdk } from '../..';
import { WalletMonitor } from '../WalletMonitor';
import { TaskCheckForProofs } from './TaskCheckForProofs';
import { WalletMonitorTask } from './WalletMonitorTask';


export class TaskNewHeader extends WalletMonitorTask {
    static taskName = 'NewHeader';
    header?: sdk.BlockHeaderHex

    constructor(monitor: WalletMonitor, public triggerMsecs = 1 * monitor.oneMinute) {
        super(monitor, TaskNewHeader.taskName);
    }

    async getHeader() : Promise<sdk.BlockHeaderHex> {
        return await this.monitor.chaintracks.findChainTipHeaderHex()
    }

    trigger(nowMsecsSinceEpoch: number): { run: boolean; } {
        const run = true
        return { run };
    }

    async runTask(): Promise<void> {
        const oldHeader = this.header
        this.header = await this.getHeader()
        let isNew = true
        if (!oldHeader) {
            console.log(`first header: ${this.header.height} ${this.header.hash}`)
        } else if (oldHeader.height < this.header.height) {
            const skip = this.header.height - oldHeader.height + 1
            const skipped = skip > 0 ? ` SKIPPED ${skip}` : ''
            console.log(`new header: ${this.header.height} ${this.header.hash}${skipped}`)
        } else if (oldHeader.height === this.header.height && oldHeader.hash != this.header.hash) {
            console.log(`reorg header: ${this.header.height} ${this.header.hash}`)
        } else {
            isNew = false
        }
        if (isNew)
            TaskCheckForProofs.checkNow = true
    }
}
