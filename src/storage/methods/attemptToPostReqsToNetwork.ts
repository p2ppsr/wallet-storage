import * as bsv from '@bsv/sdk'
import { StorageProvider } from "../StorageProvider"
import { entity, sdk } from '../..'
import { PostBeefResultForTxidApi } from './processAction'

/**
 * Attempt to post one or more `ProvenTxReq` with status 'unsent'
 * to the bitcoin network.
 * 
 * @param reqs 
 */
export async function attemptToPostReqsToNetwork(storage: StorageProvider, reqs: entity.ProvenTxReq[], trx?: sdk.TrxToken): Promise<PostReqsToNetworkResult> {

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
        await storage.mergeReqToBeefToShareExternally(rb.api, r.beef, [], trx)
    }

    if (invalid) {
        for (const req of reqs) {
            // batch passes or fails as a whole...prior to post to network attempt.
            req.status = 'invalid'
            await req.updateStorageDynamicProperties(storage)
            r.log += `status set to ${req.status}\n`
        }
        return r;
    }

    // Use cwi-external-services to post the aggregate beef
    // and add the new results to aggregate results.
    const services = await storage.getServices()
    const pbrs = await services.postBeef(r.beef, txids)
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
        }
        await d.req.updateStorageDynamicProperties(storage)
        if (newTxStatus) {
            const ids = d.req.notify.transactionIds
            if (!ids || ids.length < 1) throw new sdk.WERR_INTERNAL(`req must have at least one transactionId to notify`);
            for (const id of ids) {
                await storage.updateTransactionStatus(newTxStatus, id)
            }
        }
    }

    // Fetch the updated history.
    // log += .req.historyPretty(since, indent + 2)
    return r
}


export type PostReqsToNetworkDetailsStatus = 'success' | 'doubleSpend' | 'unknown'

export interface PostReqsToNetworkDetails {
    txid: string
    req: entity.ProvenTxReq
    status: PostReqsToNetworkDetailsStatus
    pbrft: sdk.PostTxResultForTxid
    data?: string
    error?: string
}

export interface PostReqsToNetworkResult {
    status: "success" | "error"
    beef: bsv.Beef
    details: PostReqsToNetworkDetails[]
    pbr?: sdk.PostBeefResult
    log: string
}