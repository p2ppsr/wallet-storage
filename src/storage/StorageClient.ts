/**
 * StorageClient.ts
 *
 * A client-side "remoted" WalletStorage that fulfills the WalletStorage interface
 * by sending JSON-RPC calls to a configured remote WalletStorageServer.
 */

import { sdk, table } from "..";
import { AuthFetch, Wallet } from '@bsv/sdk';

// We import the base interface:
import { SignerStorage } from "./SignerStorage" // Adjust this import path to where your local interface is declared

export class StorageClient implements sdk.WalletStorage {
    private endpointUrl: string
    private nextId = 1
    private authClient: AuthFetch

    // Track ephemeral (in-memory) "settings" if you wish to align with isAvailable() checks
    public settings?: table.Settings

    constructor(wallet: Wallet, endpointUrl: string) {
        this.authClient = new AuthFetch(wallet)
        this.endpointUrl = endpointUrl
    }

    //////////////////////////////////////////////////////////////////////////////
    // JSON-RPC helper
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Make a JSON-RPC call to the remote server.
     * @param method The WalletStorage method name to call.
     * @param params The array of parameters to pass to the method in order.
     */
    private async rpcCall<T>(method: string, params: unknown[]): Promise<T> {
        const id = this.nextId++
        const body = {
            jsonrpc: "2.0",
            method,
            params,
            id
        }

        const response = await this.authClient.fetch(this.endpointUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            throw new Error(`WalletStorageClient rpcCall: network error ${response.status} ${response.statusText}`)
        }

        const json = await response.json()
        if (json.error) {
            const { code, message, data } = json.error
            const err = new Error(`RPC Error: ${message}`)
                // You could attach more info here if you like:
                ; (err as any).code = code
                ; (err as any).data = data
            throw err
        }

        return json.result
    }

    //////////////////////////////////////////////////////////////////////////////
    // In a real environment, you might do lazy or real "makeAvailable" logic
    // For demonstration, we assume that the remote store might return its "settings"
    // and we store them locally in `this.settings`.
    //////////////////////////////////////////////////////////////////////////////

    isAvailable(): boolean {
        // We'll just say "yes" if we have settings
        return !!this.settings
    }

    async makeAvailable(): Promise<void> {
        // Try getSettings from remote to confirm.
        const settings = await this.getSettings()
        this.settings = settings
    }

    //////////////////////////////////////////////////////////////////////////////
    //
    // Implementation of all WalletStorage interface methods
    // They are simple pass-thrus to rpcCall
    //
    // IMPORTANT: The parameter ordering must match exactly as in your interface.
    //////////////////////////////////////////////////////////////////////////////

    async destroy(): Promise<void> {
        return this.rpcCall<void>("destroy", [])
    }

    async dropAllData(): Promise<void> {
        return this.rpcCall<void>("dropAllData", [])
    }

    async migrate(storageName: string): Promise<string> {
        return this.rpcCall<string>("migrate", [storageName])
    }

    async purgeData(params: sdk.PurgeParams, trx?: sdk.TrxToken): Promise<sdk.PurgeResults> {
        return this.rpcCall<sdk.PurgeResults>("purgeData", [params, trx])
    }

    getServices(): sdk.WalletServices {
        // Typically, the client would not store or retrieve "Services" from a remote server. 
        // The "services" in local in-memory usage is a no-op or your own approach:
        throw new Error("getServices() not implemented in remote client. This method typically is not used remotely.")
    }

    setServices(v: sdk.WalletServices): void {
        // Typically no-op for remote client
        // Because "services" are usually local definitions of Dojo or P2P connections.
        // If you want an advanced scenario, adapt it here.
        //
        throw new Error("setServices() not implemented in remote client.")
    }

    async updateTransactionStatus(
        status: sdk.TransactionStatus,
        transactionId?: number,
        userId?: number,
        reference?: string,
        trx?: sdk.TrxToken
    ): Promise<void> {
        return this.rpcCall<void>("updateTransactionStatus", [status, transactionId, userId, reference, trx])
    }

