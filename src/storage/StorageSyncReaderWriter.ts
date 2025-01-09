import { DBType, sdk, StorageBaseOptions, StorageBaseReader, StorageSyncReader, table, validateSecondsSinceEpoch, verifyTruthy } from "..";

/**
 * The `StorageSyncReader` non-abstract class must be used when authentication checking access to the methods of a `StorageBaseReader` is required.
 * 
 * Constructed from an `auth` object that must minimally include the authenticated user's identityKey,
 * and the `StorageBaseReader` to be protected.
 */
export class StorageSyncReaderWriter extends StorageSyncReader implements sdk.StorageSyncReaderWriter {

    constructor(auth: sdk.AuthId, public writer: StorageBaseReader) {
        super(auth, writer)
    }

}