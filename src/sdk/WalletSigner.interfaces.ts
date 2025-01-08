import { sdk } from "..";

/**
 * Subset of `NinjaApi` interface and `NinjaBase` methods and properties that are required to support
 * the `NinjaWallet` implementation of the `Wallet.interface` API
 */
export interface WalletSigner {
  chain: sdk.Chain
  keyDeriver: sdk.KeyDeriverApi
  storageIdentity: StorageIdentity

  setServices(v: sdk.WalletServices) : void
  getServices() : sdk.WalletServices

  listActions(args: sdk.ListActionsArgs): Promise<sdk.ListActionsResult>
  listOutputs(args: sdk.ListOutputsArgs, knwonTxids: string[]): Promise<sdk.ListOutputsResult>
  createAction(args: sdk.CreateActionArgs): Promise<sdk.CreateActionResult>
  signAction(args: sdk.SignActionArgs): Promise<sdk.SignActionResult>
  abortAction(args: sdk.AbortActionArgs): Promise<sdk.AbortActionResult>
  internalizeAction(args: sdk.InternalizeActionArgs): Promise<sdk.InternalizeActionResult>
  relinquishOutput(args: sdk.RelinquishOutputArgs) : Promise<sdk.RelinquishOutputResult>

  acquireDirectCertificate(args: sdk.AcquireCertificateArgs) : Promise<sdk.AcquireCertificateResult>
  listCertificates(args: sdk.ListCertificatesArgs) : Promise<sdk.ListCertificatesResult>
  proveCertificate(args: sdk.ProveCertificateArgs): Promise<sdk.ProveCertificateResult>
  relinquishCertificate(args: sdk.RelinquishCertificateArgs): Promise<sdk.RelinquishCertificateResult>
  discoverByIdentityKey(args: sdk.DiscoverByIdentityKeyArgs): Promise<sdk.DiscoverCertificatesResult>
  discoverByAttributes(args: sdk.DiscoverByAttributesArgs): Promise<sdk.DiscoverCertificatesResult>

  getChain(): Promise<sdk.Chain>
  getClientChangeKeyPair(): KeyPair;
}

export interface KeyPair {
  privateKey: string
  publicKey: string
}

export interface StorageIdentity {
   /**
    * The identity key (public key) assigned to this storage
    */
   storageIdentityKey: string
   /**
    * The human readable name assigned to this storage.
    */
   storageName: string
}

export interface EntityTimeStamp {
    created_at: Date
    updated_at: Date
}