    async internalizeActionSdk(
        sargs: sdk.StorageInternalizeActionArgs,
        originator?: sdk.OriginatorDomainNameStringUnder250Bytes
    ): Promise<sdk.InternalizeActionResult> {
        return this.rpcCall<sdk.InternalizeActionResult>("internalizeActionSdk", [sargs, originator])
    }

    async createTransactionSdk(
        args: sdk.ValidCreateActionArgs,
        originator?: sdk.OriginatorDomainNameStringUnder250Bytes
    ): Promise<sdk.StorageCreateTransactionSdkResult> {
        return this.rpcCall<sdk.StorageCreateTransactionSdkResult>("createTransactionSdk", [args, originator])
    }

    async processActionSdk(
        params: sdk.StorageProcessActionSdkParams,
        originator?: sdk.OriginatorDomainNameStringUnder250Bytes
    ): Promise<sdk.StorageProcessActionSdkResults> {
        return this.rpcCall<sdk.StorageProcessActionSdkResults>("processActionSdk", [params, originator])
    }

    async abortActionSdk(
        vargs: sdk.ValidAbortActionArgs,
        originator?: sdk.OriginatorDomainNameStringUnder250Bytes
    ): Promise<sdk.AbortActionResult> {
        return this.rpcCall<sdk.AbortActionResult>("abortActionSdk", [vargs, originator])
    }

