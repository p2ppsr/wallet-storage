import { sdk } from "..";
import { Settings, ProvenTx, ProvenTxReq, User, Certificate, CertificateField, OutputBasket, Transaction, Commission, Output, OutputTag, OutputTagMap, TxLabel, TxLabelMap, SyncState, WatchmanEvent } from "./schema/tables";

export class WalletStorage implements sdk.WalletStorage {
    updateCertificateField(certificateId: number, fieldName: string, update: Partial<CertificateField>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateCertificate(id: number, update: Partial<Certificate>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateCommission(id: number, update: Partial<Commission>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateOutputBasket(id: number, update: Partial<OutputBasket>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateOutput(id: number, update: Partial<Output>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateOutputTagMap(outputId: number, tagId: number, update: Partial<OutputTagMap>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateOutputTag(id: number, update: Partial<OutputTag>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateProvenTxReq(id: number, update: Partial<ProvenTxReq>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateProvenTx(id: number, update: Partial<ProvenTx>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateSyncState(id: number, update: Partial<SyncState>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateTransaction(id: number, update: Partial<Transaction>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateTxLabelMap(transactionId: number, txLabelId: number, update: Partial<TxLabelMap>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateTxLabel(id: number, update: Partial<TxLabel>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateUser(id: number, update: Partial<User>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    updateWatchmanEvent(id: number, update: Partial<WatchmanEvent>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    destroy(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult> {
        throw new Error("Method not implemented.");
    }
    processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults> {
        throw new Error("Method not implemented.");
    }
    insertProvenTx(tx: ProvenTx, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertProvenTxReq(tx: ProvenTxReq, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertUser(user: User, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertCertificate(certificate: Certificate, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertCertificateField(certificateField: CertificateField, trx?: sdk.TrxToken): Promise<void> {
        throw new Error("Method not implemented.");
    }
    insertOutputBasket(basket: OutputBasket, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertTransaction(tx: Transaction, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertCommission(commission: Commission, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertOutput(output: Output, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertOutputTag(tag: OutputTag, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertOutputTagMap(tagMap: OutputTagMap, trx?: sdk.TrxToken): Promise<void> {
        throw new Error("Method not implemented.");
    }
    insertTxLabel(label: TxLabel, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertTxLabelMap(labelMap: TxLabelMap, trx?: sdk.TrxToken): Promise<void> {
        throw new Error("Method not implemented.");
    }
    insertWatchmanEvent(event: WatchmanEvent, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    insertSyncState(syncState: SyncState, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    dropAllData(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    migrate(storageName: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getSettings(trx?: sdk.TrxToken): Promise<Settings> {
        throw new Error("Method not implemented.");
    }
    getProvenOrRawTx(txid: string, trx?: sdk.TrxToken) {
        throw new Error("Method not implemented.");
    }
    getRawTxOfKnownValidTransaction(txid?: string, offset?: number, length?: number, trx?: sdk.TrxToken) {
        throw new Error("Method not implemented.");
    }
    transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T> {
        throw new Error("Method not implemented.");
    }
    listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult> {
        throw new Error("Method not implemented.");
    }
    listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> {
        throw new Error("Method not implemented.");
    }
    findCertificateFields(partial: Partial<CertificateField>, trx?: sdk.TrxToken): Promise<CertificateField[]> {
        throw new Error("Method not implemented.");
    }
    findCertificates(partial: Partial<Certificate>, certifiers?: string[], types?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<Certificate[]> {
        throw new Error("Method not implemented.");
    }
    findCommissions(partial: Partial<Commission>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<Commission[]> {
        throw new Error("Method not implemented.");
    }
    findOutputBaskets(partial: Partial<OutputBasket>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<OutputBasket[]> {
        throw new Error("Method not implemented.");
    }
    findOutputs(partial: Partial<Output>, noScript?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<Output[]> {
        throw new Error("Method not implemented.");
    }
    findOutputTagMaps(partial: Partial<OutputTagMap>, tagIds?: number[], trx?: sdk.TrxToken): Promise<OutputTagMap[]> {
        throw new Error("Method not implemented.");
    }
    findOutputTags(partial: Partial<OutputTag>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<OutputTag[]> {
        throw new Error("Method not implemented.");
    }
    findProvenTxReqs(partial: Partial<ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<ProvenTxReq[]> {
        throw new Error("Method not implemented.");
    }
    findProvenTxs(partial: Partial<ProvenTx>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<ProvenTx[]> {
        throw new Error("Method not implemented.");
    }
    findSyncStates(partial: Partial<SyncState>, trx?: sdk.TrxToken): Promise<SyncState[]> {
        throw new Error("Method not implemented.");
    }
    findTransactions(partial: Partial<Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<Transaction[]> {
        throw new Error("Method not implemented.");
    }
    findTxLabelMaps(partial: Partial<TxLabelMap>, labelIds?: number[], trx?: sdk.TrxToken): Promise<TxLabelMap[]> {
        throw new Error("Method not implemented.");
    }
    findTxLabels(partial: Partial<TxLabel>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<TxLabel[]> {
        throw new Error("Method not implemented.");
    }
    findUsers(partial: Partial<User>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<User[]> {
        throw new Error("Method not implemented.");
    }
    findWatchmanEvents(partial: Partial<WatchmanEvent>, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<WatchmanEvent[]> {
        throw new Error("Method not implemented.");
    }
    countCertificateFields(partial: Partial<CertificateField>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countCertificates(partial: Partial<Certificate>, certifiers?: string[], types?: string[], since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countCommissions(partial: Partial<Commission>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countOutputBaskets(partial: Partial<OutputBasket>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countOutputs(partial: Partial<Output>, noScript?: boolean, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countOutputTagMaps(partial: Partial<OutputTagMap>, tagIds?: number[], trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countOutputTags(partial: Partial<OutputTag>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countProvenTxReqs(partial: Partial<ProvenTxReq>, status?: sdk.ProvenTxReqStatus[], txids?: string[], since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countProvenTxs(partial: Partial<ProvenTx>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countSyncStates(partial: Partial<SyncState>, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countTransactions(partial: Partial<Transaction>, status?: sdk.TransactionStatus[], noRawTx?: boolean, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countTxLabelMaps(partial: Partial<TxLabelMap>, labelIds?: number[], trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countTxLabels(partial: Partial<TxLabel>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countUsers(partial: Partial<User>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }
    countWatchmanEvents(partial: Partial<WatchmanEvent>, since?: Date, trx?: sdk.TrxToken): Promise<number> {
        throw new Error("Method not implemented.");
    }

}