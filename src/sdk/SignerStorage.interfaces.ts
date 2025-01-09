import * as bsv from '@bsv/sdk'
import { sdk, table } from "..";

/**
 * This is the `SignerStorage` interface implemented by a class such as `SignerStorage`,
 * which is implicitly authenticated by its identityKey constructor.
 */
export interface SignerStorage {

   isAvailable() : boolean
   makeAvailable() : Promise<void>
   migrate(storageName: string): Promise<string>
   destroy(): Promise<void>

   setServices(v: sdk.WalletServices) : void
   getServices() : sdk.WalletServices
   getSettings(): table.Settings

   getAuth() : Promise<sdk.AuthId>

   findOrInsertUser(identityKey: string) : Promise<{ user: table.User, isNew: boolean}>

   abortAction(args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult>
   createAction(args: sdk.CreateActionArgs): Promise<sdk.StorageCreateActionResult>
   processAction(args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults>
   internalizeAction(sargs: sdk.InternalizeActionArgs) : Promise<sdk.InternalizeActionResult>

   findCertificates(args: sdk.FindCertificatesArgs ): Promise<table.Certificate[]>
   findOutputBaskets(args: sdk.FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
   findOutputs(args: sdk.FindOutputsArgs ): Promise<table.Output[]>

   listActions(args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult>
   listCertificates(args: sdk.ListCertificatesArgs): Promise<sdk.ListCertificatesResult>
   listOutputs(args: sdk.ListOutputsArgs): Promise<sdk.ListOutputsResult>

   insertCertificate(certificate: table.CertificateX): Promise<number>

   relinquishCertificate(args: sdk.RelinquishCertificateArgs) : Promise<number>
   relinquishOutput(args: sdk.RelinquishOutputArgs) : Promise<number>
}

/**
 * This is the `SignerStorage` interface implemented with authentication checking and
 * is the actual interface implemented by storage and remoted storage providers.
 */
export interface SignerStorageAuth {
   isAvailable() : boolean
   makeAvailable() : Promise<void>
   migrate(storageName: string): Promise<string>
   destroy(): Promise<void>

   setServices(v: sdk.WalletServices) : void
   getServices() : sdk.WalletServices
   getSettings(): table.Settings

   findOrInsertUser(identityKey: string) : Promise<{ user: table.User, isNew: boolean}>
   findOrInsertSyncStateAuth(auth: sdk.AuthId, storageIdentityKey: string, storageName: string) : Promise<{ syncState: table.SyncState, isNew: boolean}>

   abortAction(auth: sdk.AuthId, args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult>
   createAction(auth: sdk.AuthId, args: sdk.CreateActionArgs): Promise<sdk.StorageCreateActionResult>
   processAction(auth: sdk.AuthId, args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionResults>
   internalizeAction(auth: sdk.AuthId, sargs: sdk.InternalizeActionArgs) : Promise<sdk.InternalizeActionResult>

   findCertificatesAuth(auth: sdk.AuthId, args: sdk.FindCertificatesArgs ): Promise<table.Certificate[]>
   findOutputBasketsAuth(auth: sdk.AuthId, args: sdk.FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
   findOutputsAuth(auth: sdk.AuthId, args: sdk.FindOutputsArgs ): Promise<table.Output[]>

   listActions(auth: sdk.AuthId, args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult>
   listCertificates(auth: sdk.AuthId, args: sdk.ListCertificatesArgs): Promise<sdk.ListCertificatesResult>
   listOutputs(auth: sdk.AuthId, args: sdk.ListOutputsArgs): Promise<sdk.ListOutputsResult>

   insertCertificateAuth(auth: sdk.AuthId, certificate: table.CertificateX): Promise<number>

   relinquishCertificate(auth: sdk.AuthId, args: sdk.RelinquishCertificateArgs) : Promise<number>
   relinquishOutput(auth: sdk.AuthId, args: sdk.RelinquishOutputArgs) : Promise<number>

   processSyncChunk(args: sdk.RequestSyncChunkArgs, chunk: sdk.SyncChunk) : Promise<sdk.ProcessSyncChunkResult>
}

export interface AuthId {
   identityKey: string
   userId?: number
}

export interface FindSincePagedArgs {
   since?: Date
   paged?: sdk.Paged
   trx?: sdk.TrxToken
}

export interface FindForUserSincePagedArgs extends FindSincePagedArgs {
   userId: number
}

export interface FindPartialSincePagedArgs<T extends object> extends FindSincePagedArgs {
   partial: Partial<T>
}

export interface FindCertificatesArgs extends FindSincePagedArgs {
   partial: Partial<table.Certificate>
   certifiers?: string[]
   types?: string[]
   includeFields?: boolean
}

export interface FindOutputBasketsArgs extends FindSincePagedArgs {
   partial: Partial<table.OutputBasket>
}

export interface FindOutputsArgs extends FindSincePagedArgs {
   partial: Partial<table.Output>
   noScript?: boolean
   txStatus?: sdk.TransactionStatus[]
}