    async getProvenOrReq(txid: string, newReq?: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<sdk.StorageProvenOrReq> {
        return this.rpcCall<sdk.StorageProvenOrReq>("getProvenOrReq", [txid, newReq, trx])
    }

    async findOrInsertUser(newUser: table.User, trx?: sdk.TrxToken): Promise<{ user: table.User; isNew: boolean; }> {
        return this.rpcCall<{ user: table.User; isNew: boolean }>("findOrInsertUser", [newUser, trx])
    }

    async findOrInsertProvenTxReq(newReq: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<{ req: table.ProvenTxReq; isNew: boolean; }> {
        return this.rpcCall<{ req: table.ProvenTxReq; isNew: boolean }>("findOrInsertProvenTxReq", [newReq, trx])
    }

    async findOrInsertTransaction(
        newTx: table.Transaction,
        trx?: sdk.TrxToken
    ): Promise<{ tx: table.Transaction; isNew: boolean }> {
        return this.rpcCall<{ tx: table.Transaction; isNew: boolean }>("findOrInsertTransaction", [newTx, trx])
    }

    async findOrInsertOutputBasket(userId: number, name: string, trx?: sdk.TrxToken): Promise<table.OutputBasket> {
        return this.rpcCall<table.OutputBasket>("findOrInsertOutputBasket", [userId, name, trx])
    }

    async findOrInsertTxLabel(userId: number, label: string, trx?: sdk.TrxToken): Promise<table.TxLabel> {
        return this.rpcCall<table.TxLabel>("findOrInsertTxLabel", [userId, label, trx])
    }

    async findOrInsertTxLabelMap(
        transactionId: number,
        txLabelId: number,
        trx?: sdk.TrxToken
    ): Promise<table.TxLabelMap> {
        return this.rpcCall<table.TxLabelMap>("findOrInsertTxLabelMap", [transactionId, txLabelId, trx])
    }

    async findOrInsertOutputTag(userId: number, tag: string, trx?: sdk.TrxToken): Promise<table.OutputTag> {
        return this.rpcCall<table.OutputTag>("findOrInsertOutputTag", [userId, tag, trx])
    }

    async findOrInsertOutputTagMap(outputId: number, outputTagId: number, trx?: sdk.TrxToken): Promise<table.OutputTagMap> {
        return this.rpcCall<table.OutputTagMap>("findOrInsertOutputTagMap", [outputId, outputTagId, trx])
    }

    async tagOutput(partial: Partial<table.Output>, tag: string, trx?: sdk.TrxToken): Promise<void> {
        return this.rpcCall<void>("tagOutput", [partial, tag, trx])
    }

    // Insert / Update methods

    async insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertCertificate", [certificate, trx])
    }
    async insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken): Promise<void> {
        return this.rpcCall<void>("insertCertificateField", [certificateField, trx])
    }
    async insertCommission(commission: table.Commission, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertCommission", [commission, trx])
    }
    async insertOutput(output: table.Output, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertOutput", [output, trx])
    }
    async insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertOutputBasket", [basket, trx])
    }
    async insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertOutputTag", [tag, trx])
    }
    async insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken): Promise<void> {
        return this.rpcCall<void>("insertOutputTagMap", [tagMap, trx])
    }
    async insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertProvenTx", [tx, trx])
    }
    async insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertProvenTxReq", [tx, trx])
    }
    async insertSyncState(syncState: table.SyncState, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertSyncState", [syncState, trx])
    }
    async insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertTransaction", [tx, trx])
    }
    async insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertTxLabel", [label, trx])
    }
    async insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken): Promise<void> {
        return this.rpcCall<void>("insertTxLabelMap", [labelMap, trx])
    }
    async insertUser(user: table.User, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertUser", [user, trx])
    }
    async insertWatchmanEvent(event: table.WatchmanEvent, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("insertWatchmanEvent", [event, trx])
    }

    async updateCertificate(id: number, update: Partial<table.Certificate>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateCertificate", [id, update, trx])
    }
    async updateCertificateField(
        certificateId: number,
        fieldName: string,
        update: Partial<table.CertificateField>,
        trx?: sdk.TrxToken
    ): Promise<number> {
        return this.rpcCall<number>("updateCertificateField", [certificateId, fieldName, update, trx])
    }
    async updateCommission(id: number, update: Partial<table.Commission>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateCommission", [id, update, trx])
    }
    async updateOutput(id: number, update: Partial<table.Output>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateOutput", [id, update, trx])
    }
    async updateOutputBasket(id: number, update: Partial<table.OutputBasket>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateOutputBasket", [id, update, trx])
    }
    async updateOutputTag(id: number, update: Partial<table.OutputTag>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateOutputTag", [id, update, trx])
    }
    async updateOutputTagMap(
        outputId: number,
        tagId: number,
        update: Partial<table.OutputTagMap>,
        trx?: sdk.TrxToken
    ): Promise<number> {
        return this.rpcCall<number>("updateOutputTagMap", [outputId, tagId, update, trx])
    }
    async updateProvenTxReq(id: number, update: Partial<table.ProvenTxReq>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateProvenTxReq", [id, update, trx])
    }
    async updateProvenTx(id: number, update: Partial<table.ProvenTx>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateProvenTx", [id, update, trx])
    }
    async updateSyncState(id: number, update: Partial<table.SyncState>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateSyncState", [id, update, trx])
    }
    async updateTransaction(id: number, update: Partial<table.Transaction>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateTransaction", [id, update, trx])
    }
    async updateTxLabelMap(
        transactionId: number,
        txLabelId: number,
        update: Partial<table.TxLabelMap>,
        trx?: sdk.TrxToken
    ): Promise<number> {
        return this.rpcCall<number>("updateTxLabelMap", [transactionId, txLabelId, update, trx])
    }
    async updateTxLabel(id: number, update: Partial<table.TxLabel>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateTxLabel", [id, update, trx])
    }
    async updateUser(id: number, update: Partial<table.User>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateUser", [id, update, trx])
    }
    async updateWatchmanEvent(id: number, update: Partial<table.WatchmanEvent>, trx?: sdk.TrxToken): Promise<number> {
        return this.rpcCall<number>("updateWatchmanEvent", [id, update, trx])
    }

    //////////////////////////////////////////////////////////////////////////////
    // READ OPERATIONS
    //////////////////////////////////////////////////////////////////////////////

    _settings?: table.Settings

    getSettings(trx?: sdk.TrxToken): table.Settings {
        if (!this._settings)
            throw new sdk.WERR_INVALID_OPERATION('must call "makeAvailable" before accessing "settings"');
        return this._settings!
    }

    async getProvenOrRawTx(txid: string, trx?: sdk.TrxToken): Promise<sdk.ProvenOrRawTx> {
        return this.rpcCall<sdk.ProvenOrRawTx>("getProvenOrRawTx", [txid, trx])
    }

    async getRawTxOfKnownValidTransaction(
        txid?: string,
        offset?: number,
        length?: number,
        trx?: sdk.TrxToken
    ): Promise<number[] | undefined> {
        return this.rpcCall<number[] | undefined>("getRawTxOfKnownValidTransaction", [txid, offset, length, trx])
    }

    async getProvenTxsForUser(
        userId: number,
        since?: Date,
        paged?: sdk.Paged,
        trx?: sdk.TrxToken
    ): Promise<table.ProvenTx[]> {
        return this.rpcCall<table.ProvenTx[]>("getProvenTxsForUser", [userId, since, paged, trx])
    }

    async getProvenTxReqsForUser(
        userId: number,
        since?: Date,
        paged?: sdk.Paged,
        trx?: sdk.TrxToken
    ): Promise<table.ProvenTxReq[]> {
        return this.rpcCall<table.ProvenTxReq[]>("getProvenTxReqsForUser", [userId, since, paged, trx])
    }

    async getTxLabelMapsForUser(
        userId: number,
        since?: Date,
        paged?: sdk.Paged,
        trx?: sdk.TrxToken
    ): Promise<table.TxLabelMap[]> {
        return this.rpcCall<table.TxLabelMap[]>("getTxLabelMapsForUser", [userId, since, paged, trx])
    }

    async getOutputTagMapsForUser(
        userId: number,
        since?: Date,
        paged?: sdk.Paged,
        trx?: sdk.TrxToken
    ): Promise<table.OutputTagMap[]> {
        return this.rpcCall<table.OutputTagMap[]>("getOutputTagMapsForUser", [userId, since, paged, trx])
    }

    async getLabelsForTransactionId(transactionId?: number, trx?: sdk.TrxToken): Promise<table.TxLabel[]> {
        return this.rpcCall<table.TxLabel[]>("getLabelsForTransactionId", [transactionId, trx])
    }

    async getTagsForOutputId(outputId: number, trx?: sdk.TrxToken): Promise<table.OutputTag[]> {
        return this.rpcCall<table.OutputTag[]>("getTagsForOutputId", [outputId, trx])
    }

    async transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T> {
        // Typically you'd have to do a more advanced approach to hold open a remote transaction.
        // This code is a naive approach: we don't truly hold a transaction open. 
        // If you truly need "distributed transactions", you must adapt. 
        // For demonstration, we just call `scope(undefined)`.
        //
        // Another approach: create a remote "beginTransaction" / "commit" / "rollback" if your server
        // can handle it.
        return scope(undefined as unknown as sdk.TrxToken)
    }

    async listActionsSdk(
        vargs: sdk.ValidListActionsArgs,
        originator?: sdk.OriginatorDomainNameStringUnder250Bytes
    ): Promise<sdk.ListActionsResult> {
        return this.rpcCall<sdk.ListActionsResult>("listActionsSdk", [vargs, originator])
    }

    async listOutputsSdk(
        vargs: sdk.ValidListOutputsArgs,
        originator?: sdk.OriginatorDomainNameStringUnder250Bytes
    ): Promise<sdk.ListOutputsResult> {
        return this.rpcCall<sdk.ListOutputsResult>("listOutputsSdk", [vargs, originator])
    }

    async listCertificatesSdk(
        vargs: sdk.ValidListCertificatesArgs,
        originator?: sdk.OriginatorDomainNameStringUnder250Bytes
    ): Promise<sdk.ListCertificatesResult> {
        return this.rpcCall<sdk.ListCertificatesResult>("listCertificatesSdk", [vargs, originator])
    }

    async findCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<table.CertificateField[]> {
        return this.rpcCall<table.CertificateField[]>("findCertificateFields", [args])
    }

    async findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]> {
        return this.rpcCall<table.Certificate[]>("findCertificates", [args])
    }

    async findCommissions(args: sdk.FindCommissionsArgs): Promise<table.Commission[]> {
        return this.rpcCall<table.Commission[]>("findCommissions", [args])
    }

    async findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]> {
        return this.rpcCall<table.OutputBasket[]>("findOutputBaskets", [args])
    }

    async findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]> {
        return this.rpcCall<table.Output[]>("findOutputs", [args])
    }

    async findOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<table.OutputTagMap[]> {
        return this.rpcCall<table.OutputTagMap[]>("findOutputTagMaps", [args])
    }

    async findOutputTags(args: sdk.FindOutputTagsArgs): Promise<table.OutputTag[]> {
        return this.rpcCall<table.OutputTag[]>("findOutputTags", [args])
    }

    async findProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<table.ProvenTxReq[]> {
        return this.rpcCall<table.ProvenTxReq[]>("findProvenTxReqs", [args])
    }

    async findProvenTxs(args: sdk.FindProvenTxsArgs): Promise<table.ProvenTx[]> {
        return this.rpcCall<table.ProvenTx[]>("findProvenTxs", [args])
    }

    async findSyncStates(args: sdk.FindSyncStatesArgs): Promise<table.SyncState[]> {
        return this.rpcCall<table.SyncState[]>("findSyncStates", [args])
    }

    async findTransactions(args: sdk.FindTransactionsArgs): Promise<table.Transaction[]> {
        return this.rpcCall<table.Transaction[]>("findTransactions", [args])
    }

    async findTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<table.TxLabelMap[]> {
        return this.rpcCall<table.TxLabelMap[]>("findTxLabelMaps", [args])
    }

    async findTxLabels(args: sdk.FindTxLabelsArgs): Promise<table.TxLabel[]> {
        return this.rpcCall<table.TxLabel[]>("findTxLabels", [args])
    }

    async findUsers(args: sdk.FindUsersArgs): Promise<table.User[]> {
        return this.rpcCall<table.User[]>("findUsers", [args])
    }

    async findWatchmanEvents(args: sdk.FindWatchmanEventsArgs): Promise<table.WatchmanEvent[]> {
        return this.rpcCall<table.WatchmanEvent[]>("findWatchmanEvents", [args])
    }

    async findUserByIdentityKey(key: string, trx?: sdk.TrxToken): Promise<table.User | undefined> {
        return this.rpcCall<table.User | undefined>("findUserByIdentityKey", [key, trx])
    }

    async findCertificateById(id: number, trx?: sdk.TrxToken): Promise<table.Certificate | undefined> {
        return this.rpcCall<table.Certificate | undefined>("findCertificateById", [id, trx])
    }

    async findCommissionById(id: number, trx?: sdk.TrxToken): Promise<table.Commission | undefined> {
        return this.rpcCall<table.Commission | undefined>("findCommissionById", [id, trx])
    }

    async findOutputBasketById(id: number, trx?: sdk.TrxToken): Promise<table.OutputBasket | undefined> {
        return this.rpcCall<table.OutputBasket | undefined>("findOutputBasketById", [id, trx])
    }

    async findOutputById(
        id: number,
        trx?: sdk.TrxToken,
        noScript?: boolean
    ): Promise<table.Output | undefined> {
        return this.rpcCall<table.Output | undefined>("findOutputById", [id, trx, noScript])
    }

    async findOutputTagById(id: number, trx?: sdk.TrxToken): Promise<table.OutputTag | undefined> {
        return this.rpcCall<table.OutputTag | undefined>("findOutputTagById", [id, trx])
    }

    async findProvenTxById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTx | undefined> {
        return this.rpcCall<table.ProvenTx | undefined>("findProvenTxById", [id, trx])
    }

    async findProvenTxReqById(id: number, trx?: sdk.TrxToken | undefined): Promise<table.ProvenTxReq | undefined> {
        return this.rpcCall<table.ProvenTxReq | undefined>("findProvenTxReqById", [id, trx])
    }

    async findSyncStateById(id: number, trx?: sdk.TrxToken): Promise<table.SyncState | undefined> {
        return this.rpcCall<table.SyncState | undefined>("findSyncStateById", [id, trx])
    }

    async findTransactionById(
        id: number,
        trx?: sdk.TrxToken,
        noRawTx?: boolean
    ): Promise<table.Transaction | undefined> {
        return this.rpcCall<table.Transaction | undefined>("findTransactionById", [id, trx, noRawTx])
    }

    async findTxLabelById(id: number, trx?: sdk.TrxToken): Promise<table.TxLabel | undefined> {
        return this.rpcCall<table.TxLabel | undefined>("findTxLabelById", [id, trx])
    }

    async findUserById(id: number, trx?: sdk.TrxToken): Promise<table.User | undefined> {
        return this.rpcCall<table.User | undefined>("findUserById", [id, trx])
    }

    async findWatchmanEventById(id: number, trx?: sdk.TrxToken): Promise<table.WatchmanEvent | undefined> {
        return this.rpcCall<table.WatchmanEvent | undefined>("findWatchmanEventById", [id, trx])
    }

    async countCertificateFields(args: sdk.FindCertificateFieldsArgs): Promise<number> {
        return this.rpcCall<number>("countCertificateFields", [args])
    }

    async countCertificates(args: sdk.FindCertificatesArgs): Promise<number> {
        return this.rpcCall<number>("countCertificates", [args])
    }

    async countCommissions(args: sdk.FindCommissionsArgs): Promise<number> {
        return this.rpcCall<number>("countCommissions", [args])
    }

    async countOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<number> {
        return this.rpcCall<number>("countOutputBaskets", [args])
    }

    async countOutputs(args: sdk.FindOutputsArgs): Promise<number> {
        return this.rpcCall<number>("countOutputs", [args])
    }

    async countOutputTagMaps(args: sdk.FindOutputTagMapsArgs): Promise<number> {
        return this.rpcCall<number>("countOutputTagMaps", [args])
    }

    async countOutputTags(args: sdk.FindOutputTagsArgs): Promise<number> {
        return this.rpcCall<number>("countOutputTags", [args])
    }

    async countProvenTxReqs(args: sdk.FindProvenTxReqsArgs): Promise<number> {
        return this.rpcCall<number>("countProvenTxReqs", [args])
    }

    async countProvenTxs(args: sdk.FindProvenTxsArgs): Promise<number> {
        return this.rpcCall<number>("countProvenTxs", [args])
    }

    async countSyncStates(args: sdk.FindSyncStatesArgs): Promise<number> {
        return this.rpcCall<number>("countSyncStates", [args])
    }

    async countTransactions(args: sdk.FindTransactionsArgs): Promise<number> {
        return this.rpcCall<number>("countTransactions", [args])
    }

    async countTxLabelMaps(args: sdk.FindTxLabelMapsArgs): Promise<number> {
        return this.rpcCall<number>("countTxLabelMaps", [args])
    }

    async countTxLabels(args: sdk.FindTxLabelsArgs): Promise<number> {
        return this.rpcCall<number>("countTxLabels", [args])
    }

    async countUsers(args: sdk.FindUsersArgs): Promise<number> {
        return this.rpcCall<number>("countUsers", [args])
    }

    async countWatchmanEvents(args: sdk.FindWatchmanEventsArgs): Promise<number> {
        return this.rpcCall<number>("countWatchmanEvents", [args])
    }

    async requestSyncChunk(args: sdk.RequestSyncChunkArgs): Promise<sdk.RequestSyncChunkResult> {
        return this.rpcCall<sdk.RequestSyncChunkResult>("requestSyncChunk", [args])
    }
}
