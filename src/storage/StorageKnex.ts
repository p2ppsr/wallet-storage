import { sdk, verifyOne, verifyOneOrNone } from "..";
import { KnexMigrations, table } from "."

import { Knex } from "knex";
import { StorageBase, StorageBaseOptions } from "./StorageBase";

export interface StorageKnexOptions extends StorageBaseOptions {
    /**
     * Knex database interface initialized with valid connection configuration.
     */
    knex: Knex
}

export class StorageKnex extends StorageBase implements sdk.WalletStorage {
    knex: Knex

    constructor(options: StorageKnexOptions) {
        super(options)
        if (!options.knex) throw new sdk.WERR_INVALID_PARAMETER('options.knex', `valid`)
        this.knex = options.knex
    }

    override async getSettings(trx?: sdk.TrxToken): Promise<table.Settings> {
        return this.validateEntity(verifyOne(await this.toDb(trx)<table.Settings>('settings')))
    }

    override async getProvenOrRawTx(txid: string, trx?: sdk.TrxToken)
    : Promise<sdk.ProvenOrRawTx>
    {
        const k = this.toDb(trx)
        const r: sdk.ProvenOrRawTx = { proven: undefined, rawTx: undefined, inputBEEF: undefined }

        r.proven = verifyOneOrNone(await this.findProvenTxs({'txid': txid }))
        if (!r.proven) {
            const reqRawTx = verifyOneOrNone(await k('proven_tx_reqs')
                .where( 'txid', txid )
                .whereIn('status', ['unsent', 'unmined', 'unconfirmed', 'sending', 'nosend', 'completed'])
                .select('rawTx', 'inputBEEF'))
            if (reqRawTx) {
                r.rawTx = Array.from(reqRawTx.rawTx)
                r.inputBEEF = Array.from(reqRawTx.inputBEEF)
            }
        } 
        return r
    }

    override async getRawTxOfKnownValidTransaction(txid?: string, offset?: number, length?: number, trx?: sdk.TrxToken)
    : Promise<number[] | undefined>
    {
        if (!txid) return undefined

        let rawTx: number[] | undefined = undefined
        if (Number.isInteger(offset) && Number.isInteger(length)) {
            const rs: { rawTx: Buffer | null }[] = (await this.toDb(trx).raw(`select substring(rawTx from ${offset! + 1} for ${length}) as rawTx from proven_txs where txid = '${txid}'`))[0]
            const r = verifyOneOrNone(rs)
            if (r && r.rawTx) {
                rawTx = Array.from(r.rawTx)
            } else {
                const rs: { rawTx: Buffer | null }[] = (await this.toDb(trx).raw(`select substring(rawTx from ${offset! + 1} for ${length}) as rawTx from proven_tx_reqs where txid = '${txid}' and status in ('unsent', 'nosend', 'sending', 'unmined', 'completed')`))[0]
                const r = verifyOneOrNone(rs)
                if (r && r.rawTx) {
                    rawTx = Array.from(r.rawTx)
                }
            }
        } else {
            const r = await this.getProvenOrRawTx(txid, trx)
            if (r.proven)
                rawTx = r.proven.rawTx
            else
                rawTx = r.rawTx
        }
        return rawTx
    }

    override async requestSyncChunk(args: sdk.RequestSyncChunkArgs) : Promise<sdk.RequestSyncChunkResult> {
        throw new Error("Method not implemented.");
    }
    
