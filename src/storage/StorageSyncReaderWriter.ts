import { DBType, sdk, StorageBaseOptions, StorageBaseReader, StorageSyncReader, table, validateSecondsSinceEpoch, verifyTruthy } from "..";

/**
 * The `StorageSyncReader` non-abstract class must be used when authentication checking access to the methods of a `StorageBaseReader` is required.
 * 
 * Constructed from an `auth` object that must minimally include the authenticated user's identityKey,
 * and the `StorageBaseReader` to be protected.
 */
export abstract class StorageSyncReaderWriter extends StorageSyncReader implements sdk.StorageSyncReaderWriter {

    constructor(auth: sdk.AuthId, writer: StorageBaseReader) {
        super(auth, writer)
    }
    
    abstract getProvenOrRawTx(txid: string, trx?: sdk.TrxToken): Promise<sdk.ProvenOrRawTx> 
    abstract updateTransactionStatus(status: sdk.TransactionStatus, transactionId?: number, userId?: number, reference?: string, trx?: sdk.TrxToken): Promise<void> 
    abstract purgeData(params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults> 
    abstract transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T> 
    abstract findOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<table.OutputTagMap[]> 
    abstract findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]> 
    abstract findProvenTxs(args: sdk.FindProvenTxsArgs): Promise<table.ProvenTx[]> 
    abstract findTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<table.TxLabelMap[]> 
    abstract countOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<number> 
    abstract countProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<number> 
    abstract countProvenTxs(args: sdk.FindProvenTxsArgs): Promise<number> 
    abstract countTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<number> 
    abstract insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number> 
    abstract insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number> 
    abstract insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number> 
    abstract insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken): Promise<number> 
    abstract insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void> 
    abstract insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number> 
    abstract insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number> 
    abstract insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number> 
    abstract insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number> 
    abstract insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number> 
    abstract insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void> 
    abstract insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number> 
    abstract insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void> 
    abstract insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken): Promise<number> 
    abstract updateCertificateField(certificateId: number, fieldName: string, update: Partial<table.CertificateField>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateOutputTagMap(outputId: number, tagId: number, update: Partial<table.OutputTagMap>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateProvenTxReq(id: number | number[], update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateTransaction(id: number | number[], update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<table.TxLabelMap>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken): Promise<number> 
    abstract updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken): Promise<number> 
    abstract findCertificateById(id: number, trx?: sdk.TrxToken): Promise<table.Certificate | undefined> 
    abstract findCommissionById(id: number, trx?: sdk.TrxToken): Promise<table.Commission | undefined> 
    abstract findOutputById(id: number, trx?: sdk.TrxToken, noScript?: boolean): Promise<table.Output | undefined> 
    abstract findOutputBasketById(id: number, trx?: sdk.TrxToken): Promise<table.OutputBasket | undefined> 
    abstract findProvenTxById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTx | undefined> 
    abstract findProvenTxReqById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTxReq | undefined> 
    abstract findSyncStateById(id: number, trx?: sdk.TrxToken): Promise<table.SyncState | undefined> 
    abstract findTransactionById(id: number, trx?: sdk.TrxToken, noRawTx?: boolean): Promise<table.Transaction | undefined> 
    abstract findTxLabelById(id: number, trx?: sdk.TrxToken): Promise<table.TxLabel | undefined> 
    abstract findOutputTagById(id: number, trx?: sdk.TrxToken): Promise<table.OutputTag | undefined> 
    abstract findUserById(id: number, trx?: sdk.TrxToken): Promise<table.User | undefined> 
    abstract findOrInsertUser(identityKey: string, trx?: sdk.TrxToken): Promise<{ user: table.User; isNew: boolean; }> 
    abstract findOrInsertTransaction(newTx: table.Transaction, trx?: sdk.TrxToken): Promise<{ tx: table.Transaction; isNew: boolean; }> 
    abstract findOrInsertOutputBasket(userId: number, name: string, trx?: sdk.TrxToken): Promise<table.OutputBasket> 
    abstract findOrInsertTxLabel(userId: number, label: string, trx?: sdk.TrxToken): Promise<table.TxLabel> 
    abstract findOrInsertTxLabelMap(transactionId: number, txLabelId: number, trx?: sdk.TrxToken): Promise<table.TxLabelMap> 
    abstract findOrInsertOutputTag(userId: number, tag: string, trx?: sdk.TrxToken): Promise<table.OutputTag> 
    abstract findOrInsertOutputTagMap(outputId: number, outputTagId: number, trx?: sdk.TrxToken): Promise<table.OutputTagMap> 
    abstract findOrInsertSyncStateAuth(auth: sdk.AuthId, storageIdentityKey: string, storageName: string): Promise<{ syncState: table.SyncState; isNew: boolean; }> 
    abstract findOrInsertProvenTxReq(newReq: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<{ req: table.ProvenTxReq; isNew: boolean; }> 
    abstract findUsers(args: sdk.FindUsersArgs): Promise<table.User[]> 
    abstract processSyncChunk(args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk): Promise<sdk.ProcessSyncChunkResult> 
    abstract tagOutput(partial: Partial<table.Output>, tag: string, trx?: sdk.TrxToken): Promise<void> 

}