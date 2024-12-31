import { asString, sdk, validateSecondsSinceEpoch, verifyId, verifyInteger, verifyOne, verifyTruthy } from "../..";
import { DBType, StorageKnexOptions, StorageSyncReader, table } from ".."

import { Knex } from "knex";
import { MerklePath } from "@bsv/sdk";


export class StorageMySQLDojoReader extends StorageSyncReader {
    knex: Knex

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
            created_at: verifyTruthy(d.created_at),
            updated_at: verifyTruthy(d.updated_at),
            storageIdentityKey: verifyTruthy(d.dojoIdentityKey),
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
    async findOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputBasket[]> {
        const q = this.findOutputBasketsQuery(partial, since, paged, trx)
        const ds = await q
        const rs: table.OutputBasket[] = []
        for (const d of ds) {
            const r: table.OutputBasket = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                basketId: verifyInteger(d.basketId),
                userId: verifyInteger(d.userId),
                name: verifyTruthy(d.name),
                numberOfDesiredUTXOs: verifyInteger(d.numberOfDesiredUTXOs),
                minimumDesiredUTXOValue: verifyInteger(d.minimumDesiredUTXOValue),
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isDeleted'])
    }
    findTxLabelsQuery(partial: Partial<table.TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('tx_labels', partial, since, paged, trx)
    }
    async findTxLabels(partial: Partial<table.TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.TxLabel[]> {
        const q = this.findTxLabelsQuery(partial, since, paged, trx)
        const ds = await q
        const rs: table.TxLabel[] = []
        for (const d of ds) {
            const r: table.TxLabel = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                txLabelId: verifyInteger(d.txLabelId),
                userId: verifyInteger(d.userId),
                label: verifyTruthy(d.label),
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isDeleted'])
    }
    findOutputTagsQuery(partial: Partial<table.OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('output_tags', partial, since, paged, trx)
    }
    async findOutputTags(partial: Partial<table.OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputTag[]> {
        const q = this.findOutputTagsQuery(partial, since, paged, trx)
        const ds = await q
        const rs: table.OutputTag[] = []
        for (const d of ds) {
            const r: table.OutputTag = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                outputTagId: verifyInteger(d.outputTagId),
                userId: verifyInteger(d.userId),
                tag: verifyTruthy(d.tag),
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isDeleted'])
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
    async findTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Transaction[]> {
        const q = this.findTransactionsQuery(partial, status, noRawTx, since, paged, trx)
        const ds = await q
        const rs: table.Transaction[] = []
        for (const d of ds) {
            const r: table.Transaction = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                transactionId: verifyInteger(d.transactionId),
                userId: verifyInteger(d.userId),
                status: verifyTruthy(convertTxStatus(d.status)),
                reference: verifyTruthy(d.referenceNumber),
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
    findCommissionsQuery(partial: Partial<table.Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        if (partial.lockingScript) throw new sdk.WERR_INVALID_PARAMETER('partial.lockingScript', `undefined. Commissions may not be found by lockingScript value.`);
        return this.setupQuery('commissions', partial, since, paged, trx)
    }
    async findCommissions(partial: Partial<table.Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Commission[]> {
        const q = this.findCommissionsQuery(partial, since, paged, trx)
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
                keyOffset: verifyTruthy(d.keyOffset),
                isRedeemed: !!d.isRedeemed,
                lockingScript: Array.from(verifyTruthy(d.outputScript))
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isRedeemed'])
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
    async findOutputs(partial: Partial<table.Output>, noScript?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Output[]> {
        const q = this.findOutputsQuery(partial, noScript, since, paged, trx)
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
                outputDescription: d.description || '',
                vout: verifyInteger(d.vout),
                satoshis: verifyInteger(d.amount),
                providedBy: verifyTruthy(d.providedBy || ''),
                purpose: verifyTruthy(d.purpose || ''),
                type: verifyTruthy(d.type),
                txid: nullToUndefined(d.txid),
                senderIdentityKey: nullToUndefined(d.senderIdentityKey),
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
    findCertificatesQuery(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        const q = this.setupQuery('certificates', partial, since, paged, trx)
        if (certifiers && certifiers.length > 0) q.whereIn('certifier', certifiers);
        if (types && types.length > 0) q.whereIn('type', types);
        return q
    }
    async findCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Certificate[]> {
        const q = this.findCertificatesQuery(partial, certifiers, types, since, paged, trx)
        const ds = await q
        const rs: table.Certificate[] = []
        for (const d of ds) {
            const r: table.Certificate = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                certificateId: verifyInteger(d.certificateId),
                userId: verifyInteger(d.userId),
                type: verifyTruthy(d.type),
                serialNumber: verifyTruthy(d.serialNumber),
                certifier: verifyTruthy(d.certifier),
                subject: verifyTruthy(d.subject),
                revocationOutpoint: verifyTruthy(d.revocationOutpoint),
                signature: verifyTruthy(d.signature),
                verifier: nullToUndefined(d.validationKey),
                isDeleted: !!d.isDeleted
            }
            rs.push(r)
        }
        return this.validateEntities(rs, undefined, ['isDeleted'])
    }
    findCertificateFieldsQuery(partial: Partial<table.CertificateField>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('certificate_fields', partial, since, paged, trx)
    }
    async findCertificateFields(partial: Partial<table.CertificateField>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.CertificateField[]> {
        const q = this.findCertificateFieldsQuery(partial, since, paged, trx)
        const ds = await q
        const rs: table.CertificateField[] = []
        for (const d of ds) {
            const r: table.CertificateField = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                userId: verifyInteger(d.userId),
                certificateId: verifyInteger(d.certificateId),
                fieldName: verifyTruthy(d.fieldName),
                fieldValue: verifyTruthy(d.fieldValue),
                masterKey: verifyTruthy(d.masterKey),
            }
            rs.push(r)
        }
        return this.validateEntities(rs)
    }
    override async findSyncStates(partial: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<table.SyncState[]> {
        const q = this.setupQuery('sync_state', partial, undefined, undefined, trx)
        const ds = await q
        const rs: table.SyncState[] = []
        for (const d of ds) {
            const r: table.SyncState = {
                created_at: verifyTruthy(d.created_at),
                updated_at: verifyTruthy(d.updated_at),
                syncStateId: verifyInteger(d.syncStateId),
                userId: verifyInteger(d.userId),
                storageIdentityKey: verifyTruthy(d.storageIdentityKey),
                storageName: verifyTruthy(d.storageName || 'dojo importer'),
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
    override async findUsers(partial: Partial<table.User>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.User[]> {
        const q = this.setupQuery('users', partial, undefined, undefined, trx)
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
                txid: verifyTruthy(d.txid),
                height: verifyInteger(d.height),
                index: verifyInteger(d.index),
                merklePath: mp.toBinary(),
                rawTx: Array.from(verifyTruthy(d.rawTx)),
                blockHash: asString(verifyTruthy(d.blockHash)),
                merkleRoot: asString(verifyTruthy(d.merkleRoot)),
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


    override async requestSyncChunk(args: sdk.RequestSyncChunkArgs): Promise<sdk.RequestSyncChunkResult> {
        const r: sdk.RequestSyncChunkResult = {}

        let itemCount = args.maxItems
        let roughSize = args.maxRoughSize
        let i = 0
        let done = false

        const user = verifyOne(await this.findUsers({ identityKey: args.identityKey }))

        const addItems = async (a: ChunkerArgs) => {
            if (i >= args.offsets.length) { done = true; return }
            let { offset, name: oname } = args.offsets[i++]
            if (a.name !== oname) throw new sdk.WERR_INVALID_PARAMETER('offsets', `in dependency order. '${a.name}' expected, found ${oname}.`);
            let preAddCalled = false
            for (; !done;) {
                const limit = Math.min(itemCount, Math.max(10, args.maxItems / a.maxDivider))
                if (limit <= 0) break;
                const items = await a.findItems(this, user.userId, args.since, limit, offset)
                checkEntityValues(items)
                if (!preAddCalled) { a.preAdd(); preAddCalled = true }
                if (items.length === 0) break;
                for (const item of items) {
                    offset++
                    a.addItem(item)
                    itemCount--
                    roughSize -= JSON.stringify(item).length
                    if (itemCount <= 0 || roughSize < 0) { done = true; break; }
                }
            }
        }
        
        const chunkers: ChunkerArgs[] = [
            {
                name: 'provenTx', maxDivider: 100, preAdd: () => {r.provenTxs = []}, addItem: (i: table.ProvenTx) => { r.provenTxs!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.getProvenTxsForUser(userId, since, { limit, offset }) }
            },
            {
                name: 'outputBasket', maxDivider: 1, preAdd: () => {r.outputBaskets = []}, addItem: (i: table.OutputBasket) => { r.outputBaskets!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.findOutputBaskets({ userId }, since, { limit, offset }) }
            },
            {
                name: 'outputTag', maxDivider: 1, preAdd: () => {r.outputTags = []}, addItem: (i: table.OutputTag) => { r.outputTags!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.findOutputTags({ userId }, since, { limit, offset }) }
            },
            {
                name: 'txLabel', maxDivider: 1, preAdd: () => {r.txLabels = []}, addItem: (i: table.TxLabel) => { r.txLabels!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.findTxLabels({ userId }, since, { limit, offset }) }
            },
            {
                name: 'transaction', maxDivider: 25, preAdd: () => {r.transactions = []}, addItem: (i: table.Transaction) => { r.transactions!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.findTransactions({ userId }, undefined, false, since, { limit, offset }) }
            },
            {
                name: 'output', maxDivider: 25, preAdd: () => {r.outputs = []}, addItem: (i: table.Output) => { r.outputs!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.findOutputs({ userId }, false, since, { limit, offset }) }
            },
            {
                name: 'txLabelMap', maxDivider: 1, preAdd: () => {r.txLabelMaps = []}, addItem: (i: table.TxLabelMap) => { r.txLabelMaps!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.getTxLabelMapsForUser(userId, since, { limit, offset }) }
            },
            {
                name: 'outputTagMap', maxDivider: 1, preAdd: () => {r.outputTagMaps = []}, addItem: (i: table.OutputTagMap) => { r.outputTagMaps!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.getOutputTagMapsForUser(userId, since, { limit, offset }) }
            },
            {
                name: 'certificate', maxDivider: 25, preAdd: () => {r.certificates = []}, addItem: (i: table.Certificate) => { r.certificates!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.findCertificates({ userId }, undefined, undefined, since, { limit, offset }) }
            },
            {
                name: 'certificateField', maxDivider: 25, preAdd: () => {r.certificateFields = []}, addItem: (i: table.CertificateField) => { r.certificateFields!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.findCertificateFields({ userId }, since, { limit, offset }) }
            },
            {
                name: 'commission', maxDivider: 25, preAdd: () => {r.commissions = []}, addItem: (i: table.Commission) => { r.commissions!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.findCommissions({ userId }, since, { limit, offset }) }
            },
            {
                name: 'provenTxReq', maxDivider: 100, preAdd: () => {r.provenTxReqs = []}, addItem: (i: table.ProvenTxReq) => { r.provenTxReqs!.push(i) },
                findItems: async (storage: sdk.StorageSyncReader, userId: number, since: Date | undefined, limit: number, offset: number) =>
                     { return await storage.getProvenTxReqsForUser(userId, since, { limit, offset }) }
            },
        ]

        for (; !done;) {
            for (const c of chunkers) {
                await addItems(c)
            }
        }

        return r
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

type DojoTransactionStatusApi =
    'completed' | 'failed' | 'unprocessed' | 'sending' | 'unproven' | 'unsigned' | 'nosend'

//type TransactionStatus =
//   'completed' | 'failed' | 'unprocessed' | 'sending' | 'unproven' | 'unsigned' | 'nosend'

function convertTxStatus(status: DojoTransactionStatusApi): sdk.TransactionStatus {
    return status
}

function nullToUndefined<T>(v: T) : T | undefined {
    if (v === null) return undefined
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

type ChunkerArgs = {
        name: string,
        maxDivider: number,
        preAdd: () => void,
        addItem: (i: any) => void,
        findItems: (
            storage: sdk.StorageSyncReader,
            userId: number,
            since: Date | undefined,
            limit: number,
            offset: number
        ) => Promise<any[]>,
}

function checkIsDate(v: any) {
    if (!(v instanceof Date))
        throw new sdk.WERR_INVALID_OPERATION('bad date')
}
function checkEntityValues(es: object[]) {
    for (const e of es) {
        checkIsDate(e['created_at'])
        checkIsDate(e['updated_at'])
        for (const key of Object.keys(e))
            if (e[key] === null)
                throw new sdk.WERR_INVALID_OPERATION()
    }
}