import * as bsv from '@bsv/sdk'
import { sdk, table } from "..";

export interface SignerStorage {

   isAvailable() : boolean
   makeAvailable() : Promise<void>
   migrate(storageName: string): Promise<string>
   destroy(): Promise<void>

   setServices(v: sdk.WalletServices) : void
   getSettings(): table.Settings

   abortAction(identityKey: string, args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult>
   createAction(identityKey: string, args: sdk.CreateActionArgs): Promise<sdk.StorageCreateTransactionSdkResult>
   processAction(identityKey: string, args: sdk.StorageProcessActionArgs): Promise<sdk.StorageProcessActionSdkResults>
   internalizeAction(identityKey: string, sargs: sdk.StorageInternalizeActionArgs) : Promise<sdk.InternalizeActionResult>

   listActions(identityKey: string, args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult>
   listCertificates(identityKey: string, args: sdk.ListCertificatesArgs): Promise<sdk.ListCertificatesResult>
   listOutputs(identityKey: string, args: sdk.ListOutputsArgs): Promise<sdk.ListOutputsResult>

   insertCertificate(identityKey: string, certificate: table.CertificateX): Promise<number>

   findCertificates(identityKey: string, args: sdk.FindCertificatesArgs ): Promise<table.Certificate[]>
   findOrInsertUser(identityKey: string) : Promise<{ user: table.User, isNew: boolean}>
   findOutputBaskets(identityKey: string, args: sdk.FindOutputBasketsArgs ): Promise<table.OutputBasket[]>
   findOutputs(identityKey: string, args: sdk.FindOutputsArgs ): Promise<table.Output[]>

   relinquishCertificate(identityKey: string, args: sdk.RelinquishCertificateArgs) : Promise<number>
   relinquishOutput(identityKey: string, args: sdk.RelinquishOutputArgs) : Promise<number>
}