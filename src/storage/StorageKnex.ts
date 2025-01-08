import { sdk, verifyOne, verifyOneOrNone, verifyTruthy } from '..'
import { KnexMigrations, table } from '.'

import { Knex } from 'knex'
import { StorageBase, StorageBaseOptions } from './StorageBase'
import { listActionsSdk } from './methods/listActionsSdk'
import { listOutputsSdk } from './methods/listOutputsSdk'
import { purgeData } from './methods/purgeData'
import { requestSyncChunk } from './methods/requestSyncChunk'
import { listCertificatesSdk } from './methods/listCertificatesSdk'
import { createTransactinoSdk } from './methods/createTransactionSdk'
import { processActionSdk } from './methods/processActionSdk'

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

  async readSettings(): Promise<table.Settings> {
    return this.validateEntity(verifyOne(await this.toDb(undefined)<table.Settings>('settings')))
  }

  override async getProvenOrRawTx(txid: string, trx?: sdk.TrxToken): Promise<sdk.ProvenOrRawTx> {
    const k = this.toDb(trx)
    const r: sdk.ProvenOrRawTx = {
      proven: undefined,
      rawTx: undefined,
      inputBEEF: undefined
    }

    r.proven = verifyOneOrNone(await this.findProvenTxs({ partial: { txid: txid } }))
    if (!r.proven) {
      const reqRawTx = verifyOneOrNone(await k('proven_tx_reqs').where('txid', txid).whereIn('status', ['unsent', 'unmined', 'unconfirmed', 'sending', 'nosend', 'completed']).select('rawTx', 'inputBEEF'))
      if (reqRawTx) {
        r.rawTx = Array.from(reqRawTx.rawTx)
        r.inputBEEF = Array.from(reqRawTx.inputBEEF)
      }
    }
    return r
  }

  dbTypeSubstring(source: string, fromOffset: number, forLength?: number) {
    if (this.dbtype === 'MySQL') return `substring(${source} from ${fromOffset} for ${forLength!})`
    return `substr(${source}, ${fromOffset}, ${forLength})`
  }

  override async getRawTxOfKnownValidTransaction(txid?: string, offset?: number, length?: number, trx?: sdk.TrxToken): Promise<number[] | undefined> {
    if (!txid) return undefined

    let rawTx: number[] | undefined = undefined
    if (Number.isInteger(offset) && Number.isInteger(length)) {
      let rs: { rawTx: Buffer | null }[] = await this.toDb(trx).raw(`select ${this.dbTypeSubstring('rawTx', offset! + 1, length)} as rawTx from proven_txs where txid = '${txid}'`)
      if (this.dbtype === 'MySQL') rs = (rs as unknown as { rawTx: Buffer | null }[][])[0]
      const r = verifyOneOrNone(rs)
      if (r && r.rawTx) {
        rawTx = Array.from(r.rawTx)
      } else {
        let rs: { rawTx: Buffer | null }[] = await this.toDb(trx).raw(`select ${this.dbTypeSubstring('rawTx', offset! + 1, length)} as rawTx from proven_tx_reqs where txid = '${txid}' and status in ('unsent', 'nosend', 'sending', 'unmined', 'completed')`)
        if (this.dbtype === 'MySQL') rs = (rs as unknown as { rawTx: Buffer | null }[][])[0]
        const r = verifyOneOrNone(rs)
        if (r && r.rawTx) {
          rawTx = Array.from(r.rawTx)
        }
      }
    } else {
      const r = await this.getProvenOrRawTx(txid, trx)
      if (r.proven) rawTx = r.proven.rawTx
      else rawTx = r.rawTx
    }
    return rawTx
  }

  getProvenTxsForUserQuery(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Knex.QueryBuilder {
    const k = this.toDb(trx)
    let q = k('proven_txs').where(function () {
      this.whereExists(k.select('*').from('transactions').whereRaw(`proven_txs.provenTxId = transactions.provenTxId and transactions.userId = ${userId}`))
    })
    if (paged) {
      q = q.limit(paged.limit)
      q = q.offset(paged.offset || 0)
    }
    if (since) q = q.where('updated_at', '>=', since)
    return q
  }
  override async getProvenTxsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]> {
    const q = this.getProvenTxsForUserQuery(userId, since, paged, trx)
    const rs = await q
    return this.validateEntities(rs)
  }

  getProvenTxReqsForUserQuery(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Knex.QueryBuilder {
    const k = this.toDb(trx)
    let q = k('proven_tx_reqs').where(function () {
      this.whereExists(k.select('*').from('transactions').whereRaw(`proven_tx_reqs.txid = transactions.txid and transactions.userId = ${userId}`))
    })
    if (paged) {
      q = q.limit(paged.limit)
      q = q.offset(paged.offset || 0)
    }
    if (since) q = q.where('updated_at', '>=', since)
    return q
  }
  override async getProvenTxReqsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTxReq[]> {
    const q = this.getProvenTxReqsForUserQuery(userId, since, paged, trx)
    const rs = await q
    return this.validateEntities(rs, undefined, ['notified'])
  }

  getTxLabelMapsForUserQuery(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Knex.QueryBuilder {
    const k = this.toDb(trx)
    let q = k('tx_labels_map').whereExists(k.select('*').from('tx_labels').whereRaw(`tx_labels.txLabelId = tx_labels_map.txLabelId and tx_labels.userId = ${userId}`))
    if (since) q = q.where('updated_at', '>=', this.validateDateForWhere(since))
    if (paged) {
      q = q.limit(paged.limit)
      q = q.offset(paged.offset || 0)
    }
    return q
  }
  override async getTxLabelMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabelMap[]> {
    const q = this.getTxLabelMapsForUserQuery(userId, since, paged, trx)
    const rs = await q
    return this.validateEntities(rs, undefined, ['isDeleted'])
  }

  getOutputTagMapsForUserQuery(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Knex.QueryBuilder {
    const k = this.toDb(trx)
    let q = k('output_tags_map').whereExists(k.select('*').from('output_tags').whereRaw(`output_tags.outputTagId = output_tags_map.outputTagId and output_tags.userId = ${userId}`))
    if (since) q = q.where('updated_at', '>=', this.validateDateForWhere(since))
    if (paged) {
      q = q.limit(paged.limit)
      q = q.offset(paged.offset || 0)
    }
    return q
  }
  override async getOutputTagMapsForUser(userId: number, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTagMap[]> {
    const q = this.getOutputTagMapsForUserQuery(userId, since, paged, trx)
    const rs = await q
    return this.validateEntities(rs, undefined, ['isDeleted'])
  }

  override async listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListCertificatesResult> {
    return await listCertificatesSdk(this, vargs, originator)
  }
  override async listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> {
    return await listActionsSdk(this, vargs, originator)
  }
  override async listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> {
    return await listOutputsSdk(this, vargs, originator)
  }
  override async processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults> {
    return await processActionSdk(this, params, originator)
  }

  override async insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(tx, trx)
    if (e.provenTxId === 0) delete e.provenTxId
    const [id] = await this.toDb(trx)<table.ProvenTx>('proven_txs').insert(e)
    tx.provenTxId = id
    return tx.provenTxId
  }

  override async insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(tx, trx)
    if (e.provenTxReqId === 0) delete e.provenTxReqId
    const [id] = await this.toDb(trx)<table.ProvenTxReq>('proven_tx_reqs').insert(e)
    tx.provenTxReqId = id
    return tx.provenTxReqId
  }

  override async insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(user, trx)
    if (e.userId === 0) delete e.userId
    const [id] = await this.toDb(trx)<table.User>('users').insert(e)
    user.userId = id
    return user.userId
  }

  override async insertCertificate(certificate: table.CertificateX, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(certificate, trx, undefined, ['isDeleted'])
    if (e.certificateId === 0) delete e.certificateId
    const [id] = await this.toDb(trx)<table.Certificate>('certificates').insert(e)
    certificate.certificateId = id

    if (certificate.fields) {
      for (const field of certificate.fields) {
        field.certificateId = id
        field.userId = certificate.userId
        await this.insertCertificateField(field, trx)
      }
    }

    return certificate.certificateId
  }

  override async insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void> {
    const e = await this.validateEntityForInsert(certificateField, trx)
    await this.toDb(trx)<table.Certificate>('certificate_fields').insert(e)
  }

  override async insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(basket, trx, undefined, ['isDeleted'])
    if (e.basketId === 0) delete e.basketId
    const [id] = await this.toDb(trx)<table.OutputBasket>('output_baskets').insert(e)
    basket.basketId = id
    return basket.basketId
  }

  override async insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(tx, trx)
    if (e.transactionId === 0) delete e.transactionId
    const [id] = await this.toDb(trx)<table.Transaction>('transactions').insert(e)
    tx.transactionId = id
    return tx.transactionId
  }

  override async insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(commission, trx)
    if (e.commissionId === 0) delete e.commissionId
    const [id] = await this.toDb(trx)<table.Commission>('commissions').insert(e)
    commission.commissionId = id
    return commission.commissionId
  }

  override async insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(output, trx)
    if (e.outputId === 0) delete e.outputId
    const [id] = await this.toDb(trx)<table.Output>('outputs').insert(e)
    output.outputId = id
    return output.outputId
  }

  override async insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(tag, trx, undefined, ['isDeleted'])
    if (e.outputTagId === 0) delete e.outputTagId
    const [id] = await this.toDb(trx)<table.OutputTag>('output_tags').insert(e)
    tag.outputTagId = id
    return tag.outputTagId
  }

  override async insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void> {
    const e = await this.validateEntityForInsert(tagMap, trx, undefined, ['isDeleted'])
    const [id] = await this.toDb(trx)<table.OutputTagMap>('output_tags_map').insert(e)
  }

  override async insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(label, trx, undefined, ['isDeleted'])
    if (e.txLabelId === 0) delete e.txLabelId
    const [id] = await this.toDb(trx)<table.TxLabel>('tx_labels').insert(e)
    label.txLabelId = id
    return label.txLabelId
  }

  override async insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void> {
    const e = await this.validateEntityForInsert(labelMap, trx, undefined, ['isDeleted'])
    const [id] = await this.toDb(trx)<table.TxLabelMap>('tx_labels_map').insert(e)
  }

  override async insertWatchmanEvent(event: table.WatchmanEvent, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(event, trx)
    if (e.id === 0) delete e.id
    const [id] = await this.toDb(trx)<table.WatchmanEvent>('watchman_events').insert(e)
    event.id = id
    return event.id
  }

  override async insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken): Promise<number> {
    const e = await this.validateEntityForInsert(syncState, trx, ['when'], ['init'])
    if (e.syncStateId === 0) delete e.syncStateId
    const [id] = await this.toDb(trx)<table.SyncState>('sync_states').insert(e)
    syncState.syncStateId = id
    return syncState.syncStateId
  }

  override async updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.CertificateField>('certificate_fields').where({ certificateId, fieldName }).update(this.validatePartialForUpdate(update))
  }
  override async updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.Certificate>('certificates').where({ certificateId: id }).update(this.validatePartialForUpdate(update, undefined, ['isDeleted']))
  }
  override async updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.Commission>('commissions').where({ commissionId: id }).update(this.validatePartialForUpdate(update))
  }
  override async updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.OutputBasket>('output_baskets').where({ basketId: id }).update(this.validatePartialForUpdate(update, undefined, ['isDeleted']))
  }
  override async updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.Output>('outputs').where({ outputId: id }).update(this.validatePartialForUpdate(update))
  }
  override async updateOutputTagMap(outputId: number, tagId: number, update: Partial<table.OutputTagMap>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.OutputTagMap>('output_tags_map').where({ outputId, outputTagId: tagId }).update(this.validatePartialForUpdate(update, undefined, ['isDeleted']))
  }
  override async updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.OutputTag>('output_tags').where({ outputTagId: id }).update(this.validatePartialForUpdate(update, undefined, ['isDeleted']))
  }
  override async updateProvenTxReq(id: number | number[], update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    let r: number
    if (Array.isArray(id)) {
        r = await this.toDb(trx)<table.ProvenTxReq>('proven_tx_reqs').whereIn('provenTxReqId', id).update(this.validatePartialForUpdate(update))
    } else if (Number.isInteger(id)) {
        r = await this.toDb(trx)<table.ProvenTxReq>('proven_tx_reqs').where({ 'provenTxReqId': id }).update(this.validatePartialForUpdate(update))
    } else {
        throw new sdk.WERR_INVALID_PARAMETER('id', 'transactionId or array of transactionId')
    }
    return r
  }
  override async updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.ProvenTx>('proven_txs').where({ provenTxId: id }).update(this.validatePartialForUpdate(update))
  }
  override async updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.SyncState>('sync_states')
      .where({ syncStateId: id })
      .update(this.validatePartialForUpdate(update, ['when'], ['init']))
  }
  override async updateTransaction(id: number | number[], update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    let r: number
    if (Array.isArray(id)) {
        r = await this.toDb(trx)<table.Transaction>('transactions').whereIn('transactionId', id).update(await this.validatePartialForUpdate(update))
    } else if (Number.isInteger(id)) {
        r = await this.toDb(trx)<table.Transaction>('transactions').where({ transactionId: id }).update(await this.validatePartialForUpdate(update))
    } else {
        throw new sdk.WERR_INVALID_PARAMETER('id', 'transactionId or array of transactionId')
    }
    return r
  }
  override async updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<table.TxLabelMap>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.TxLabelMap>('tx_labels_map').where({ transactionId, txLabelId }).update(this.validatePartialForUpdate(update, undefined, ['isDeleted']))
  }
  override async updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.TxLabel>('tx_labels').where({ txLabelId: id }).update(this.validatePartialForUpdate(update, undefined, ['isDeleted']))
  }
  override async updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.User>('users').where({ userId: id }).update(this.validatePartialForUpdate(update))
  }
  override async updateWatchmanEvent(id: number, update: Partial<table.WatchmanEvent>, trx?: sdk.TrxToken): Promise<number> {
    await this.verifyReadyForDatabaseAccess(trx)
    return await this.toDb(trx)<table.WatchmanEvent>('watchman_events').where({ id }).update(this.validatePartialForUpdate(update))
  }

  setupQuery<T extends object>(table: string, args: sdk.FindPartialSincePagedArgs<T>): Knex.QueryBuilder {
    let q = this.toDb(args.trx)<T>(table)
    if (args.partial && Object.keys(args.partial).length > 0) q.where(args.partial)
    if (args.since) q.where('updated_at', '>=', this.validateDateForWhere(args.since))
    if (args.paged) {
      q.limit(args.paged.limit)
      q.offset(args.paged.offset || 0)
    }
    return q
  }

  findCertificateFieldsQuery(args: sdk.FindCertificateFieldsArgs): Knex.QueryBuilder {
    return this.setupQuery('certificate_fields', args)
  }
  findCertificatesQuery(args: sdk.FindCertificatesArgs): Knex.QueryBuilder {
    const q = this.setupQuery('certificates', args)
    if (args.certifiers && args.certifiers.length > 0) q.whereIn('certifier', args.certifiers)
    if (args.types && args.types.length > 0) q.whereIn('type', args.types)
    return q
  }
  findCommissionsQuery(args: sdk.FindCommissionsArgs): Knex.QueryBuilder {
    if (args.partial.lockingScript) throw new sdk.WERR_INVALID_PARAMETER('partial.lockingScript', `undefined. Commissions may not be found by lockingScript value.`)
    return this.setupQuery('commissions', args)
  }
  findOutputBasketsQuery(args: sdk.FindOutputBasketsArgs): Knex.QueryBuilder {
    return this.setupQuery('output_baskets', args)
  }
  findOutputsQuery(args: sdk.FindOutputsArgs, count?: boolean): Knex.QueryBuilder {
    if (args.partial.lockingScript) throw new sdk.WERR_INVALID_PARAMETER('args.partial.lockingScript', `undefined. Outputs may not be found by lockingScript value.`)
    const q = this.setupQuery('outputs', args)
    if (args.txStatus && args.txStatus.length > 0) {
      q.whereRaw(`(select status from transactions where transactions.transactionId = outputs.transactionId) in (${args.txStatus.map(s => `'${s}'`).join(',')})`)
    }
    if (args.noScript && !count) {
      const columns = table.outputColumnsWithoutLockingScript.map(c => `outputs.${c}`)
      q.select(columns)
    }
    return q
  }
  findOutputTagMapsQuery(args: sdk.FindOutputTagMapsArgs): Knex.QueryBuilder {
    const q = this.setupQuery('output_tags_map', args)
    if (args.tagIds && args.tagIds.length > 0) q.whereIn('outputTagId', args.tagIds)
    return q
  }
  findOutputTagsQuery(args: sdk.FindOutputTagsArgs): Knex.QueryBuilder {
    return this.setupQuery('output_tags', args)
  }
  findProvenTxReqsQuery(args: sdk.FindProvenTxReqsArgs): Knex.QueryBuilder {
    if (args.partial.rawTx) throw new sdk.WERR_INVALID_PARAMETER('args.partial.rawTx', `undefined. ProvenTxReqs may not be found by rawTx value.`)
    if (args.partial.inputBEEF) throw new sdk.WERR_INVALID_PARAMETER('args.partial.inputBEEF', `undefined. ProvenTxReqs may not be found by inputBEEF value.`)
    const q = this.setupQuery('proven_tx_reqs', args)
    if (args.status && args.status.length > 0) q.whereIn('status', args.status)
    if (args.txids && args.txids.length > 0) q.whereIn('txid', args.txids)
    return q
  }
  findProvenTxsQuery(args: sdk.FindProvenTxsArgs): Knex.QueryBuilder {
    if (args.partial.rawTx) throw new sdk.WERR_INVALID_PARAMETER('args.partial.rawTx', `undefined. ProvenTxs may not be found by rawTx value.`)
    if (args.partial.merklePath) throw new sdk.WERR_INVALID_PARAMETER('args.partial.merklePath', `undefined. ProvenTxs may not be found by merklePath value.`)
    return this.setupQuery('proven_txs', args)
  }
  findSyncStatesQuery(args: sdk.FindSyncStatesArgs): Knex.QueryBuilder {
    return this.setupQuery('sync_states', args)
  }
  findTransactionsQuery(args: sdk.FindTransactionsArgs, count?: boolean): Knex.QueryBuilder {
    if (args.partial.rawTx) throw new sdk.WERR_INVALID_PARAMETER('args.partial.rawTx', `undefined. Transactions may not be found by rawTx value.`)
    if (args.partial.inputBEEF) throw new sdk.WERR_INVALID_PARAMETER('args.partial.inputBEEF', `undefined. Transactions may not be found by inputBEEF value.`)
    const q = this.setupQuery('transactions', args)
    if (args.status && args.status.length > 0) q.whereIn('status', args.status)
    if (args.noRawTx && !count) {
      const columns = table.transactionColumnsWithoutRawTx.map(c => `transactions.${c}`)
      q.select(columns)
    }
    return q
  }
  findTxLabelMapsQuery(args: sdk.FindTxLabelMapsArgs): Knex.QueryBuilder {
    const q = this.setupQuery('tx_labels_map', args)
    if (args.labelIds && args.labelIds.length > 0) q.whereIn('txLabelId', args.labelIds)
    return q
  }
  findTxLabelsQuery(args: sdk.FindTxLabelsArgs): Knex.QueryBuilder {
    return this.setupQuery('tx_labels', args)
  }
  findUsersQuery(args: sdk.FindUsersArgs): Knex.QueryBuilder {
    return this.setupQuery('users', args)
  }
  findWatchmanEventsQuery(args: sdk.FindWatchmanEventsArgs): Knex.QueryBuilder {
    return this.setupQuery('watchman_events', args)
  }

  override async findCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<table.CertificateField[]> {
    return this.validateEntities(await this.findCertificateFieldsQuery(args))
  }
  override async findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]> {
    const q = this.findCertificatesQuery(args)
    const r = await q
    return this.validateEntities(r, undefined, ['isDeleted'])
  }
  override async findCommissions(args: sdk.FindCommissionsArgs): Promise<table.Commission[]> {
    const q = this.findCommissionsQuery(args)
    const r = await q
    return this.validateEntities(r, undefined, ['isRedeemed'])
  }
  override async findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]> {
    const q = this.findOutputBasketsQuery(args)
    const r = await q
    return this.validateEntities(r, undefined, ['isDeleted'])
  }
  override async findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]> {
    const q = this.findOutputsQuery(args)
    const r = await q
    if (!args.noScript) {
      for (const o of r) {
        await this.validateOutputScript(o, args.trx)
      }
    }
    return this.validateEntities(r, undefined, ['spendable', 'change'])
  }
  override async findOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<table.OutputTagMap[]> {
    const q = this.findOutputTagMapsQuery(args)
    const r = await q
    return this.validateEntities(r, undefined, ['isDeleted'])
  }
  override async findOutputTags(args: sdk.FindOutputTagsArgs): Promise<table.OutputTag[]> {
    const q = this.findOutputTagsQuery(args)
    const r = await q
    return this.validateEntities(r, undefined, ['isDeleted'])
  }
  override async findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]> {
    const q = this.findProvenTxReqsQuery(args)
    const r = await q
    return this.validateEntities(r, undefined, ['notified'])
  }
  override async findProvenTxs(args: sdk.FindProvenTxsArgs): Promise<table.ProvenTx[]> {
    const q = this.findProvenTxsQuery(args)
    const r = await q
    return this.validateEntities(r)
  }
  override async findSyncStates(args: sdk.FindSyncStatesArgs): Promise<table.SyncState[]> {
    const q = this.findSyncStatesQuery(args)
    const r = await q
    return this.validateEntities(r, ['when'], ['init'])
  }
  override async findTransactions(args: sdk.FindTransactionsArgs): Promise<table.Transaction[]> {
    const q = this.findTransactionsQuery(args)
    const r = await q
    if (!args.noRawTx) {
      for (const t of r) {
        await this.validateRawTransaction(t, args.trx)
      }
    }
    return this.validateEntities(r, undefined, ['isOutgoing'])
  }
  override async findTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<table.TxLabelMap[]> {
    const q = this.findTxLabelMapsQuery(args)
    const r = await q
    return this.validateEntities(r, undefined, ['isDeleted'])
  }
  override async findTxLabels(args: sdk.FindTxLabelsArgs): Promise<table.TxLabel[]> {
    const q = this.findTxLabelsQuery(args)
    const r = await q
    return this.validateEntities(r, undefined, ['isDeleted'])
  }
  override async findUsers(args: sdk.FindUsersArgs): Promise<table.User[]> {
    const q = this.findUsersQuery(args)
    const r = await q
    return this.validateEntities(r)
  }
  override async findWatchmanEvents(args: sdk.FindWatchmanEventsArgs): Promise<table.WatchmanEvent[]> {
    const q = this.findWatchmanEventsQuery(args)
    const r = await q
    return this.validateEntities(r, ['when'], undefined)
  }

  async getCount<T extends object>(q: Knex.QueryBuilder<T, T[]>): Promise<number> {
    q.count()
    const r = await q
    return r[0]['count(*)']
  }

  override async countCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<number> {
    return await this.getCount(this.findCertificateFieldsQuery(args))
  }
  override async countCertificates(args: sdk.FindCertificatesArgs): Promise<number> {
    return await this.getCount(this.findCertificatesQuery(args))
  }
  override async countCommissions(args: sdk.FindCommissionsArgs): Promise<number> {
    return await this.getCount(this.findCommissionsQuery(args))
  }
  override async countOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<number> {
    return await this.getCount(this.findOutputBasketsQuery(args))
  }
  override async countOutputs(args: sdk.FindOutputsArgs): Promise<number> {
    return await this.getCount(this.findOutputsQuery(args, true))
  }
  override async countOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<number> {
    return await this.getCount(this.findOutputTagMapsQuery(args))
  }
  override async countOutputTags(args: sdk.FindOutputTagsArgs): Promise<number> {
    return await this.getCount(this.findOutputTagsQuery(args))
  }
  override async countProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<number> {
    return await this.getCount(this.findProvenTxReqsQuery(args))
  }
  override async countProvenTxs(args: sdk.FindProvenTxsArgs): Promise<number> {
    return await this.getCount(this.findProvenTxsQuery(args))
  }
  override async countSyncStates(args: sdk.FindSyncStatesArgs): Promise<number> {
    return await this.getCount(this.findSyncStatesQuery(args))
  }
  override async countTransactions(args: sdk.FindTransactionsArgs): Promise<number> {
    return await this.getCount(this.findTransactionsQuery(args, true))
  }
  override async countTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<number> {
    return await this.getCount(this.findTxLabelMapsQuery(args))
  }
  override async countTxLabels(args: sdk.FindTxLabelsArgs): Promise<number> {
    return await this.getCount(this.findTxLabelsQuery(args))
  }
  override async countUsers(args: sdk.FindUsersArgs): Promise<number> {
    return await this.getCount(this.findUsersQuery(args))
  }
  override async countWatchmanEvents(args: sdk.FindWatchmanEventsArgs): Promise<number> {
    return await this.getCount(this.findWatchmanEventsQuery(args))
  }

  override async destroy(): Promise<void> {
    await this.knex?.destroy()
  }

  override async migrate(storageName: string): Promise<string> {
    const config = {
      migrationSource: new KnexMigrations(this.chain, storageName, 1024)
    }
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
        break
      }
    }
  }

  override async transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T> {
    if (trx) return await scope(trx)

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

  async validateRawTransaction(t: table.Transaction, trx?: sdk.TrxToken): Promise<void> {
    // if there is no txid or there is a rawTransaction return what we have.
    if (t.rawTx || !t.txid) return

    // rawTransaction is missing, see if we moved it ...

    const rawTx = await this.getRawTxOfKnownValidTransaction(t.txid, undefined, undefined, trx)
    if (!rawTx) return
    t.rawTx = rawTx
  }

  async validateOutputScript(o: table.Output, trx?: sdk.TrxToken): Promise<void> {
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
  async verifyReadyForDatabaseAccess(trx?: sdk.TrxToken): Promise<DBType> {
    if (!this._settings) {
      this._settings = await this.readSettings()

      // Make sure foreign key constraint checking is turned on in SQLite.
      if (this._settings.dbtype === 'SQLite') {
        await this.toDb(trx).raw('PRAGMA foreign_keys = ON;')
      }
    }

    return this._settings.dbtype
  }

  /**
   * Helper to force uniform behavior across database engines.
   * Use to process the update template for entities being updated.
   */
  validatePartialForUpdate<T extends sdk.EntityTimeStamp>(update: Partial<T>, dateFields?: string[], booleanFields?: string[]): Partial<T> {
    if (!this.dbtype) throw new sdk.WERR_INTERNAL('must call verifyReadyForDatabaseAccess first')
    const v: any = update
    if (v.created_at) v.created_at = this.validateEntityDate(v.created_at)
    if (v.updated_at) v.updated_at = this.validateEntityDate(v.updated_at)
    if (!v.created_at) delete v.created_at
    if (!v.updated_at) v.updated_at = this.validateEntityDate(new Date())

    if (dateFields) {
      for (const df of dateFields) {
        if (v[df]) v[df] = this.validateOptionalEntityDate(v[df])
      }
    }
    if (booleanFields) {
      for (const df of booleanFields) {
        if (update[df] !== undefined) update[df] = !!update[df] ? 1 : 0
      }
    }
    for (const key of Object.keys(v)) {
      const val = v[key]
      if (Array.isArray(val) && (val.length === 0 || typeof val[0] === 'number')) {
        v[key] = Buffer.from(val)
      } else if (val === undefined) {
        v[key] = null
      }
    }
    this.isDirty = true
    return v
  }

  /**
   * Helper to force uniform behavior across database engines.
   * Use to process new entities being inserted into the database.
   */
  async validateEntityForInsert<T extends sdk.EntityTimeStamp>(entity: T, trx?: sdk.TrxToken, dateFields?: string[], booleanFields?: string[]): Promise<any> {
    await this.verifyReadyForDatabaseAccess(trx)
    const v: any = { ...entity }
    v.created_at = this.validateOptionalEntityDate(v.created_at, true)!
    v.updated_at = this.validateOptionalEntityDate(v.updated_at, true)!
    if (!v.created_at) delete v.created_at
    if (!v.updated_at) delete v.updated_at
    if (dateFields) {
      for (const df of dateFields) {
        if (v[df]) v[df] = this.validateOptionalEntityDate(v[df])
      }
    }
    if (booleanFields) {
      for (const df of booleanFields) {
        if (entity[df] !== undefined) entity[df] = !!entity[df] ? 1 : 0
      }
    }
    for (const key of Object.keys(v)) {
      const val = v[key]
      if (Array.isArray(val) && (val.length === 0 || typeof val[0] === 'number')) {
        v[key] = Buffer.from(val)
      } else if (val === undefined) {
        v[key] = null
      }
    }
    this.isDirty = true
    return v
  }

  override async getLabelsForTransactionId(transactionId?: number, trx?: sdk.TrxToken): Promise<table.TxLabel[]> {
    if (transactionId === undefined) return []
    const labels = await this.toDb(trx)<table.TxLabel>('tx_labels')
      .join('tx_labels_map', 'tx_labels_map.txLabelId', 'tx_labels.txLabelId')
      .where('tx_labels_map.transactionId', transactionId)
      .whereNot('tx_labels_map.isDeleted', true)
      .whereNot('tx_labels.isDeleted', true)
    return this.validateEntities(labels, undefined, ['isDeleted'])
  }

  async extendOutput(o: table.Output, includeBasket = false, includeTags = false, trx?: sdk.TrxToken): Promise<table.OutputX> {
    const ox = o as table.OutputX
    if (includeBasket && ox.basketId) ox.basket = await this.findOutputBasketById(o.basketId!, trx)
    if (includeTags) {
      ox.tags = await this.getTagsForOutputId(o.outputId)
    }
    return o
  }

  override async getTagsForOutputId(outputId: number, trx?: sdk.TrxToken): Promise<table.OutputTag[]> {
    const tags = await this.toDb(trx)<table.OutputTag>('output_tags')
      .join('output_tags_map', 'output_tags_map.outputTagId', 'output_tags.outputTagId')
      .where('output_tags_map.outputId', outputId)
      .whereNot('output_tags_map.isDeleted', true)
      .whereNot('output_tags.isDeleted', true)
    return this.validateEntities(tags, undefined, ['isDeleted'])
  }

  override async purgeData(params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults> {
    return await purgeData(this, params, trx)
  }

  /**
   *  Finds closest matching available change output to use as input for new transaction.
   *
   * Transactionally allocate the output such that
   */
  async countChangeInputs(userId: number, basketId: number, excludeSending: boolean): Promise<number> {
    const status: sdk.TransactionStatus[] = ['completed', 'unproven']
    if (!excludeSending) status.push('sending')
    const statusText = status.map(s => `'${s}'`).join(',')
    const txStatusCondition = `(SELECT status FROM transactions WHERE outputs.transactionId = transactions.transactionId) in (${statusText})`
    let q = this.knex<table.Output>('outputs').where({ userId, spendable: true, basketId }).whereRaw(txStatusCondition)
    const count = await this.getCount(q)
    return count
  }

  /**
   *  Finds closest matching available change output to use as input for new transaction.
   *
   * Transactionally allocate the output such that
   */
  async allocateChangeInput(userId: number, basketId: number, targetSatoshis: number, exactSatoshis: number | undefined, excludeSending: boolean, transactionId: number): Promise<table.Output | undefined> {
    const status: sdk.TransactionStatus[] = ['completed', 'unproven']
    if (!excludeSending) status.push('sending')
    const statusText = status.map(s => `'${s}'`).join(',')

    const r: table.Output | undefined = await this.knex.transaction(async trx => {
      const txStatusCondition = `AND (SELECT status FROM transactions WHERE outputs.transactionId = transactions.transactionId) in (${statusText})`

      let outputId: number | undefined
      const setOutputId = async (rawQuery: string): Promise<void> => {
        let oidr = await trx.raw(rawQuery)
        outputId = undefined
        if (!oidr['outputId'] && oidr.length > 0) oidr = oidr[0]
        if (!oidr['outputId'] && oidr.length > 0) oidr = oidr[0]
        if (oidr['outputId']) outputId = Number(oidr['outputId'])
      }

      if (exactSatoshis !== undefined) {
        // Find outputId of output that with exactSatoshis
        await setOutputId(`
                SELECT outputId 
                FROM outputs
                WHERE userId = ${userId} 
                    AND spendable = 1 
                    AND basketId = ${basketId}
                    ${txStatusCondition}
                    AND satoshis = ${exactSatoshis}
                LIMIT 1;
                `)
      }

      if (outputId === undefined) {
        // Find outputId of output that would at least fund targetSatoshis
        await setOutputId(`
                    SELECT outputId 
                    FROM outputs
                    WHERE userId = ${userId} 
                        AND spendable = 1 
                        AND basketId = ${basketId}
                        ${txStatusCondition}
                        AND satoshis - ${targetSatoshis} = (
                            SELECT MIN(satoshis - ${targetSatoshis}) 
                            FROM outputs 
                            WHERE userId = ${userId} 
                            AND spendable = 1 
                            AND basketId = ${basketId}
                            ${txStatusCondition}
                            AND satoshis - ${targetSatoshis} >= 0
                        )
                    LIMIT 1;
                    `)
      }

      if (outputId === undefined) {
        // Find outputId of output that would add the most fund targetSatoshis
        await setOutputId(`
                    SELECT outputId 
                    FROM outputs
                    WHERE userId = ${userId} 
                        AND spendable = 1 
                        AND basketId = ${basketId}
                        ${txStatusCondition}
                        AND satoshis - ${targetSatoshis} = (
                            SELECT MAX(satoshis - ${targetSatoshis}) 
                            FROM outputs 
                            WHERE userId = ${userId} 
                            AND spendable = 1 
                            AND basketId = ${basketId}
                            ${txStatusCondition}
                            AND satoshis - ${targetSatoshis} < 0
                        )
                    LIMIT 1;
                    `)
      }

      if (outputId === undefined) return undefined

      await this.updateOutput(
        outputId,
        {
          spendable: false,
          spentBy: transactionId
        },
        trx
      )

      const r = verifyTruthy(await this.findOutputById(outputId, trx))
      return r
    })

    return r
  }
}

export type DBType = 'SQLite' | 'MySQL'

type DbEntityTimeStamp<T extends sdk.EntityTimeStamp> = {
  [K in keyof T]: T[K] extends Date ? Date | string : T[K]
}
