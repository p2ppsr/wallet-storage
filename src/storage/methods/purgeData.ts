import { Knex } from "knex"
import { StorageKnex, table } from ".."
import { sdk } from "../.."
import { unbasketOutput } from "@babbage/sdk-ts"

export async function purgeData(dsk: StorageKnex, params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults> {
    const r: sdk.PurgeResults = { count: 0, log: ''}
    const defaultAge = 1000 * 60 * 60 * 24 * 14

    const runPurgeQuery = async <T extends object>(pq: PurgeQuery) : Promise<void> => {
        try {
            pq.sql = pq.q.toString()
            const count = await pq.q
            if (count > 0) {
                r.count += count
                r.log += `${count} ${pq.log}\n`
            }
        } catch (eu: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const e = sdk.WalletError.fromUnknown(eu)
            throw eu
        }
    }

    if (params.purgeCompleted) {
        const age = params.purgeCompletedAge || defaultAge
        const before = toSqlWhereDate(new Date(Date.now() - age))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const qs: PurgeQuery[] = []

        // select * from transactions where updated_at < '2024-08-20' and status = 'completed' and not provenTxId is null and (not truncatedExternalInputs is null or not beef is null or not rawTransaction is null)
        qs.push({
            log: 'conpleted transactions purged of transient data',
            q: dsk.toDb(trx)('transactions')
                .update({
                    inputBEEF: null,
                    rawTx: null
                })
                .where('updated_at', '<', before)
                .where('status', 'completed')
                .whereNotNull('provenTxId')
                .where(function () {
                    this.orWhereNotNull('inputBEEF')
                    this.orWhereNotNull('rawTx')
                })
        })

        const completedReqs = await dsk.toDb(trx)<{ provenTxReqId: number }>('proven_tx_reqs')
        .select("provenTxReqId")
        .where('updated_at', '<', before)
        .where('status', 'completed')
        .whereNotNull('provenTxId')
        .where('notified', 1)
        const completedReqIds = completedReqs.map(o => o.provenTxReqId)

        if (completedReqIds.length > 0) {
            qs.push({
                log: 'completed proven_tx_reqs deleted',
                q: dsk.toDb(trx)('proven_tx_reqs').whereIn('provenTxReqId', completedReqIds).delete()
            })
        }

        for (const q of qs) await runPurgeQuery(q)
    }

    if (params.purgeFailed) {
        const age = params.purgeFailedAge || defaultAge
        const before = toSqlWhereDate(new Date(Date.now() - age))

        const qs: PurgeQuery[] = []

        const failedTxsQ = dsk.toDb(trx)<{ transactionId: number }>('transactions')
            .select("transactionId")
            .where('updated_at', '<', before)
            .where('status', 'failed')
        const txs = await failedTxsQ
        const failedTxIds = txs.map(tx => tx.transactionId)

        await deleteTransactions(failedTxIds, qs, 'failed', true)

        const invalidReqs = await dsk.toDb(trx)<{ provenTxReqId: number }>('proven_tx_reqs')
        .select("provenTxReqId")
        .where('updated_at', '<', before)
        .where('status', 'invalid')
        const invalidReqIds = invalidReqs.map(o => o.provenTxReqId)
        if (invalidReqIds.length > 0) qs.push({
            log: 'invalid proven_tx_reqs deleted',
            q: dsk.toDb(trx)('proven_tx_reqs') .whereIn('provenTxReqId', invalidReqIds) .delete()
        })


        const doubleSpendReqs = await dsk.toDb(trx)<{ provenTxReqId: number }>('proven_tx_reqs')
        .select("provenTxReqId")
        .where('updated_at', '<', before)
        .where('status', 'doubleSpend')
        const doubleSpendReqIds = doubleSpendReqs.map(o => o.provenTxReqId)
        if (doubleSpendReqIds.length > 0) qs.push({
            log: 'doubleSpend proven_tx_reqs deleted',
            q: dsk.toDb(trx)('proven_tx_reqs') .whereIn('provenTxReqId', doubleSpendReqIds) .delete()
        })

        for (const q of qs) await runPurgeQuery(q)
    }

    if (params.purgeSpent) {
        const age = params.purgeSpentAge || defaultAge
        const before = toSqlWhereDate(new Date(Date.now() - age))

        let qs: PurgeQuery[] = []

        const spentTxsQ = dsk.toDb(trx)<{ transactionId: number }>('transactions')
            .select("transactionId")
            .where('updated_at', '<', before)
            .where('status', 'completed')
            .whereRaw(`not exists(select outputId from outputs as o where o.transactionId = transactions.transactionId and o.spendable = 1)`)
        const txs = await spentTxsQ
        const spentTxIds = txs.map(tx => tx.transactionId)

        if (spentTxIds.length > 0) {
            const update: Partial<table.Output> = { spentBy: undefined }
            qs.push({
                log: 'spent outputs no longer tracked by spentBy',
                q: dsk.toDb(trx)<table.Output>('outputs').update(dsk.validatePartialForUpdate(update, undefined, ['spendable']))
                    .where('spendable', false)
                    .whereIn('spentBy', spentTxIds)
            })

            await deleteTransactions(spentTxIds, qs, 'spent', false)

            for (const q of qs) await runPurgeQuery(q);

        }

    }

    // Delete proven_txs no longer referenced by remaining transactions.
    const qs: PurgeQuery[] = []
    qs.push({
        log: 'orphan proven_txs deleted',
        q: dsk.toDb(trx)('proven_txs')
            .whereRaw(`not exists(select * from transactions as t where t.txid = proven_txs.txid or t.provenTxId = proven_txs.provenTxId)`)
            .whereRaw(`not exists(select * from proven_tx_reqs as r where r.txid = proven_txs.txid or r.provenTxId = proven_txs.provenTxId)`)
            .delete()
    })
    for (const q of qs) await runPurgeQuery(q);

    return r

    async function deleteTransactions(transactionIds: number[], qs: PurgeQuery[], reason: string, markNotSpentBy: boolean) {
        if (transactionIds.length > 0) {
            const outputs = await dsk.toDb(trx)<{ outputId: number} >('outputs')
                .select("outputId")
                .whereIn('transactionId', transactionIds)
            const outputIds = outputs.map(o => o.outputId)
            if (outputIds.length > 0) {
                qs.push({
                    log: `${reason} output_tags_map deleted`,
                    q: dsk.toDb(trx)<table.OutputTagMap>('output_tags_map').whereIn("outputId", outputIds).delete()
                })
                qs.push({
                    log: `${reason} outputs deleted`,
                    q: dsk.toDb(trx)<table.Output>('outputs').whereIn("outputId", outputIds).delete()
                })
            }

            qs.push({
                log: `${reason} tx_labels_map deleted`,
                q: dsk.toDb(trx)<table.TxLabelMap>('tx_labels_map').whereIn("transactionId", transactionIds).delete()
            })

            qs.push({
                log: `${reason} commissions deleted`,
                q: dsk.toDb(trx)<table.Commission>('commissions').whereIn('transactionId', transactionIds).delete()
            })

            if (markNotSpentBy) {
                qs.push({
                    log: 'unspent outputs updated to spendable',
                    q: dsk.toDb(trx)<table.Output>('outputs').update({ spendable: true, spentBy: undefined }).whereIn('spentBy', transactionIds)
                })
            }

            qs.push({
                log: `${reason} transactions deleted`,
                q: dsk.toDb(trx)<table.Transaction>('transactions').whereIn('transactionId', transactionIds).delete()
            })
        }
    }
}

interface PurgeQuery {
    q: Knex.QueryBuilder<any, number>
    sql?: string
    log: string
}

function toSqlWhereDate(d: Date) : string {
    let s = d.toISOString()
    s = s.replace('T', ' ')
    s = s.replace('Z', '')
    return s
}