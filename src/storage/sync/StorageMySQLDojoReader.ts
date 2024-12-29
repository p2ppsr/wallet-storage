import { asString, sdk, validateSecondsSinceEpoch, verifyOne, verifyOneOrNone, verifyTruthy } from "../..";
import { DBType, KnexMigrations, StorageKnexOptions, table } from ".."

import { Knex } from "knex";
import { StorageSyncReader } from "../StorageSyncReader";
import { MerklePath } from "@bsv/sdk";


export class StorageMySQLDojoReader extends StorageSyncReader {
    knex: Knex
    get dbtype() : DBType | undefined { return this.settings?.dbtype }

    constructor(options: StorageKnexOptions) {
        super(options)
        if (!options.knex) throw new sdk.WERR_INVALID_PARAMETER('options.knex', `valid`)
        this.knex = options.knex
    }

    override async destroy(): Promise<void> {
        await this.knex?.destroy()
    }
    
    override async transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T> {
        if (trx)
            return await scope(trx)
        
        return await this.knex.transaction<T>(async knextrx => {
            const trx = knextrx as sdk.TrxToken
            return await scope(trx)
        })
    }

    toDb(trx?: sdk.TrxToken) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = !trx ? this.knex : <Knex.Transaction<any, any[]>>trx
        this.whenLastAccess = new Date()
        return db
    }

    override async getSettings(trx?: sdk.TrxToken): Promise<table.Settings> {
        const d = verifyOne(await this.toDb(trx)('settings'))
        const r: table.Settings = {
            created_at: d.created_at,
            updated_at: d.updated_at,
            storageIdentityKey: d.dojoIdentityKey,
            storageName: d.dojoName || `${this.chain} Dojo Import`,
            chain: this.chain,
            dbtype: "MySQL",
            maxOutputScript: 256
        }
        if (r.storageName.startsWith('staging') && this.chain !== 'test')
            throw new sdk.WERR_INVALID_PARAMETER('chain', `in aggreement with storage chain ${r.storageName}`)
        this.settings = r
        return r
    }

    getProvenTxsForUserQuery(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        const k = this.toDb(trx)
        let q = k('proven_txs').where(function() {
            this.whereExists(k.select('*').from('transactions').whereRaw(`proven_txs.provenTxId = transactions.provenTxId and transactions.userId = ${userId}`))
        })
        if (paged) {
            q = q.limit(paged.limit)
            q = q.offset(paged.offset || 0)
        }
        if (since) q = q.where('updated_at', '>=', since)
        return q
    }
    async getProvenTxsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.ProvenTx[]> {
        const q = this.getProvenTxsForUserQuery(userId, since, paged, trx)
        const ds = await q
        const rs: table.ProvenTx[] = []
        for (const d of ds) {

            const mp = convertProofToMerklePath(d.txid, {
                index: d.index,
                nodes: deserializeTscMerkleProofNodes(d.nodes),
                height: d.height
            })

            const r: table.ProvenTx = {
                created_at: d.created_at,
                updated_at: d.updated_at,
                provenTxId: d.provenTxId,
                txid: d.txid,
                height: d.height,
                index: d.index,
                merklePath: mp.toBinary(),
                rawTx: Array.from(d.rawTx),
                blockHash: asString(d.blockHash),
                merkleRoot: asString(d.merkleRoot)
            }

            rs.push(r)
        }
        return rs
    }

    getProvenTxReqsForUserQuery(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        const k = this.toDb(trx)
        let q = k('proven_tx_reqs').where(function() {
            this.whereExists(k.select('*').from('transactions').whereRaw(`proven_tx_reqs.txid = transactions.txid and transactions.userId = ${userId}`))
        })
        if (paged) {
            q = q.limit(paged.limit)
            q = q.offset(paged.offset || 0)
        }
        if (since) q = q.where('updated_at', '>=', since)
        return q
    }

    async getProvenTxReqsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.ProvenTxReq[]> {
        const q = this.getProvenTxReqsForUserQuery(userId, since, paged, trx)
        const ds = await q
        const rs: table.ProvenTxReq[] = []
        for (const d of ds) {
            const r: table.ProvenTxReq = {
                created_at: d.created_at,
                updated_at: d.updated_at,
                provenTxReqId: d.provenTxReqId,
                provenTxId: d.provenTxId,
                txid: d.txid,
                rawTx: Array.from(d.rawTx),
                status: convertReqStatus(d.status),
                attempts: d.attempts,
                notified: d.notified,
                history: d.history,
                notify: d.notify,
                inputBEEF: d.beef ? d.beef : undefined
            }

            rs.push(r)
        }
        return rs
    }

    getTxLabelMapsForUserQuery(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        const k = this.toDb(trx)
        let q = k('tx_labels_map')
            .whereExists(k.select('*').from('tx_labels').whereRaw(`tx_labels.txLabelId = tx_labels_map.txLabelId and tx_labels.userId = ${userId}`))
        if (since) q = q.where('updated_at', '>=', this.validateDateForWhere(since))
        if (paged) {
            q = q.limit(paged.limit)
            q = q.offset(paged.offset || 0)
        }
        return q
    }

    async getTxLabelMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.TxLabelMap[]> {
        const q = this.getTxLabelMapsForUserQuery(userId, since, paged, trx)
        const ds = await q
        const rs: table.TxLabelMap[] = []
        for (const d of ds) {
            const r: table.TxLabelMap = {
                created_at: d.created_at,
                updated_at: d.updated_at,
                txLabelId: d.txLabelId,
                transactionId: d.transactionId,
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return rs
    }

    getOutputTagMapsForUserQuery(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        const k = this.toDb(trx)
        let q = k('output_tags_map')
            .whereExists(k.select('*').from('output_tags').whereRaw(`output_tags.outputTagId = output_tags_map.outputTagId and output_tags.userId = ${userId}`))
        if (since) q = q.where('updated_at', '>=', this.validateDateForWhere(since))
        if (paged) {
            q = q.limit(paged.limit)
            q = q.offset(paged.offset || 0)
        }
        return q
    }

    async getOutputTagMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputTagMap[]> {
        const q = this.getOutputTagMapsForUserQuery(userId, since, paged, trx)
        const ds = await q
        const rs: table.OutputTagMap[] = []
        for (const d of ds) {
            const r: table.OutputTagMap = {
                created_at: d.created_at,
                updated_at: d.updated_at,
                outputId: d.outputId,
                outputTagId: d.outputTagId,
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return rs
    }

    validateDateForWhere(date: Date | string | number) : Date | string | number {
        if (!this.dbtype) throw new sdk.WERR_INTERNAL('must call verifyReadyForDatabaseAccess first')
        if (typeof date === 'number') date = validateSecondsSinceEpoch(date)
        const vdate = verifyTruthy(this.validateDate(date))
        let r: Date | string | number
        switch (this.dbtype) {
            case 'MySQL':
                r = vdate
                break
            case 'SQLite':
                r = vdate.toISOString()
                break
            default: throw new sdk.WERR_INTERNAL(`Invalid dateScheme ${this.dbtype}`)
        }
        return r
    }
    
    validateDate(date: Date | string | number) : Date {
        let r: Date
        if (date instanceof Date)
            r = date
        else
            r = new Date(date)
        return r
    }

    setupQuery<T extends object>(table: string, partial?: Partial<T>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken, count?: boolean)
    : Knex.QueryBuilder
    {
        let q = this.toDb(trx)<T>(table)
        if (partial && Object.keys(partial).length > 0) q.where(partial)
        if (since) q.where('updated_at', '>=', this.validateDateForWhere(since));
        if (paged) {
            q.limit(paged.limit)
            q.offset(paged.offset || 0)
        }
        return q
    }

    findOutputBasketsQuery(partial: Partial<table.OutputBasket>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('output_baskets', partial, since, paged, trx)
    }
    findTxLabelsQuery(partial: Partial<table.TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('tx_labels', partial, since, paged, trx)
    }
    findOutputTagsQuery(partial: Partial<table.OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('output_tags', partial, since, paged, trx)
    }
    findTransactionsQuery(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken, count?: boolean) : Knex.QueryBuilder {
        if (partial.rawTx) throw new sdk.WERR_INVALID_PARAMETER('partial.rawTx', `undefined. Transactions may not be found by rawTx value.`);
        if (partial.inputBEEF) throw new sdk.WERR_INVALID_PARAMETER('partial.inputBEEF', `undefined. Transactions may not be found by inputBEEF value.`);
        const q = this.setupQuery('transactions', partial, since, paged, trx, count)
        if (status && status.length > 0) q.whereIn('status', status);
        if (noRawTx && !count) {
            const columns = table.transactionColumnsWithoutRawTx.map(c => `transactions.${c}`)
            q.select(columns)
        }
        return q
    }
    findCommissionsQuery(partial: Partial<table.Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        if (partial.lockingScript) throw new sdk.WERR_INVALID_PARAMETER('partial.lockingScript', `undefined. Commissions may not be found by lockingScript value.`);
        return this.setupQuery('commissions', partial, since, paged, trx)
    }
    findOutputsQuery(partial: Partial<table.Output>, noScript?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken, count?: boolean) : Knex.QueryBuilder { 
        if (partial.lockingScript) throw new sdk.WERR_INVALID_PARAMETER('partial.lockingScript', `undefined. Outputs may not be found by lockingScript value.`);
        const q = this.setupQuery('outputs', partial, since, paged, trx, count)
        if (noScript && !count) {
            const columns = table.outputColumnsWithoutLockingScript.map(c => `outputs.${c}`)
            q.select(columns)
        }
        return q
    }
    findCertificatesQuery(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        const q = this.setupQuery('certificates', partial, since, paged, trx)
        if (certifiers && certifiers.length > 0) q.whereIn('certifier', certifiers);
        if (types && types.length > 0) q.whereIn('type', types);
        return q
    }




}

function deserializeTscMerkleProofNodes(nodes: Buffer): string[] {
    if (!Buffer.isBuffer(nodes)) throw new sdk.WERR_INTERNAL('Buffer or string expected.')
    const buffer = nodes
    const ns: string[] = []
    for (let offset = 0; offset < buffer.length;) {
        const flag = buffer[offset++]
        if (flag === 1)
            ns.push('*')
        else if (flag === 0) {
            ns.push(asString(buffer.subarray(offset, offset + 32)))
            offset += 32
        } else {
            throw new sdk.WERR_BAD_REQUEST(`node type byte ${flag} is not supported here.`)
        }
    }
    return ns
}

interface TscMerkleProofApi {
  height: number
  index: number
  nodes: string[]
}

function convertProofToMerklePath(txid: string, proof: TscMerkleProofApi): MerklePath {
    const blockHeight = proof.height
    const treeHeight = proof.nodes.length
    type Leaf = {
        offset: number
        hash?: string
        txid?: boolean
        duplicate?: boolean
    }
    const path: Leaf[][] = Array(treeHeight).fill(0).map(() => ([]))
    let index = proof.index
    for (let level = 0; level < treeHeight; level++) {
        const node = proof.nodes[level]
        const isOdd = index % 2 === 1
        const offset = isOdd ? index - 1 : index + 1
        const leaf: Leaf = { offset }
        if (node === '*' || (level === 0 && node === txid)) {
            leaf.duplicate = true
        } else {
            leaf.hash = node
        }
        path[level].push(leaf)
        if (level === 0) {
            const txidLeaf: Leaf = {
                offset: proof.index,
                hash: txid,
                txid: true,
            }
            if (isOdd) {
                path[0].push(txidLeaf)
            } else {
                path[0].unshift(txidLeaf)
            }
        }
        index = index >> 1
    }
    return new MerklePath(blockHeight, path)
}

type DojoProvenTxReqStatusApi =
   'sending' | 'unsent' | 'nosend' | 'unknown' | 'nonfinal' | 'unprocessed' |
   'unmined' | 'callback' | 'unconfirmed' |
   'completed' | 'invalid' | 'doubleSpend'

function convertReqStatus(status: DojoProvenTxReqStatusApi): sdk.ProvenTxReqStatus {
    return status
}

