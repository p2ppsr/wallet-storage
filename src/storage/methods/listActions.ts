import * as bsv from "@bsv/sdk"
import { StorageKnex, table } from ".."
import { asString, sdk, verifyOne } from "../.."

export async function listActions(
    storage: StorageKnex,
    auth: sdk.AuthId,
    vargs: sdk.ValidListActionsArgs
)
: Promise<bsv.ListActionsResult>
{
    const limit = vargs.limit
    const offset = vargs.offset

    const k = storage.toDb(undefined)

    const r: bsv.ListActionsResult = {
        totalActions: 0,
        actions: []
    }

    let labelIds: number[] = []
    if (vargs.labels.length > 0) {
        const q = k<table.TxLabel>('tx_labels')
            .where({
                'userId': auth.userId,
                'isDeleted': false
            })
            .whereNotNull('txLabelId')
            .whereIn('label', vargs.labels)
            .select('txLabelId')
        const r = await q
        labelIds = r.map(r => r.txLabelId!)
    }

    const isQueryModeAll = vargs.labelQueryMode === 'all'
    if (isQueryModeAll && labelIds.length < vargs.labels.length)
        return r

    if (labelIds.length === 0 || isQueryModeAll && labelIds.length < vargs.labels.length)
        // No actions will match if a required label doesn't exist yet...
        return r

    const columns: string[] = ['transactionId', 'txid', 'satoshis', 'status', 'isOutgoing', 'description', 'version', 'lockTime']
    const stati: string[] = ['completed', 'unprocessed', 'sending', 'unproven', 'unsigned', 'nosend', 'nonfinal']

    const noLabels = labelIds.length === 0

    const makeWithLabelsQueries = () => {
        const cteq = k.raw(`
            SELECT ${columns.map(c => 't.' + c).join(',')}, 
                    (SELECT COUNT(*) 
                    FROM tx_labels_map AS m 
                    WHERE m.transactionId = t.transactionId 
                    AND m.txLabelId IN (${labelIds.join(',')}) 
                    ) AS lc
            FROM transactions AS t
            WHERE t.userId = ${auth.userId}
            AND t.status in (${stati.map(s => `'${s}'`).join(',')})
            `);

        const q = k.with('tlc', cteq)
        q.from('tlc')
        if (isQueryModeAll)
            q.where('lc', labelIds.length)
        else
            q.where('lc', '>', 0)
        const qcount = q.clone()
        q.select(columns)
        qcount.count('transactionId as total')
        return { q, qcount }
    }

    const makeWithoutLabelsQueries = () => {
        const q = k('transactions').where('userId', auth.userId).whereIn('status', stati)
        const qcount = q.clone().count('transactionId as total')
        return { q, qcount }
    }

    const { q, qcount } = noLabels
        ? makeWithoutLabelsQueries()
        : makeWithLabelsQueries()

    q.limit(limit).offset(offset).orderBy('transactionId', 'asc')

    const txs: Partial<table.Transaction>[] = await q

    if (!limit || txs.length < limit)
        r.totalActions = txs.length
    else {
        const total = verifyOne(await qcount)['total']
        r.totalActions = Number(total)
    }

    for (const tx of txs) {
        const wtx: bsv.WalletAction = {
            txid: tx.txid || '',
            satoshis: tx.satoshis || 0,
            status: <bsv.ActionStatus>tx.status!,
            isOutgoing: !!tx.isOutgoing,
            description: tx.description || '',
            version: tx.version || 0,
            lockTime: tx.lockTime || 0
        }
        r.actions.push(wtx)
    }

    if (vargs.includeLabels || vargs.includeInputs || vargs.includeOutputs) {

        await Promise.all(txs.map(async (tx, i) => {
        //let i = -1
        //for (const tx of txs) {
        //    i++
            const action = r.actions[i]
            if (vargs.includeLabels) {
                action.labels = (await storage.getLabelsForTransactionId(tx.transactionId)).map(l => l.label)
            }
            if (vargs.includeOutputs) {
                const outputs: table.OutputX[] = await storage.findOutputs({ partial: { transactionId: tx.transactionId }, noScript: !vargs.includeOutputLockingScripts })
                action.outputs = []
                for (const o of outputs) {
                    await storage.extendOutput(o, true, true)
                    const wo: bsv.WalletActionOutput = {
                        satoshis: o.satoshis || 0,
                        spendable: !!o.spendable,
                        tags: o.tags?.map(t => t.tag) || [],
                        outputIndex: Number(o.vout),
                        outputDescription: o.outputDescription || '',
                        basket: o.basket?.name || '',
                    }
                    if (vargs.includeOutputLockingScripts)
                        wo.lockingScript = asString(o.lockingScript || [])
                    action.outputs.push(wo)
                }
            }
            if (vargs.includeInputs) {
                const inputs: table.OutputX[] = await storage.findOutputs({ partial: { spentBy: tx.transactionId }, noScript: !vargs.includeInputSourceLockingScripts })
                action.inputs = []
                if (inputs.length > 0) {
                    const rawTx = await storage.getRawTxOfKnownValidTransaction(tx.txid)
                    let bsvTx: bsv.Transaction | undefined = undefined
                    if (rawTx) {
                        bsvTx = bsv.Transaction.fromBinary(rawTx)
                    }
                    for (const o of inputs) {
                        await storage.extendOutput(o, true, true)
                        const input = bsvTx?.inputs.find(v =>
                            v.sourceTXID === o.txid
                            && v.sourceOutputIndex === o.vout
                        )
                        const wo: bsv.WalletActionInput = {
                            sourceOutpoint: `${o.txid}.${o.vout}`,
                            sourceSatoshis: o.satoshis || 0,
                            inputDescription: o.outputDescription || '',
                            sequenceNumber: input?.sequence || 0
                        }
                        action.inputs.push(wo)
                        if (vargs.includeInputSourceLockingScripts) {
                            wo.sourceLockingScript = asString(o.lockingScript || [])
                        }
                        if (vargs.includeInputUnlockingScripts) {
                            wo.unlockingScript = input?.unlockingScript?.toHex()
                        }
                    }
                }
            }
        //}
        }))
    }

    return r
}
