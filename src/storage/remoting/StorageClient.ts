/**
 * StorageClient.ts
 *
 * A client-side "remoted" WalletStorage that fulfills the WalletStorage interface
 * by sending JSON-RPC calls to a configured remote WalletStorageServer.
 */

import { sdk, table } from "../..";
import { AuthFetch, Wallet } from '@bsv/sdk';

// We import the base interface:
import { WalletStorageManager } from "../WalletStorageManager" // Adjust this import path to where your local interface is declared

export class StorageClient implements sdk.WalletStorageProvider {
    private endpointUrl: string
    private nextId = 1
    private authClient: AuthFetch

    // Track ephemeral (in-memory) "settings" if you wish to align with isAvailable() checks
    public settings?: table.Settings

    constructor(wallet: Wallet, endpointUrl: string) {
        this.authClient = new AuthFetch(wallet)
        this.endpointUrl = endpointUrl
    }

    isStorageProvider(): boolean { return false }

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

    async makeAvailable(): Promise<table.Settings> {
        // Try getSettings from remote to confirm.
        const settings = await this.getSettings()
        this.settings = settings
        return settings
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

    async migrate(storageName: string): Promise<string> {
        return this.rpcCall<string>("migrate", [storageName])
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

    async internalizeAction(
        auth: sdk.AuthId,
        args: sdk.InternalizeActionArgs,
    ): Promise<sdk.InternalizeActionResult> {
        return this.rpcCall<sdk.InternalizeActionResult>("internalizeAction", [auth, args])
    }

    async createAction(
        auth: sdk.AuthId,
        args: sdk.ValidCreateActionArgs,
    ): Promise<sdk.StorageCreateActionResult> {
        return this.rpcCall<sdk.StorageCreateActionResult>("createAction", [auth, args])
    }

    async processAction(
        auth: sdk.AuthId,
        args: sdk.StorageProcessActionArgs,
    ): Promise<sdk.StorageProcessActionResults> {
        return this.rpcCall<sdk.StorageProcessActionResults>("processAction", [auth, args])
    }

    async abortAction(
        auth: sdk.AuthId,
        args: sdk.AbortActionArgs,
    ): Promise<sdk.AbortActionResult> {
        return this.rpcCall<sdk.AbortActionResult>("abortAction", [auth, args])
    }

    async findOrInsertUser(
        identityKey
    ): Promise<{ user: table.User; isNew: boolean; }> {
        return this.rpcCall<{ user: table.User; isNew: boolean }>("findOrInsertUser", [identityKey])
    }

    async findOrInsertSyncStateAuth(
        auth: sdk.AuthId,
        storageIdentityKey: string,
        storageName: string
    ): Promise<{ syncState: table.SyncState; isNew: boolean; }> {
        return this.rpcCall<{ syncState: table.SyncState; isNew: boolean }>("findOrInsertSyncStateAuth", [auth, storageIdentityKey, storageName])
    }

    async insertCertificateAuth(
        auth: sdk.AuthId,
        certificate: table.CertificateX
    ): Promise<number> {
        return this.rpcCall<number>("insertCertificateAuth", [auth, certificate])
    }

    _settings?: table.Settings

    getSettings(): table.Settings {
        if (!this._settings)
            throw new sdk.WERR_INVALID_OPERATION('must call "makeAvailable" before accessing "settings"');
        return this._settings!
    }

    async listActions(
        auth: sdk.AuthId,
        args: sdk.ListActionsArgs,
    ): Promise<sdk.ListActionsResult> {
        return this.rpcCall<sdk.ListActionsResult>("listActions", [auth, args])
    }

    async listOutputs(
        auth: sdk.AuthId,
        args: sdk.ListOutputsArgs,
    ): Promise<sdk.ListOutputsResult> {
        return this.rpcCall<sdk.ListOutputsResult>("listOutputs", [auth, args])
    }

    async listCertificates(
        auth: sdk.AuthId,
        args: sdk.ValidListCertificatesArgs,
    ): Promise<sdk.ListCertificatesResult> {
        return this.rpcCall<sdk.ListCertificatesResult>("listCertificates", [auth, args])
    }

    async findCertificatesAuth(
        auth: sdk.AuthId,
        args: sdk.FindCertificatesArgs
    ): Promise<table.Certificate[]> {
        return this.rpcCall<table.Certificate[]>("findCertificatesAuth", [auth, args])
    }

    async findOutputBasketsAuth(
        auth: sdk.AuthId,
        args: sdk.FindOutputBasketsArgs
    ): Promise<table.OutputBasket[]> {
        return this.rpcCall<table.OutputBasket[]>("findOutputBaskets", [auth, args])
    }

    async findOutputsAuth(
        auth: sdk.AuthId,
        args: sdk.FindOutputsArgs
    ): Promise<table.Output[]> {
        return this.rpcCall<table.Output[]>("findOutputsAuth", [auth, args])
    }

    findProvenTxReqs(
        args: sdk.FindProvenTxReqsArgs
    ): Promise<table.ProvenTxReq[]> {
        return this.rpcCall<table.ProvenTxReq[]>("findProvenTxReqs", [args])
    }

    async relinquishCertificate(
        auth: sdk.AuthId,
        args: sdk.RelinquishCertificateArgs
    ): Promise<number> {
        return this.rpcCall<number>("relinquishCertificate", [auth, args])
    }

    async relinquishOutput(
        auth: sdk.AuthId,
        args: sdk.RelinquishOutputArgs
    ): Promise<number> {
        return this.rpcCall<number>("relinquishOutput", [auth, args])
    }

    async processSyncChunk(
        args: sdk.RequestSyncChunkArgs,
        chunk: sdk.SyncChunk
    ): Promise<sdk.ProcessSyncChunkResult> {
        return this.rpcCall<sdk.ProcessSyncChunkResult>("processSyncChunk", [args, chunk])
    }

    async getSyncChunk(
        args: sdk.RequestSyncChunkArgs
    ): Promise<sdk.SyncChunk> {
        return this.rpcCall<sdk.SyncChunk>("getSyncChunk", [args])
    }

    async updateProvenTxReqWithNewProvenTx(
        args: sdk.UpdateProvenTxReqWithNewProvenTxArgs
    ): Promise<sdk.UpdateProvenTxReqWithNewProvenTxResult> {
        return this.rpcCall<sdk.UpdateProvenTxReqWithNewProvenTxResult>("updateProvenTxReqWithNewProvenTx", [args])
    }
}
