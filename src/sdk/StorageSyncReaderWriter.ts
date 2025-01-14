import { sdk, table } from "..";

/**
 * This is the minimal interface required for a WalletStorageProvider to import and export data to another provider.
 */
export interface StorageSyncReaderWriter extends sdk.StorageSyncReader {


    getProvenOrRawTx(txid: string, trx?: sdk.TrxToken): Promise<sdk.ProvenOrRawTx>

    purgeData(params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults>

    transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T>

    findOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<table.OutputTagMap[]>
    findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]>
    findProvenTxs(args: sdk.FindProvenTxsArgs): Promise<table.ProvenTx[]>
    findTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<table.TxLabelMap[]>

    countOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<number>
    countProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<number>
    countProvenTxs(args: sdk.FindProvenTxsArgs): Promise<number>
    countTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<number>

    insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number>
    insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number>
    insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number>
    insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken): Promise<number>
    insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void>
    insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number>
    insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number>
    insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number>
    insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number>
    insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number>
    insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void>
    insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number>
    insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void>
    insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken): Promise<number>

    updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>, trx?: sdk.TrxToken): Promise<number>
    updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken): Promise<number>
    updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken): Promise<number>
    updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken): Promise<number>
    updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken): Promise<number>
    updateOutputTagMap(outputId: number, tagId: number, update: Partial<table.OutputTagMap>, trx?: sdk.TrxToken): Promise<number>
    updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken): Promise<number>
    updateProvenTxReq(id: number | number[], update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number>
    updateProvenTxReqDynamics(id: number, update: Partial<table.ProvenTxReqDynamics>, trx?: sdk.TrxToken): Promise<number>
    updateProvenTxReqWithNewProvenTx(args: sdk.UpdateProvenTxReqWithNewProvenTxArgs): Promise<sdk.UpdateProvenTxReqWithNewProvenTxResult>
    updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number>
    updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number>
    updateTransaction(id: number | number[], update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number>
    updateTransactionStatus(status: sdk.TransactionStatus, transactionId?: number, userId?: number, reference?: string, trx?: sdk.TrxToken): Promise<void>
    updateTransactionsStatus(transactionIds: number[], status: sdk.TransactionStatus): Promise<void>
    updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<table.TxLabelMap>, trx?: sdk.TrxToken): Promise<number>
    updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken): Promise<number>
    updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken): Promise<number>

    findCertificateById(id: number, trx?: sdk.TrxToken): Promise<table.Certificate | undefined>
    findCommissionById(id: number, trx?: sdk.TrxToken): Promise<table.Commission | undefined>
    findOutputById(id: number, trx?: sdk.TrxToken, noScript?: boolean): Promise<table.Output | undefined>
    findOutputBasketById(id: number, trx?: sdk.TrxToken): Promise<table.OutputBasket | undefined>
    findProvenTxById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTx | undefined>
    findProvenTxReqById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTxReq | undefined>
    findSyncStateById(id: number, trx?: sdk.TrxToken): Promise<table.SyncState | undefined>
    findTransactionById(id: number, trx?: sdk.TrxToken, noRawTx?: boolean): Promise<table.Transaction | undefined>
    findTxLabelById(id: number, trx?: sdk.TrxToken): Promise<table.TxLabel | undefined>
    findOutputTagById(id: number, trx?: sdk.TrxToken): Promise<table.OutputTag | undefined>
    findUserById(id: number, trx?: sdk.TrxToken): Promise<table.User | undefined>

    findOrInsertUser(identityKey: string, trx?: sdk.TrxToken): Promise<{ user: table.User, isNew: boolean }>

    findOrInsertTransaction(newTx: table.Transaction, trx?: sdk.TrxToken): Promise<{ tx: table.Transaction, isNew: boolean }>
    findOrInsertOutputBasket(userId: number, name: string, trx?: sdk.TrxToken): Promise<table.OutputBasket>
    findOrInsertTxLabel(userId: number, label: string, trx?: sdk.TrxToken): Promise<table.TxLabel>
    findOrInsertTxLabelMap(transactionId: number, txLabelId: number, trx?: sdk.TrxToken): Promise<table.TxLabelMap>
    findOrInsertOutputTag(userId: number, tag: string, trx?: sdk.TrxToken): Promise<table.OutputTag>
    findOrInsertOutputTagMap(outputId: number, outputTagId: number, trx?: sdk.TrxToken): Promise<table.OutputTagMap>
    findOrInsertSyncStateAuth(auth: sdk.AuthId, storageIdentityKey: string, storageName: string): Promise<{ syncState: table.SyncState; isNew: boolean; }>
    findOrInsertProvenTxReq(newReq: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<{ req: table.ProvenTxReq, isNew: boolean }>
    findOrInsertProvenTx(newProven: table.ProvenTx, trx?: sdk.TrxToken): Promise<{ proven: table.ProvenTx, isNew: boolean }>
    findUsers(args: sdk.FindUsersArgs): Promise<table.User[]>

    tagOutput(partial: Partial<table.Output>, tag: string, trx?: sdk.TrxToken): Promise<void>

    processSyncChunk(args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk): Promise<sdk.ProcessSyncChunkResult>
}