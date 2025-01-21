import * as bsv from '@bsv/sdk'
import { sdk } from "../index.client";

/**
 * Subset of `NinjaApi` interface and `NinjaBase` methods and properties that are required to support
 * the `NinjaWallet` implementation of the `Wallet.interface` API
 */
export interface WalletSigner {
  chain: sdk.Chain
  keyDeriver: bsv.KeyDeriverApi

  setServices(v: sdk.WalletServices) : void
  getServices() : sdk.WalletServices
  getStorageIdentity(): StorageIdentity

  listActions(args: bsv.ListActionsArgs): Promise<bsv.ListActionsResult>
  listOutputs(args: bsv.ListOutputsArgs, knwonTxids: string[]): Promise<bsv.ListOutputsResult>
  createAction(args: bsv.CreateActionArgs): Promise<bsv.CreateActionResult>
  signAction(args: bsv.SignActionArgs): Promise<bsv.SignActionResult>
  abortAction(args: bsv.AbortActionArgs): Promise<bsv.AbortActionResult>
  internalizeAction(args: bsv.InternalizeActionArgs): Promise<bsv.InternalizeActionResult>
  relinquishOutput(args: bsv.RelinquishOutputArgs) : Promise<bsv.RelinquishOutputResult>

  acquireDirectCertificate(args: bsv.AcquireCertificateArgs) : Promise<bsv.AcquireCertificateResult>
  listCertificates(args: bsv.ListCertificatesArgs) : Promise<bsv.ListCertificatesResult>
  proveCertificate(args: bsv.ProveCertificateArgs): Promise<bsv.ProveCertificateResult>
  relinquishCertificate(args: bsv.RelinquishCertificateArgs): Promise<bsv.RelinquishCertificateResult>
  discoverByIdentityKey(args: bsv.DiscoverByIdentityKeyArgs): Promise<bsv.DiscoverCertificatesResult>
  discoverByAttributes(args: bsv.DiscoverByAttributesArgs): Promise<bsv.DiscoverCertificatesResult>

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
