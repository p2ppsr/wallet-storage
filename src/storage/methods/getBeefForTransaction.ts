import * as bsv from '@bsv/sdk'
import { asBsvSdkTx, entity, sdk, StorageBase, verifyTruthy } from '../..'

/**
 * Creates a `Beef` to support the validity of a transaction identified by its `txid`.
 * 
 * `dojo.storage` is used to retrieve proven transactions and their merkle paths,
 * or proven_tx_req record with beef of external inputs (internal inputs meged by recursion).
 * Otherwise external services are used.
 * 
 * `dojo.options.maxRecursionDepth` can be set to prevent overly deep chained dependencies. Will throw ERR_EXTSVS_ENVELOPE_DEPTH if exceeded.
 * 
 * If `trustSelf` is true, a partial `Beef` will be returned where transactions known by `dojo.storage` to
 * be valid by verified proof are represented solely by 'txid'.
 * 
 * If `knownTxids` is defined, any 'txid' required by the `Beef` that appears in the array is represented solely as a 'known' txid. 
 * 
 * @param storage the chain on which txid exists.
 * @param txid the transaction hash for which an envelope is requested.
 * @param options
 */
export async function getBeefForTransaction(storage: StorageBase, txid: string, options: sdk.StorageGetBeefOptions) : Promise<bsv.Beef>
{
    const beef =
        // deserialize mergeToBeef if it is an array
        Array.isArray(options.mergeToBeef) ? bsv.Beef.fromBinary(options.mergeToBeef)
        // otherwise if undefined create a new Beef
        : (options.mergeToBeef || new bsv.Beef())

    await mergeBeefForTransactionRecurse(beef, storage, txid, options, 0)

    return beef
}

/**
 * @returns rawTx if txid known to network, if merkle proof available then also proven result is valid.
 */
async function getProvenOrRawTxFromServices(dojo: StorageBase, txid: string, options: sdk.StorageGetBeefOptions): Promise<sdk.ProvenOrRawTx> {
    const services = dojo.getServices();
    const por = await entity.ProvenTx.fromTxid(txid, await dojo.getServices());
    if (por.proven && !options.ignoreStorage && !options.ignoreNewProven) {
        por.proven.provenTxId = await dojo.insertProvenTx(por.proven.toApi());
    }
    return { proven: por.proven?.toApi(), rawTx: por.rawTx };
}

async function mergeBeefForTransactionRecurse(
    beef: bsv.Beef,
    dojo: StorageBase,
    txid: string,
    options: sdk.StorageGetBeefOptions,
    recursionDepth: number
): Promise<bsv.Beef> {
    const maxDepth = dojo.maxRecursionDepth;
    if (maxDepth && maxDepth <= recursionDepth) throw new sdk.WERR_INVALID_OPERATION(`Maximum BEEF depth exceeded. Limit is ${dojo.maxRecursionDepth}`);

    if (options.knownTxids && options.knownTxids.indexOf(txid) > -1) {
        // This txid is one of the txids the caller claims to already know are valid...
        beef.mergeTxidOnly(txid);
        return beef
    }

    if (!options.ignoreStorage) {
        // if we can use storage, ask storage if it has the txid
        const knownBeef = await dojo.getValidBeefForTxid(txid, beef, options.trustSelf, options.knownTxids)
        if (knownBeef)
            return knownBeef
    }

    if (options.ignoreServices)
        throw new sdk.WERR_INVALID_PARAMETER(`txid ${txid}`, `valid transaction on chain ${dojo.chain}`);

    // if storage doesn't know about txid, use services
    // to find it and if it has a proof, remember it.
    const r = await getProvenOrRawTxFromServices(dojo, txid, options);

    if (r.proven && options.minProofLevel && options.minProofLevel > recursionDepth) {
        // ignore proof at this recursion depth
        r.proven = undefined;
    }

    if (r.proven) {
        // dojo has proven this txid,
        // merge both the raw transaction and its merkle path
        beef.mergeRawTx(r.proven.rawTx);
        beef.mergeBump(new entity.ProvenTx(r.proven).getMerklePath());
        return beef
    }
    
    if (!r.rawTx)
        throw new sdk.WERR_INVALID_PARAMETER(`txid ${txid}`, `valid transaction on chain ${dojo.chain}`);

    // merge the raw transaction and recurse over its inputs.
    beef.mergeRawTx(r.rawTx!);
    // recurse inputs
    const tx = asBsvSdkTx(r.rawTx!);
    for (const input of tx.inputs) {
        const inputTxid = verifyTruthy(input.sourceTXID);
        if (!beef.findTxid(inputTxid)) {
            // Only if the txid is not already in the list of beef transactions.
            await mergeBeefForTransactionRecurse(beef, dojo, inputTxid, options, recursionDepth + 1);
        }
    }

    return beef
}

