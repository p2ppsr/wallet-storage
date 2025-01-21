import { entity, table } from '../../storage/index.client';
import { verifyTruthy } from '../../utility';
import { Monitor } from '../Monitor';
import { WalletMonitorTask } from './WalletMonitorTask';
import { attemptToPostReqsToNetwork } from '../../storage/methods/attemptToPostReqsToNetwork';


export class TaskSendWaiting extends WalletMonitorTask {
    static taskName = 'SendWaiting';

    constructor(monitor: Monitor, public triggerMsecs = 1000 * 60 * 5, public agedMsecs = 0) {
        super(monitor, TaskSendWaiting.taskName);
    }

    trigger(nowMsecsSinceEpoch: number): { run: boolean; } {
        return { run: nowMsecsSinceEpoch > this.lastRunMsecsSinceEpoch + this.triggerMsecs };
    }

    async runTask(): Promise<string> {
        let log = '';
        const limit = 100;
        let offset = 0;
        const agedLimit = new Date(Date.now() - this.agedMsecs);
        for (; ;) {
            const reqs = await this.storage.findProvenTxReqs({ partial: {}, status: ['unsent'], paged: { limit, offset } });
            if (reqs.length === 0) break;
            log += `${reqs.length} reqs with status 'unsent'\n`;
            const agedReqs = reqs.filter(req => verifyTruthy(req.updated_at) < agedLimit);
            log += `  Of those reqs, ${agedReqs.length} where last updated before ${agedLimit.toISOString()}.\n`;
            log += await this.processUnsent(agedReqs, 2);
            if (reqs.length < limit) break;
            offset += limit;
        }
        return log
    }

    /**
     * Process an array of 'unsent' status table.ProvenTxReq 
     * 
     * Send rawTx to transaction processor(s), requesting proof callbacks when possible.
     * 
     * Set status 'invalid' if req is invalid.
     * 
     * Set status to 'callback' on successful network submission with callback service.
     * 
     * Set status to 'unmined' on successful network submission without callback service.
     * 
     * Add mapi responses to database table if received.
     * 
     * Increments attempts if sending was attempted.
     *
     * @param reqApis 
     */
    async processUnsent(reqApis: table.ProvenTxReq[], indent = 0) : Promise<string> {
        let log = ''
        for (let i = 0; i < reqApis.length; i++) {
            const reqApi = reqApis[i]
            log += ' '.repeat(indent)
            log += `${i} reqId=${reqApi.provenTxReqId} attempts=${reqApi.attempts} txid=${reqApi.txid}: \n`
            if (reqApi.status !== 'unsent') {
                log += `  status now ${reqApi.status}\n`
                continue
            }
            const req = new entity.ProvenTxReq(reqApi)
            const reqs: entity.ProvenTxReq[] = []
            if (req.batch) {
                // Make sure wew process entire batch together for efficient beef generation
                const batchReqApis = await this.storage.findProvenTxReqs({ partial: { batch: req.batch, status: 'unsent' } })
                for (const bra of batchReqApis) {
                    // Remove any matching batchReqApis from reqApis
                    const index = reqApis.findIndex(ra => ra.provenTxReqId === bra.provenTxReqId)
                    if (index > -1) reqApis.slice(index, index + 1);
                    // And add to reqs being processed now:
                    reqs.push(new entity.ProvenTxReq(bra))
                }
            } else {
                // Just a single non-batched req...
                reqs.push(req)
            }

            const r = await this.storage.runAsStorageProvider(async (sp) => {

                return attemptToPostReqsToNetwork(sp, reqs)

            })

            log += r.log
            
        }
        return log
    }
}
