import * as bsv from '@bsv/sdk'
import { sdk, table } from "..";

export interface SignerStorage {

   abortActionSdk(vargs: sdk.ValidAbortActionArgs): Promise<sdk.AbortActionResult>
   createTransactionSdk(args: sdk.ValidCreateActionArgs): Promise<sdk.StorageCreateTransactionSdkResult>
   destroy(): Promise<void>
   getSettings(): table.Settings
   insertCertificate(certificate: table.CertificateX): Promise<number>
   internalizeActionSdk(sargs: sdk.StorageInternalizeActionArgs) : Promise<sdk.InternalizeActionResult>
   isAvailable() : boolean
   listActionsSdk(vargs: sdk.ValidListActionsArgs): Promise<sdk.ListActionsResult>
   listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs): Promise<sdk.ListCertificatesResult>
   listOutputsSdk(vargs: sdk.ValidListOutputsArgs): Promise<sdk.ListOutputsResult>
   makeAvailable() : Promise<void>
   migrate(storageName: string): Promise<string>
   processActionSdk(params: sdk.StorageProcessActionSdkParams): Promise<sdk.StorageProcessActionSdkResults>

   findCertificates(args: FindCertificatesArgs ): Promise<table.Certificate[]>
   findOrInsertUser(newUser: table.User) : Promise<{ user: table.User, isNew: boolean}>
   findOutputBaskets(args: FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
   findOutputs(args: FindOutputsArgs ): Promise<table.Output[]>
   isAvailable() : boolean
   setServices(v: sdk.WalletServices) : void
   updateCertificate(id: number, update: Partial<table.Certificate>) : Promise<number>
   updateOutput(id: number, update: Partial<table.Output>) : Promise<number>
}

export interface FindSincePagedArgs {
   since?: Date
   paged?: sdk.Paged
   trx?: sdk.TrxToken
}

export interface FindPartialSincePagedArgs<T extends object> {
   partial: Partial<T>
   since?: Date
   paged?: sdk.Paged
   trx?: sdk.TrxToken
}

export interface FindCertificatesArgs extends FindSincePagedArgs {
   partial: Partial<table.Certificate>
   certifiers?: string[]
   types?: string[]
}

export interface FindOutputBasketsArgs extends FindSincePagedArgs {
   partial: Partial<table.OutputBasket>
}

export interface FindOutputsArgs extends FindSincePagedArgs {
   partial: Partial<table.Output>
   noScript?: boolean
   txStatus?: sdk.TransactionStatus[]
}