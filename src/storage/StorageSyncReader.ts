import { sdk, StorageBaseOptions, table } from "..";

export abstract class StorageSyncReader {
    chain: sdk.Chain
    settings?: table.Settings
    whenLastAccess?: Date

    constructor(options: StorageBaseOptions) {
        this.chain = options.chain
    }

    abstract destroy(): Promise<void>

    abstract transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T>

    /////////////////
    //
    // READ OPERATIONS (state preserving methods)
    //
    /////////////////

    abstract getSettings(trx?: sdk.TrxToken): Promise<table.Settings>
}