import { sdk } from "..";

export interface WalletStorage {

   listActionsSdk(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.ListActionsResult>
   listOutputsSdk(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.ListOutputsResult>

   createTransactionSdk(args: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<StorageCreateTransactionSdkResult>
   processActionSdk(params: StorageProcessActionSdkParams, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<StorageProcessActionSdkResults>
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
