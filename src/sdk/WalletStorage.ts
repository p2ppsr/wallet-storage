import { sdk, table } from "..";

export interface WalletStorage {

   destroy(): Promise<void>
   migrate(storageName: string): Promise<string>
   transaction<T>(scope: (trx: TrxToken) => Promise<T>, trx?: TrxToken): Promise<T>

   getSettings(trx?: sdk.TrxToken): Promise<table.Settings>

   listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
   listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult>

   createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<StorageCreateTransactionSdkResult>
   processActionSdk(params: StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<StorageProcessActionSdkResults>

   insertProvenTx(tx: table.ProvenTx, trx?: TrxToken): Promise<number>
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
   insertTxLabel(label: table.TxLabel, trx?: sdk.TrxToken) : Promise<number>
   insertTxLabelMap(labelMap: table.TxLabelMap, trx?: sdk.TrxToken) : Promise<void>
}

/**
 * Place holder for the transaction control object used by actual storage provider implementation.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TrxToken {
}

export type StorageProvidedBy = 'you' | 'storage' | 'you-and-storage'

export interface StorageCreateTransactionSdkInput {
   vin: number
   sourceTxid: string
   sourceVout: number
   sourceSatoshis: number
   sourceLockingScript: string
   unlockingScriptLength: number
   providedBy: StorageProvidedBy
   type: string
   spendingDescription?: string
   derivationPrefix?: string
   derivationSuffix?: string
   senderIdentityKey?: string
}

export interface StorageCreateTransactionSdkOutput extends sdk.ValidCreateActionOutput {
   vout: number
   providedBy: StorageProvidedBy
   purpose?: string
   derivationSuffix?: string
}

export interface StorageCreateTransactionSdkResult {
   inputBeef?: number[]
   inputs: StorageCreateTransactionSdkInput[]
   outputs: StorageCreateTransactionSdkOutput[]
   noSendChangeOutputVouts?: number[]
   derivationPrefix: string
   version: number
   lockTime: number
   referenceNumber: string
}

export interface StorageProcessActionSdkParams {
   isNewTx: boolean
   isSendWith: boolean
   isNoSend: boolean
   isDelayed: boolean
   reference?: string
   txid?: string
   rawTx?: number[]
   sendWith: string[]
   log?: string
}

export interface StorageProcessActionSdkResults {
   sendWithResults?: sdk.SendWithResult[]
   log?: string
}