    override async getProvenTxsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]> {
        throw new Error("Method not implemented.");
    }
    override async getProvenTxReqsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTxReq[]> {
        throw new Error("Method not implemented.");
    }
    override async getTxLabelMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabelMap[]> {
        throw new Error("Method not implemented.");
    }
    override async getOutputTagMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTagMap[]> {
        throw new Error("Method not implemented.");
    }

    async listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> {
        throw new Error("Method not implemented.");
    }
    async listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> {
        throw new Error("Method not implemented.");
    }
    async createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult> {
        throw new Error("Method not implemented.");
    }
    async processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults> {
        throw new Error("Method not implemented.");
    }

    override async insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(tx, trx)
        if (e.provenTxId === 0) delete e.provenTxId
        const [id] = await this.toDb(trx)<table.ProvenTx>('proven_txs').insert(e)
        tx.provenTxId = id
        return tx.provenTxId
    }

    override async insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(tx, trx)
        if (e.provenTxReqId === 0) delete e.provenTxReqId
        const [id] = await this.toDb(trx)<table.ProvenTxReq>('proven_tx_reqs').insert(e)
        tx.provenTxReqId = id
        return tx.provenTxReqId
    }

    override async insertUser(user: table.User, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(user, trx)
        if (e.userId === 0) delete e.userId
        const [id] = await this.toDb(trx)<table.User>('users').insert(e)
        user.userId = id
        return user.userId
    }

    override async insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(certificate, trx)
        if (e.certificateId === 0) delete e.certificateId
        const [id] = await this.toDb(trx)<table.Certificate>('certificates').insert(e)
        certificate.certificateId = id
        return certificate.certificateId
    }

    override async insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken) : Promise<void> {
        const e = await this.validateEntityForInsert(certificateField, trx)
        await this.toDb(trx)<table.Certificate>('certificate_fields').insert(e)
    }

    override async insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(basket, trx)
        if (e.basketId === 0) delete e.basketId
        const [id] = await this.toDb(trx)<table.OutputBasket>('output_baskets').insert(e)
        basket.basketId = id
        return basket.basketId
    }

    override async insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(tx, trx)
        if (e.transactionId === 0) delete e.transactionId
        const [id] = await this.toDb(trx)<table.Transaction>('transactions').insert(e)
        tx.transactionId = id
        return tx.transactionId
    }

    override async insertCommission(commission: table.Commission, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(commission, trx)
        if (e.commissionId === 0) delete e.commissionId
        const [id] = await this.toDb(trx)<table.Commission>('commissions').insert(e)
        commission.commissionId = id
        return commission.commissionId
    }

    override async insertOutput(output: table.Output, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(output, trx)
        if (e.outputId === 0) delete e.outputId
        const [id] = await this.toDb(trx)<table.Output>('outputs').insert(e)
        output.outputId = id
        return output.outputId
    }

    override async insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(tag, trx)
        if (e.outputTagId === 0) delete e.outputTagId
        const [id] = await this.toDb(trx)<table.OutputTag>('output_tags').insert(e)
        tag.outputTagId = id
        return tag.outputTagId
    }

    override async insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken) : Promise<void> {
        const e = await this.validateEntityForInsert(tagMap, trx)
        const [id] = await this.toDb(trx)<table.OutputTagMap>('output_tags_map').insert(e)
    }

    override async insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(label, trx)
        if (e.txLabelId === 0) delete e.txLabelId
        const [id] = await this.toDb(trx)<table.TxLabel>('tx_labels').insert(e)
        label.txLabelId = id
        return label.txLabelId
    }

    override async insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken) : Promise<void> {
        const e = await this.validateEntityForInsert(labelMap, trx)
        const [id] = await this.toDb(trx)<table.TxLabelMap>('tx_labels_map').insert(e)
    }

    override async insertWatchmanEvent(event: table.WatchmanEvent, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(event, trx)
        if (e.id === 0) delete e.id
        const [id] = await this.toDb(trx)<table.WatchmanEvent>('watchman_events').insert(e)
        event.id = id
        return event.id
    }

    override async insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken) : Promise<number> {
        const e = await this.validateEntityForInsert(syncState, trx)
        if (e.syncStateId === 0) delete e.syncStateId
        const [id] = await this.toDb(trx)<table.SyncState>('sync_states').insert(e)
        syncState.syncStateId = id
        return syncState.syncStateId
    }


    override async updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.CertificateField>('certificate_fields').where({ certificateId, fieldName }).update(this.validatePartialForUpdate(update))
    }
    override async updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.Certificate>('certificates').where({ certificateId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.Commission>('commissions').where({ commissionId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.OutputBasket>('output_baskets').where({ basketId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.Output>('outputs').where({ outputId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateOutputTagMap(outputId: number, tagId: number, update: Partial<table.OutputTagMap>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.OutputTagMap>('output_tags_map').where({ outputId, outputTagId: tagId }).update(this.validatePartialForUpdate(update))
    }
    override async updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.OutputTag>('output_tags').where({ outputTagId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateProvenTxReq(id: number, update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.ProvenTxReq>('proven_tx_reqs').where({ provenTxReqId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number>  {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.ProvenTx>('proven_txs').where({ provenTxId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.SyncState>('sync_states').where({ syncStateId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateTransaction(id: number, update: Partial<table.Transaction>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.Transaction>('transactions').where({ transactionId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<table.TxLabelMap>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.TxLabelMap>('tx_labels_map').where({ transactionId, txLabelId }).update(this.validatePartialForUpdate(update))
    }
    override async updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.TxLabel>('tx_labels').where({ txLabelId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken) : Promise<number> {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.User>('users').where({ userId: id }).update(this.validatePartialForUpdate(update))
    }
    override async updateWatchmanEvent(id: number, update: Partial<table.WatchmanEvent>, trx?: sdk.TrxToken): Promise<number>  {
        await this.verifyReadyForDatabaseAccess(trx)
        return await this.toDb(trx)<table.WatchmanEvent>('watchman_events').where({ id }).update(this.validatePartialForUpdate(update))
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

    findCertificateFieldsQuery(partial: Partial<table.CertificateField>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('certificate_fields', partial, since, paged, trx)
    }
    findCertificatesQuery(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        const q = this.setupQuery('certificates', partial, since, paged, trx)
        if (certifiers && certifiers.length > 0) q.whereIn('certifier', certifiers);
        if (types && types.length > 0) q.whereIn('type', types);
        return q
    }
    findCommissionsQuery(partial: Partial<table.Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        if (partial.lockingScript) throw new sdk.WERR_INVALID_PARAMETER('partial.lockingScript', `undefined. Commissions may not be found by lockingScript value.`);
        return this.setupQuery('commissions', partial, since, paged, trx)
    }
    findOutputBasketsQuery(partial: Partial<table.OutputBasket>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('output_baskets', partial, since, paged, trx)
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
    findOutputTagMapsQuery(partial: Partial<table.OutputTagMap>, tagIds?: number[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        const q = this.setupQuery('output_tags_map', partial, since, paged, trx)
        if (tagIds && tagIds.length > 0) q.whereIn('outputTagId', tagIds);
        return q
    }
    findOutputTagsQuery(partial: Partial<table.OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('output_tags', partial, since, paged, trx)
    }
    findProvenTxReqsQuery(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        if (partial.rawTx) throw new sdk.WERR_INVALID_PARAMETER('partial.rawTx', `undefined. ProvenTxReqs may not be found by rawTx value.`);
        if (partial.inputBEEF) throw new sdk.WERR_INVALID_PARAMETER('partial.inputBEEF', `undefined. ProvenTxReqs may not be found by inputBEEF value.`);
        const q = this.setupQuery('proven_tx_reqs', partial, since, paged, trx)
        if (status && status.length > 0) q.whereIn('status', status);
        if (txids && txids.length > 0) q.whereIn('txid', txids);
        return q
    }
    findProvenTxsQuery(partial: Partial<table.ProvenTx>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Knex.QueryBuilder  {
        if (partial.rawTx) throw new sdk.WERR_INVALID_PARAMETER('partial.rawTx', `undefined. ProvenTxs may not be found by rawTx value.`);
        if (partial.merklePath) throw new sdk.WERR_INVALID_PARAMETER('partial.merklePath', `undefined. ProvenTxs may not be found by merklePath value.`);
        return this.setupQuery('proven_txs', partial, since, paged, trx)
    }
    findSyncStatesQuery(partial: Partial<table.SyncState>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Knex.QueryBuilder {
        return this.setupQuery('sync_states', partial, since, paged, trx)
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
    findTxLabelMapsQuery(partial: Partial<table.TxLabelMap>, labelIds?: number[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        const q = this.setupQuery('tx_labels_map', partial, since, paged, trx)
        if (labelIds && labelIds.length > 0) q.whereIn('txLabelId', labelIds);
        return q
    }
    findTxLabelsQuery(partial: Partial<table.TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('tx_labels', partial, since, paged, trx)
    }
    findUsersQuery(partial: Partial<table.User>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Knex.QueryBuilder {
        return this.setupQuery('users', partial, since, paged, trx)
    }
    findWatchmanEventsQuery(partial: Partial<table.WatchmanEvent>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Knex.QueryBuilder  {
        return this.setupQuery('watchman_events', partial, since, paged, trx)
    }


    override async findCertificateFields(partial: Partial<table.CertificateField>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.CertificateField[]> {
        return this.validateEntities(await this.findCertificateFieldsQuery(partial, since, paged, trx))
    }
    override async findCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Certificate[]> {
        const q = this.findCertificatesQuery(partial, certifiers, types, since, paged, trx)
        const r = await q
        return this.validateEntities(r, undefined, ['isDeleted'])
    }
    override async findCommissions(partial: Partial<table.Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Commission[]> {
        const q = this.findCommissionsQuery(partial, since, paged, trx)
        const r = await q
        return this.validateEntities(r, undefined, ['isRedeemed'])
    }
    override async findOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputBasket[]> {
        const q = this.findOutputBasketsQuery(partial, since, paged, trx)
        const r = await q
        return this.validateEntities(r, undefined, ['isDeleted'])
    }
    override async findOutputs(partial: Partial<table.Output>, noScript?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Output[]> {
        const q = this.findOutputsQuery(partial, noScript, since, paged, trx)
        const r = await q
        if (!noScript) {
            for (const o of r) {
                await this.validateOutputScript(o, trx)
            }
        }
        return this.validateEntities(r, undefined, ['spendable', 'change'])
    }
    override async findOutputTagMaps(partial: Partial<table.OutputTagMap>, tagIds?: number[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputTagMap[]> {
        const q = this.findOutputTagMapsQuery(partial, tagIds, since, paged, trx)
        const r = await q
        return this.validateEntities(r, undefined, ['isDeleted'])
    }
    override async findOutputTags(partial: Partial<table.OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.OutputTag[]> {
        const q = this.findOutputTagsQuery(partial, since, paged, trx)
        const r = await q
        return this.validateEntities(r, undefined, ['isDeleted'])
    }
    override async findProvenTxReqs(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.ProvenTxReq[]> {
        const q = this.findProvenTxReqsQuery(partial, status, txids, since, paged, trx)
        const r = await q
        return this.validateEntities(r, undefined, ['notified'])
    }
    override async findProvenTxs(partial: Partial<table.ProvenTx>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]>  {
        const q = this.findProvenTxsQuery(partial, since, paged, trx)
        const r = await q
        return this.validateEntities(r)
    }
    override async findSyncStates(partial: Partial<table.SyncState>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.SyncState[]> {
        const q = this.findSyncStatesQuery(partial, since, paged, trx)
        const r = await q
        return this.validateEntities(r, undefined, ['init'])
    }
    override async findTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.Transaction[]> {
        const q = this.findTransactionsQuery(partial, status, noRawTx, since, paged, trx)
        const r = await q
        if (!noRawTx) {
            for (const t of r) { await this.validateRawTransaction(t, trx) }
        }
        return this.validateEntities(r, undefined, ['isOutgoing'])
    }
    override async findTxLabelMaps(partial: Partial<table.TxLabelMap>, labelIds?: number[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.TxLabelMap[]> {
        const q = this.findTxLabelMapsQuery(partial, labelIds, since, paged, trx)
        const r = await q
        return this.validateEntities(r, undefined, ['isDeleted'])
    }
    override async findTxLabels(partial: Partial<table.TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.TxLabel[]> {
        const q = this.findTxLabelsQuery(partial, since, paged, trx)
        const r = await q
        return this.validateEntities(r, undefined, ['isDeleted'])
    }
    override async findUsers(partial: Partial<table.User>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken) : Promise<table.User[]> {
        const q = this.findUsersQuery(partial, since, paged, trx)
        const r = await q
        return this.validateEntities(r)
    }
    override async findWatchmanEvents(partial: Partial<table.WatchmanEvent>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.WatchmanEvent[]>  {
        const q = this.findWatchmanEventsQuery(partial, since, paged, trx)
        const r = await q
        return this.validateEntities(r, ['when'], undefined)
    }

    async getCount<T extends object>(q: Knex.QueryBuilder<T, T[]>) : Promise<number> {
        q.count()
        const r = await q
        return r[0]['count(*)']
    }

    override async countCertificateFields(partial: Partial<table.CertificateField>, since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findCertificateFieldsQuery(partial, since, undefined, trx))
    }
    override async countCertificates(partial: Partial<table.Certificate>, certifiers?: string[], types?: string[], since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findCertificatesQuery(partial, certifiers, types, since, undefined, trx))
    }
    override async countCommissions(partial: Partial<table.Commission>, since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findCommissionsQuery(partial, since, undefined, trx))
    }
    override async countOutputBaskets(partial: Partial<table.OutputBasket>, since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findOutputBasketsQuery(partial, since, undefined, trx))
    }
    override async countOutputs(partial: Partial<table.Output>, since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findOutputsQuery(partial, true, since, undefined, trx, true))
    }
    override async countOutputTagMaps(partial: Partial<table.OutputTagMap>, tagIds?: number[], since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findOutputTagMapsQuery(partial, tagIds, since, undefined, trx))
    }
    override async countOutputTags(partial: Partial<table.OutputTag>, since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findOutputTagsQuery(partial, since, undefined, trx))
    }
    override async countProvenTxReqs(partial: Partial<table.ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findProvenTxReqsQuery(partial, status, txids, since, undefined, trx))
    }
    override async countProvenTxs(partial: Partial<table.ProvenTx>, since?: Date, trx?: sdk.TrxToken): Promise<number>  {
        return await this.getCount(this.findProvenTxsQuery(partial, since, undefined, trx))
    }
    override async countSyncStates(partial: Partial<table.SyncState>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        return await this.getCount(this.findSyncStatesQuery(partial, since, undefined, trx))
    }
    override async countTransactions(partial: Partial<table.Transaction>, status?: sdk.TransactionStatus[], since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findTransactionsQuery(partial, status, undefined, since, undefined, trx, true))
    }
    override async countTxLabelMaps(partial: Partial<table.TxLabelMap>, labelIds?: number[], since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findTxLabelMapsQuery(partial, labelIds, since, undefined, trx))
    }
    override async countTxLabels(partial: Partial<table.TxLabel>, since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findTxLabelsQuery(partial, since, undefined, trx))
    }
    override async countUsers(partial: Partial<table.User>, since?: Date, trx?: sdk.TrxToken) : Promise<number> {
        return await this.getCount(this.findUsersQuery(partial, since, undefined, trx))
    }
    override async countWatchmanEvents(partial: Partial<table.WatchmanEvent>, since?: Date, trx?: sdk.TrxToken): Promise<number>  {
        return await this.getCount(this.findWatchmanEventsQuery(partial, since, undefined, trx))
    }

    override async destroy(): Promise<void> {
        await this.knex?.destroy()
    }

    override async migrate(storageName: string): Promise<string> {
        const config = { migrationSource: new KnexMigrations(this.chain, storageName, 1024) }
        await this.knex.migrate.latest(config)
        const version = await this.knex.migrate.currentVersion(config)
        return version
    }

    override async dropAllData(): Promise<void> {
        const config = { migrationSource: new KnexMigrations(this.chain, '', 1024) }
        const count = Object.keys(config.migrationSource.migrations).length
        for (let i = 0; i < count; i++) {
            try {
                const r = await this.knex.migrate.down(config)
                expect(r).toBeTruthy()
            } catch (eu: unknown) {
                break;
            }
        }
    }

    override async transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T> {
        if (trx)
            return await scope(trx)
        
        return await this.knex.transaction<T>(async knextrx => {
            const trx = knextrx as sdk.TrxToken
            return await scope(trx)
        })
    }

    /**
     * Convert the standard optional `TrxToken` parameter into either a direct knex database instance,
     * or a Knex.Transaction as appropriate.
     */
    toDb(trx?: sdk.TrxToken) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = !trx ? this.knex : <Knex.Transaction<any, any[]>>trx
        this.whenLastAccess = new Date()
        return db
    }

    async validateRawTransaction(t: table.Transaction, trx?: sdk.TrxToken) : Promise<void> {
        // if there is no txid or there is a rawTransaction return what we have.
        if (t.rawTx || !t.txid) return

        // rawTransaction is missing, see if we moved it ...

        const rawTx = await this.getRawTxOfKnownValidTransaction(t.txid, undefined, undefined, trx)
        if (!rawTx) return
        t.rawTx = rawTx
    }

    async validateOutputScript(o: table.Output, trx?: sdk.TrxToken) : Promise<void> {
        // without offset and length values return what we have (make no changes)
        if (!o.scriptLength || !o.scriptOffset || !o.txid) return
        // if there is an outputScript and its length is the expected length return what we have.
        if (o.lockingScript && o.lockingScript.length === o.scriptLength) return

        // outputScript is missing or has incorrect length...

        const script = await this.getRawTxOfKnownValidTransaction(o.txid, o.scriptOffset, o.scriptLength, trx)
        if (!script) return
        o.lockingScript = script
    }

    /**
     * Make sure database is ready for access:
     * 
     * - dateScheme is known
     * - foreign key constraints are enabled
     * 
     * @param trx
     */
    async verifyReadyForDatabaseAccess(trx?: sdk.TrxToken) : Promise<DBType> {
        if (!this.settings) {

            this.settings = await this.getSettings()

            // Make sure foreign key constraint checking is turned on in SQLite.
            if (this.settings.dbtype === 'SQLite') {
                await this.toDb(trx).raw("PRAGMA foreign_keys = ON;")
            }
        }
        
        return this.settings.dbtype
    }

    /**
     * Helper to force uniform behavior across database engines.
     * Use to process the update template for entities being updated.
     */
    validatePartialForUpdate<T extends sdk.EntityTimeStamp>(update: Partial<T>, dateFields?: string[]) : Partial<T> {
        if (!this.dbtype) throw new sdk.WERR_INTERNAL('must call verifyReadyForDatabaseAccess first');
        const v: any = update
        if (v.created_at) v.created_at = this.validateEntityDate(v.created_at);
        if (v.updated_at) v.updated_at = this.validateEntityDate(v.updated_at);
        if (!v.created_at) delete v.created_at
        if (!v.updated_at) v.updated_at = this.validateEntityDate(new Date());

        if (dateFields) {
            for (const df of dateFields) {
                if (v[df])
                    v[df] = this.validateOptionalEntityDate(v[df])
            }
        }
        for (const key of Object.keys(v)) {
            const val = v[key]
            if (Array.isArray(val) && (val.length === 0 || typeof val[0] === 'number')) {
                v[key] = Buffer.from(val)
            }
        }
        this.isDirty = true
        return v
    }

    /**
     * Helper to force uniform behavior across database engines.
     * Use to process new entities being inserted into the database.
     */
    async validateEntityForInsert<T extends sdk.EntityTimeStamp>(entity: T, trx?: sdk.TrxToken, dateFields?: string[]): Promise<any> {
        await this.verifyReadyForDatabaseAccess(trx)
        const v: any = { ...entity }
        v.created_at = this.validateOptionalEntityDate(v.created_at, true)!
        v.updated_at = this.validateOptionalEntityDate(v.updated_at, true)!
        if (!v.created_at) delete v.created_at
        if (!v.updated_at) delete v.updated_at
        if (dateFields) {
            for (const df of dateFields) {
                if (v[df])
                    v[df] = this.validateOptionalEntityDate(v[df])
            }
        }
        for (const key of Object.keys(v)) {
            const val = v[key]
            if (Array.isArray(val) && (val.length === 0 || typeof val[0] === 'number')) {
                v[key] = Buffer.from(val)
            }
        }
        this.isDirty = true
        return v
    }
}

export type DBType = 'SQLite' | 'MySQL'

type DbEntityTimeStamp<T extends sdk.EntityTimeStamp> = {
    [K in keyof T]: T[K] extends Date ? Date | string : T[K];
};