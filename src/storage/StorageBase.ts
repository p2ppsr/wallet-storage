import { sdk, table } from "..";

export abstract class StorageBase implements sdk.WalletStorage {

    static createStorageBaseOptions(chain: sdk.Chain) : StorageBaseOptions {
        const options: StorageBaseOptions = {
            chain
        }
        return options
    }

    isDirty = false
    whenLastAccess?: Date
    
    chain: sdk.Chain

    constructor(options: StorageBaseOptions) {
        this.chain = options.chain
    }

    abstract destroy(): Promise<void>
    abstract migrate(storageName: string): Promise<string>
    abstract transaction<T>(scope: (trx: sdk.TrxToken) => Promise<T>, trx?: sdk.TrxToken): Promise<T>

    abstract getSettings(trx?: sdk.TrxToken): Promise<table.Settings>

    abstract listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
    abstract listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult> 
    abstract createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageCreateTransactionSdkResult> 
    abstract processActionSdk(params: sdk.StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.StorageProcessActionSdkResults> 

    abstract insertProvenTx(tx: table.ProvenTx, trx?: sdk.TrxToken): Promise<number> 
    abstract insertProvenTxReq(tx: table.ProvenTxReq, trx?: sdk.TrxToken) : Promise<number>
    abstract insertUser(user: table.User, trx?: sdk.TrxToken) : Promise<number>
    abstract insertCertificate(certificate: table.Certificate, trx?: sdk.TrxToken) : Promise<number>
    abstract insertCertificateField(certificateField: table.CertificateField, trx?: sdk.TrxToken) : Promise<void>
    abstract insertOutputBasket(basket: table.OutputBasket, trx?: sdk.TrxToken) : Promise<number>
    abstract insertTransaction(tx: table.Transaction, trx?: sdk.TrxToken) : Promise<number>
    abstract insertCommission(commission: table.Commission, trx?: sdk.TrxToken) : Promise<number>
    abstract insertOutput(output: table.Output, trx?: sdk.TrxToken) : Promise<number>
    abstract insertOutputTag(tag: table.OutputTag, trx?: sdk.TrxToken) : Promise<number>
    abstract insertOutputTagMap(tagMap: table.OutputTagMap, trx?: sdk.TrxToken) : Promise<void>
    abstract insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken) : Promise<number>
    abstract insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken) : Promise<void>
}

export interface StorageBaseOptions {
    chain: sdk.Chain
}
