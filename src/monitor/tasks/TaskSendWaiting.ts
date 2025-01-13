import * as bsv from '@bsv/sdk'
import { sdk } from '../..';
import { entity, table } from '../../storage';
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
            log += await this.processUnsent(agedReqs, 2);
            console.log(log);
            if (reqs.length < limit) break;
            offset += limit;
        }
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
            log += `${i} reqId ${reqApi.provenTxReqId} txid ${reqApi.txid}: \n`
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

            const r = await this.attemptToPostReqsToNetwork(reqs)

            log += r.log
            
        }
        return log
    }

    /**
     * Attempt to post one or more `ProvenTxReq` with status 'unsent'
     * to the bitcoin network.
     * 
     * @param reqs 
     */
    async attemptToPostReqsToNetwork(reqs: entity.ProvenTxReq[], trx?: sdk.TrxToken): Promise<PostReqsToNetworkResult> {

        const r: PostReqsToNetworkResult = {
            status: 'success',
            beef: new bsv.Beef(),
            details: [],
            log: ''
        }
        for (const req of reqs) {
            r.details.push({
                txid: req.txid,
                req,
                status: "unknown",
                pbrft: {
                    txid: req.txid,
                    status: "error"
                },
                data: undefined,
                error: undefined
            })
        }
        const txids = reqs.map(r => r.txid)

        let invalid: boolean = false
        for (const rb of reqs) {
            let badReq: boolean = false
            if (!rb.rawTx) {
                badReq = true; rb.addHistoryNote(`invalid req: rawTx must be valid`);
            }
            if (!rb.notify.transactionIds || rb.notify.transactionIds.length < 1) {
                badReq = true; rb.addHistoryNote(`invalid req: must have at least one transaction to notify`);
            }
            if (rb.attempts > 10) {
                badReq = true; rb.addHistoryNote(`invalid req: too many attempts ${rb.attempts}`);
            }
            if (badReq) invalid = true

            // Accumulate batch beefs.
            await this.mergeReqToBeefToShareExternally(rb.api, r.beef, [], trx)
        }

        if (invalid) {
            for (const req of reqs) {
                // batch passes or fails as a whole...prior to post to network attempt.
                req.status = 'invalid'
                await req.updateStorageDynamicProperties(this.storage)
                r.log += `status set to ${req.status}\n`
            }
            return r;
        }

        // Use cwi-external-services to post the aggregate beef
        // and add the new results to aggregate results.
        const pbrs = await this.monitor.services.postBeef(r.beef, txids)
        const pbrOk = pbrs.find(p => p.status === 'success')
        r.pbr = pbrOk ? pbrOk : pbrs.length > 0 ? pbrs[0] : undefined
        
        if (!r.pbr) {
            r.status = 'error'
        } else {
            for (const d of r.details) {
                const pbrft = r.pbr.txidResults.find(t => t.txid === d.txid)
                if (!pbrft) throw new sdk.WERR_INTERNAL(`postBeef service failed to return result for txid ${d.txid}`);
                d.pbrft = pbrft
                if (r.pbr.data)
                    d.data = JSON.stringify(r.pbr.data)
                if (r.pbr.error)
                    d.error = r.pbr.error.code
                // Need to learn how double spend is reported by these services.
                d.status = pbrft.status === 'success' ? 'success' : 'unknown'
                if (d.status !== 'success')
                    // If any txid result fails, the aggregate result is error.
                    r.status = 'error';
                d.req.attempts++
                const note = {
                    what: 'postReqsToNetwork result',
                    name: r.pbr.name,
                    result: d
                }
                d.req.addHistoryNote(note)
            }
        }

        for (const d of r.details) {
            let newReqStatus: sdk.ProvenTxReqStatus | undefined = undefined
            let newTxStatus: sdk.TransactionStatus | undefined = undefined
            // For each req, three outcomes are handled:
            // 1. success: req status from unprocessed(!isDelayed)/sending(isDelayed) to unmined, tx from sending to unproven
            if (d.status === 'success') {
                if (['nosend', 'unprocessed', 'sending', 'unsent'].indexOf(d.req.status) > -1)
                    newReqStatus = 'unmined';
                newTxStatus = 'unproven' // but only if sending
            }
            // 2. doubleSpend: req status to doubleSpend, tx to failed
            else if (d.status === 'doubleSpend') {
                newReqStatus = 'doubleSpend'
                newTxStatus = 'failed'
            }
            // 3. unknown: req status from unprocessed to sending or remains sending, tx remains sending
            else if (d.status === 'unknown') {
                /* no status updates */
            } else {
                throw new sdk.WERR_INTERNAL(`unexpected status ${d.status}`)
            }

            if (newReqStatus) {
                // Only advance the status of req.
                d.req.status = newReqStatus
                d.req.updateStorage(this.storage)
            }
            await d.req.updateStorageDynamicProperties(this.storage)
            if (newTxStatus) {
                const ids = d.req.notify.transactionIds
                if (!ids || ids.length < 1) throw new sdk.WERR_INTERNAL(`req must have at least one transactionId to notify`);
                for (const id of ids) {
                    await this.storage.updateTransactionStatus(newTxStatus, id)
                }
            }
        }

        // Fetch the updated history.
        // log += .req.historyPretty(since, indent + 2)
        return r
    }

    async mergeReqToBeefToShareExternally(req: table.ProvenTxReq, mergeToBeef: bsv.Beef, knownTxids: string[], trx?: sdk.TrxToken) : Promise<void> {
        const { rawTx, inputBEEF: beef } = req;
        if (!rawTx || !beef) throw new sdk.WERR_INTERNAL(`req rawTx and beef must be valid.`);
        mergeToBeef.mergeRawTx(rawTx);
        mergeToBeef.mergeBeef(beef);
        const tx = bsv.Transaction.fromBinary(rawTx);
        for (const input of tx.inputs) {
            if (!input.sourceTXID) throw new sdk.WERR_INTERNAL(`req all transaction inputs must have valid sourceTXID`);
            const txid = input.sourceTXID
            const btx = mergeToBeef.findTxid(txid);
            if (!btx) {
                if (knownTxids && knownTxids.indexOf(txid) > -1)
                    mergeToBeef.mergeTxidOnly(txid);

                else
                    await this.getValidBeefForKnownTxid(txid, mergeToBeef, undefined, knownTxids, trx);
            }
        }
    }
    
    async getValidBeefForKnownTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken) : Promise<bsv.Beef> {
        const beef = await this.getValidBeefForTxid(txid, mergeToBeef, trustSelf, knownTxids, trx)
        if (!beef)
            throw new sdk.WERR_INVALID_PARAMETER('txid', `${txid} is not known to storage.`)
        return beef
    }

    async getValidBeefForTxid(txid: string, mergeToBeef?: bsv.Beef, trustSelf?: sdk.TrustSelf, knownTxids?: string[], trx?: sdk.TrxToken) : Promise<bsv.Beef | undefined> {

        const beef = mergeToBeef || new bsv.Beef()

        const r = await this.storage.getProvenOrRawTx(txid, trx)
        if (r.proven) {
            if (trustSelf === 'known')
                beef.mergeTxidOnly(txid)
            else {
                beef.mergeRawTx(r.proven.rawTx)
                const mp = new entity.ProvenTx(r.proven).getMerklePath()
                beef.mergeBump(mp)
                return beef
            }
        }

        if (r.rawTx && r.inputBEEF) {
            if (trustSelf === 'known')
                beef.mergeTxidOnly(txid)
            else {
                beef.mergeRawTx(r.rawTx)
                beef.mergeBeef(r.inputBEEF)
                const tx = bsv.Transaction.fromBinary(r.rawTx)
                for (const input of tx.inputs) {
                    const btx = beef.findTxid(input.sourceTXID!)
                    if (!btx) {
                        if (knownTxids && knownTxids.indexOf(input.sourceTXID!) > -1)
                            beef.mergeTxidOnly(input.sourceTXID!)
                        else
                            await this.getValidBeefForKnownTxid(input.sourceTXID!, beef, trustSelf, knownTxids, trx)
                    }
                }
                return beef
            }
        }

        return undefined
    }

}
