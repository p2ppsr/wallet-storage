import * as bsv from '@bsv/sdk'
import { sdk, table } from "..";

export interface UserStorage {

   isAvailable() : boolean
   makeAvailable() : Promise<void>
   migrate(storageName: string): Promise<string>
   destroy(): Promise<void>

   setServices(v: sdk.WalletServices) : void
   getSettings(): table.Settings

   abortAction(userId: number, args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult>
   createAction(userId: number, args: sdk.CreateActionArgs): Promise<sdk.StorageCreateTransactionSdkResult>
   processAction(userId: number, args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionSdkResults>
   internalizeAction(userId: number, sargs: sdk.StorageInternalizeActionArgs) : Promise<sdk.InternalizeActionResult>

   listActions(userId: number, args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult>
   listCertificates(userId: number, args: sdk.ListCertificatesArgs): Promise<sdk.ListCertificatesResult>
   listOutputs(userId: number, args: sdk.ListOutputsArgs): Promise<sdk.ListOutputsResult>

   insertCertificate(certificate: table.CertificateX): Promise<number>

   findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]>
   findOrInsertUser(identityKey: string) : Promise<{ user: table.User, isNew: boolean}>
   findOutputBaskets(args: sdk.FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
   findOutputs(args: sdk.FindOutputsArgs ): Promise<table.Output[]>

   relinquishCertificate(userId: number, args: sdk.RelinquishCertificateArgs) : Promise<number>
   relinquishOutput(userId: number, args: sdk.RelinquishOutputArgs) : Promise<number>
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