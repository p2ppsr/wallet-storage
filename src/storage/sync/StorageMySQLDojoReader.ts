import * as bsv from '@bsv/sdk'
import {
    asArray,
    asString,
    convertProofToMerklePath,
    deserializeTscMerkleProofNodes,
    randomBytesBase64,
    sdk,
    verifyHexString,
    verifyId,
    verifyInteger,
    verifyOne,
    verifyOptionalHexString,
    verifyTruthy
} from "../..";
import { DBType, StorageKnexOptions, StorageSyncReader, table } from ".."

import { Knex } from "knex";
import { MerklePath } from "@bsv/sdk";
import { isHexString } from '../../sdk';

export interface StorageMySQLDojoReaderOptions extends sdk.StorageSyncReaderOptions {
    chain: sdk.Chain
    /**
     * Knex database interface initialized with valid connection configuration.
     */
    knex: Knex
}


export class StorageMySQLDojoReader extends StorageSyncReader {
    knex: Knex

    constructor(options: StorageMySQLDojoReaderOptions) {
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
            created_at: verifyTruthy(d.created_at),
            updated_at: verifyTruthy(d.updated_at),
            storageIdentityKey: verifyHexString(d.dojoIdentityKey),
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

    setupQuery<T extends object>(table: string, args: sdk.FindPartialSincePagedArgs<T>)
    : Knex.QueryBuilder
    {
        let q = this.toDb(args.trx)<T>(table)
        if (args.partial && Object.keys(args.partial).length > 0) q.where(args.partial)
        if (args.since) q.where('updated_at', '>=', this.validateDateForWhere(args.since));
        if (args.paged) {
            q.limit(args.paged.limit)
            q.offset(args.paged.offset || 0)
        }
        return q
    }

    findOutputBasketsQuery(args: sdk.FindOutputBasketsArgs) : Knex.QueryBuilder {
        return this.setupQuery('output_baskets', args)
    }
    async findOutputBaskets(args: sdk.FindOutputBasketsArgs) : Promise<table.OutputBasket[]> {
        const q = this.findOutputBasketsQuery(args)
        const ds = await q
        const rs: table.OutputBasket[] = []
        for (const d of ds) {
            const r: table.OutputBasket = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                basketId: verifyInteger(d.basketId),
                userId: verifyInteger(d.userId),
                name: verifyTruthy(d.name).trim().toLowerCase(),
                numberOfDesiredUTXOs: verifyInteger(d.numberOfDesiredUTXOs),
                minimumDesiredUTXOValue: verifyInteger(d.minimumDesiredUTXOValue),
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isDeleted'])
    }
    findTxLabelsQuery(args: sdk.FindTxLabelsArgs) : Knex.QueryBuilder {
        return this.setupQuery('tx_labels', args)
    }
    async findTxLabels(args: sdk.FindTxLabelsArgs) : Promise<table.TxLabel[]> {
        const q = this.findTxLabelsQuery(args)
        const ds = await q
        const rs: table.TxLabel[] = []
        for (const d of ds) {
            const r: table.TxLabel = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                txLabelId: verifyInteger(d.txLabelId),
                userId: verifyInteger(d.userId),
                label: verifyTruthy(d.label).trim().toLowerCase(),
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isDeleted'])
    }
    findOutputTagsQuery(args: sdk.FindOutputTagsArgs) : Knex.QueryBuilder {
        return this.setupQuery('output_tags', args)
    }
    async findOutputTags(args: sdk.FindOutputTagsArgs) : Promise<table.OutputTag[]> {
        const q = this.findOutputTagsQuery(args)
        const ds = await q
        const rs: table.OutputTag[] = []
        for (const d of ds) {
            const r: table.OutputTag = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                outputTagId: verifyInteger(d.outputTagId),
                userId: verifyInteger(d.userId),
                tag: verifyTruthy(d.tag).trim().toLowerCase(),
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isDeleted'])
    }
    findTransactionsQuery(args: sdk.FindTransactionsArgs, count?: boolean) : Knex.QueryBuilder {
        if (args.partial.rawTx) throw new sdk.WERR_INVALID_PARAMETER('args.partial.rawTx', `undefined. Transactions may not be found by rawTx value.`);
        if (args.partial.inputBEEF) throw new sdk.WERR_INVALID_PARAMETER('args.partial.inputBEEF', `undefined. Transactions may not be found by inputBEEF value.`);
        const q = this.setupQuery('transactions', args)
        if (args.status && args.status.length > 0) q.whereIn('status', args.status);
        if (args.noRawTx && !count) {
            const columns = table.transactionColumnsWithoutRawTx.map(c => `transactions.${c}`)
            q.select(columns)
        }
        return q
    }
    async findTransactions(args: sdk.FindTransactionsArgs) : Promise<table.Transaction[]> {
        const q = this.findTransactionsQuery(args)
        const ds = await q
        const rs: table.Transaction[] = []
        for (const d of ds) {
            const r: table.Transaction = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                transactionId: verifyInteger(d.transactionId),
                userId: verifyInteger(d.userId),
                status: verifyTruthy(convertTxStatus(d.status)),
                reference: forceToBase64(d.referenceNumber),
                isOutgoing: !!d.isOutgoing,
                satoshis: verifyInteger(d.amount),
                description: verifyTruthy(d.note || ''),
                provenTxId: verifyOptionalInteger(d.provenTxId),
                version: verifyOptionalInteger(d.version),
                lockTime: verifyOptionalInteger(d.lockTime),
                txid: nullToUndefined(d.txid),
                inputBEEF: d.beef ? Array.from(d.beef) : undefined,
                rawTx: d.rawTransaction ? Array.from(d.rawTransaction) : undefined,
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isOutgoing'])
    }
    findCommissionsQuery(args: sdk.FindCommissionsArgs) : Knex.QueryBuilder {
        if (args.partial.lockingScript) throw new sdk.WERR_INVALID_PARAMETER('args.partial.lockingScript', `undefined. Commissions may not be found by lockingScript value.`);
        return this.setupQuery('commissions', args)
    }
    async findCommissions(args: sdk.FindCommissionsArgs) : Promise<table.Commission[]> {
        const q = this.findCommissionsQuery(args)
        const ds = await q
        const rs: table.Commission[] = []
        for (const d of ds) {
            const r: table.Commission = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                commissionId: verifyInteger(d.commissionId),
                userId: verifyInteger(d.userId),
                transactionId: verifyInteger(d.transactionId),
                satoshis: verifyInteger(d.satoshis),
                keyOffset: verifyTruthy(d.keyOffset).trim(),
                isRedeemed: !!d.isRedeemed,
                lockingScript: Array.from(verifyTruthy(d.outputScript))
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isRedeemed'])
    }
    limitString(s: string, maxLen: number) : string {
        if (s.length > maxLen) s = s.slice(0, maxLen);
        return s
    }
    findOutputsQuery(args: sdk.FindOutputsArgs, count?: boolean) : Knex.QueryBuilder { 
        if (args.partial.lockingScript) throw new sdk.WERR_INVALID_PARAMETER('args.partial.lockingScript', `undefined. Outputs may not be found by lockingScript value.`);
        const q = this.setupQuery('outputs', args)
        if (args.noScript && !count) {
            const columns = table.outputColumnsWithoutLockingScript.map(c => `outputs.${c}`)
            q.select(columns)
        }
        return q
    }
    async findOutputs(args: sdk.FindOutputsArgs) : Promise<table.Output[]> {
        const q = this.findOutputsQuery(args)
        const ds = await q
        const rs: table.Output[] = []
        for (const d of ds) {
            const r: table.Output = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                outputId: verifyInteger(d.outputId),
                userId: verifyInteger(d.userId),
                transactionId: verifyInteger(d.transactionId),
                basketId: verifyOptionalInteger(d.basketId),
                spendable: !!d.spendable,
                change: d.providedBy !== 'you' && d.purpose === 'change',
                outputDescription: (d.description || '').trim(),
                vout: verifyInteger(d.vout),
                satoshis: verifyInteger(d.amount),
                providedBy: verifyTruthy(d.providedBy || '').trim().toLowerCase().replace('dojo', 'storage'),
                purpose: verifyTruthy(d.purpose || '').trim().toLowerCase(),
                type: verifyTruthy(d.type).trim(),
                txid: nullToUndefined(d.txid),
                senderIdentityKey: verifyOptionalHexString(d.senderIdentityKey),
                derivationPrefix: nullToUndefined(d.derivationPrefix),
                derivationSuffix: nullToUndefined(d.derivationSuffix),
                customInstructions: nullToUndefined(d.customInstruction),
                spentBy: verifyOptionalInteger(d.spentBy),
                sequenceNumber: undefined,
                spendingDescription: nullToUndefined(d.spendingDescription),
                scriptLength: verifyOptionalInteger(d.scriptLength),
                scriptOffset: verifyOptionalInteger(d.scriptOffset),
                lockingScript: d.outputScript ? Array.from(d.outputScript) : undefined,
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['spendable', 'change'])
    }
    findCertificatesQuery(args: sdk.FindCertificatesArgs) : Knex.QueryBuilder {
        const q = this.setupQuery('certificates', args)
        if (args.certifiers && args.certifiers.length > 0) q.whereIn('certifier', args.certifiers);
        if (args.types && args.types.length > 0) q.whereIn('type', args.types);
        return q
    }
    async findCertificates(args: sdk.FindCertificatesArgs) : Promise<table.Certificate[]> {
        const q = this.findCertificatesQuery(args)
        const ds = await q
        const rs: table.Certificate[] = []
        for (const d of ds) {
            const r: table.Certificate = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                certificateId: verifyInteger(d.certificateId),
                userId: verifyInteger(d.userId),
                type: verifyTruthy(d.type).trim(), // base64
                serialNumber: verifyTruthy(d.serialNumber).trim(), // base64
                certifier: verifyHexString(d.certifier),
                subject: verifyHexString(d.subject),
                revocationOutpoint: verifyTruthy(d.revocationOutpoint).trim().toLowerCase(),
                signature: verifyHexString(d.signature),
                verifier: verifyOptionalHexString(d.validationKey),
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isDeleted'])
    }
    findCertificateFieldsQuery(args: sdk.FindCertificateFieldsArgs) : Knex.QueryBuilder {
        return this.setupQuery('certificate_fields', args)
    }
    async findCertificateFields(args: sdk.FindCertificateFieldsArgs) : Promise<table.CertificateField[]> {
        const q = this.findCertificateFieldsQuery(args)
        const ds = await q
        const rs: table.CertificateField[] = []
        for (const d of ds) {
            const r: table.CertificateField = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                userId: verifyInteger(d.userId),
                certificateId: verifyInteger(d.certificateId),
                fieldName: verifyTruthy(d.fieldName).trim().toLowerCase(),
                fieldValue: verifyTruthy(d.fieldValue).trim(), // base64
                masterKey: verifyTruthy(d.masterKey).trim(), // base64
            }
            rs.push(r)
        }
        return this.validateEntities(rs)
    }
    override async findSyncStates(args: sdk.FindSyncStatesArgs): Promise<table.SyncState[]> {
        const q = this.setupQuery('sync_state', args)
        const ds = await q
        const rs: table.SyncState[] = []
        for (const d of ds) {
            const r: table.SyncState = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                syncStateId: verifyInteger(d.syncStateId),
                userId: verifyInteger(d.userId),
                storageIdentityKey: verifyHexString(d.storageIdentityKey),
                storageName: verifyTruthy(d.storageName || 'dojo importer').trim().toLowerCase(),
                status: convertSyncStatus(d.status),
                init: !!d.init,
                refNum: verifyTruthy(d.refNum),
                syncMap: verifyTruthy(d.syncMap),
                when: d.when ? this.validateDate(d.when) : undefined,
                satoshis: verifyOptionalInteger(d.total),
                errorLocal: nullToUndefined(d.errorLocal),
                errorOther: nullToUndefined(d.errorOther),
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['init'])
    }
    override async findUsers(args: sdk.FindUsersArgs): Promise<table.User[]> {
        const q = this.setupQuery('users', args)
        const ds = await q
        const rs: table.User[] = []
        for (const d of ds) {
            const r: table.User = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                userId: verifyId(d.userId),
                identityKey: verifyTruthy(d.identityKey)
            }
            rs.push(r)
        }
        return this.validateEntities(rs)
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
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                provenTxId: verifyInteger(d.provenTxId),
                txid: verifyHexString(d.txid),
                height: verifyInteger(d.height),
                index: verifyInteger(d.index),
                merklePath: mp.toBinary(),
                rawTx: Array.from(verifyTruthy(d.rawTx)),
                blockHash: verifyHexString(asString(verifyTruthy(d.blockHash))),
                merkleRoot: verifyHexString(asString(verifyTruthy(d.merkleRoot))),
            }

            rs.push(r)
        }
        return this.validateEntities(rs)
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
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                provenTxReqId: verifyInteger(d.provenTxReqId),
                provenTxId: verifyOptionalInteger(d.provenTxId),
                txid: verifyTruthy(d.txid),
                rawTx: Array.from(verifyTruthy(d.rawTx)),
                status: verifyTruthy(convertReqStatus(d.status)),
                attempts: verifyInteger(d.attempts),
                notified: !!d.notified,
                history: verifyTruthy(d.history),
                notify: verifyTruthy(d.notify),
                inputBEEF: d.beef ? Array.from(d.beef) : undefined
            }

            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['notified'])
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
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                txLabelId: verifyInteger(d.txLabelId),
                transactionId: verifyInteger(d.transactionId),
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isDeleted'])
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
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                outputId: verifyInteger(d.outputId),
                outputTagId: verifyInteger(d.outputTagId),
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isDeleted'])
    }
}

type DojoProvenTxReqStatusApi =
   'sending' | 'unsent' | 'nosend' | 'unknown' | 'nonfinal' | 'unprocessed' |
   'unmined' | 'callback' | 'unconfirmed' |
   'completed' | 'invalid' | 'doubleSpend'

function convertReqStatus(status: DojoProvenTxReqStatusApi): sdk.ProvenTxReqStatus {
    return status
}

type DojoTransactionStatusApi =
    'completed' | 'failed' | 'unprocessed' | 'sending' | 'unproven' | 'unsigned' | 'nosend'

//type TransactionStatus =
//   'completed' | 'failed' | 'unprocessed' | 'sending' | 'unproven' | 'unsigned' | 'nosend'

function convertTxStatus(status: DojoTransactionStatusApi): sdk.TransactionStatus {
    return status
}

function nullToUndefined<T>(v: T) : T | undefined {
    if (v === null) return undefined;
    if (typeof v === 'string') return v.trim() as T;
    return v
}

function verifyOptionalInteger(v: number | null | undefined): number | undefined {
    if (v === undefined || v === null) return undefined
    if (typeof v !== 'number' || !Number.isInteger(v)) throw new sdk.WERR_INTERNAL('An integer is required.');
    return v
}

type DojoSyncStatus = 'success' | 'error' | 'identified' | 'updated' | 'unknown'

function convertSyncStatus(status: DojoSyncStatus) : sdk.SyncStatus {
    return status
}

function forceToBase64(s?: string | null) : string {
    if (!s) return randomBytesBase64(12);
    if (isHexString(s)) return bsv.Utils.toBase64(asArray(s.trim()));
    return s.trim()
}