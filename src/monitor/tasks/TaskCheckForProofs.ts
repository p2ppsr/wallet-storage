import { asString, doubleSha256BE, entity, sdk, table } from '../..';
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
            const r = await this.getProofs(reqs, 2, countsAsAttempt);
            log += `${r.log}\n`;
            console.log(log);
            if (reqs.length < limit) break;
            offset += limit;
        }
        return log
    }

    /**
     * Process an array of table.ProvenTxReq (typically with status 'unmined' or 'unknown')
     * 
     * If req is invalid, set status 'invalid'
     * 
     * Verify the requests are valid, lookup proofs or updated transaction status using the array of getProofServices,
     * 
     * When proofs are found, create new ProvenTxApi records and transition the requests' status to 'unconfirmed' or 'notifying',
     * depending on chaintracks succeeding on proof verification. 
     *
     * Increments attempts if proofs where requested.
     *
     * @param reqs 
     * @returns reqs partitioned by status
     */
    async getProofs(reqs: table.ProvenTxReq[], indent = 0, countsAsAttempt = false, ignoreStatus = false)
    : Promise<{
        proven: table.ProvenTxReq[],
        invalid: table.ProvenTxReq[],
        log: string
    }> {
        const proven: table.ProvenTxReq[] = []
        const invalid: table.ProvenTxReq[] = []

        let log = ''
        for (const reqApi of reqs) {
            log += ' '.repeat(indent)
            log += `reqId ${reqApi.provenTxReqId} txid ${reqApi.txid}: `
            
            if (!ignoreStatus &&
                reqApi.status !== 'callback' &&
                reqApi.status !== 'unmined' &&
                reqApi.status !== 'unknown' &&
                reqApi.status !== 'unconfirmed' &&
                reqApi.status !== 'nosend' &&
                reqApi.status !== 'sending') {
                log += `status of '${reqApi.status}' is not ready to be proven.\n`
                continue
            }

            const req = new entity.ProvenTxReq(reqApi)

            if (Number.isInteger(req.provenTxId)) {
                log += `Already linked to provenTxId ${req.provenTxId}.\n`
                req.notified = false
                req.status = 'completed'
                await req.updateStorageDynamicProperties(this.storage)
                proven.push(reqApi)
                continue
            }
            
            log += '\n'

            let reqIsValid = false
            if (req.rawTx) {
                const txid = asString(doubleSha256BE(req.rawTx))
                if (txid === req.txid)
                    reqIsValid = true
            }

            if (!reqIsValid) {
                log += ` rawTx doesn't hash to txid. status => invalid.\n`
                req.notified = false
                req.status = 'invalid'
                await req.updateStorageDynamicProperties(this.storage)
                invalid.push(reqApi)
                continue
            }

            const limit = this.monitor.chain === 'main' ? this.monitor.options.unprovenAttemptsLimitMain : this.monitor.options.unprovenAttemptsLimitTest
            if (!ignoreStatus && req.attempts > limit) {
                log += ` too many failed attempts ${req.attempts}\n`
                req.notified = false
                req.status = 'invalid'
                await req.updateStorageDynamicProperties(this.storage)
                invalid.push(reqApi)
                continue
            }

            const since = new Date()

            let r: sdk.GetMerklePathResult
            let ptx: entity.ProvenTx | undefined

            // External services will try multiple providers until one returns a proof,
            // or they all fail.
            // There may also be an array of proofs to consider when a transaction
            // is recently mined and appears in orphan blocks in addition to active chain blocks.
            // Since orphan blocks can end up on chain again, multiple proofs has value.
            //
            // On failure, there may be a mapi response, or an error.
            //
            // The proofs returned are considered sequentially, validating and chaintracks confirming.
            //
            // If a good proof is found, proceed to using it.
            //
            // When all received proofs fail, force a bump to the next service provider and try
            // one more time.
            //
            r = await this.monitor.services.getMerklePath(req.txid)
            ptx = await entity.ProvenTx.fromReq(req, r, this.monitor.chaintracks, countsAsAttempt && req.status !== 'nosend')

            if (ptx) {
                // We have a merklePath proof for the request (and a block header)
                const { provenTxReqId, status, txid, attempts, history } = req.toApi()
                const { index, height, blockHash, merklePath, merkleRoot } = ptx.toApi()
                const r = await this.storage.runAsStorageProvider(async (sp) => {
                    return await sp.updateProvenTxReqWithNewProvenTx({
                        provenTxReqId, status, txid, attempts, history, index, height, blockHash, merklePath, merkleRoot
                    })
                })
                req.status = r.status
                req.apiHistory = r.history
                req.provenTxId = r.provenTxId
                req.notified = true
            } else {
                if (countsAsAttempt && req.status !== 'nosend') {
                    req.attempts++
                }
                await req.updateStorageDynamicProperties(this.storage)
                await req.refreshFromStorage(this.storage)
            }


            log += req.historyPretty(since, indent + 2) + '\n'

            if (req.status === 'completed') proven.push(req.api)
            if (req.status === 'invalid') invalid.push(req.api)
        }
        
        return { proven, invalid, log }
    }
}
