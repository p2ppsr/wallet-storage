import { sdk } from "..";

export interface KeyPairApi {
  privateKey: string
  publicKey: string
}

export interface StorageIdentityApi {
   /**
    * The identity key (public key) assigned to this storage
    */
   key: string
   /**
    * The human readable name assigned to this storage.
    */
   name?: string
}

/**
 * Subset of `NinjaApi` interface and `NinjaBase` methods and properties that are required to support
 * the `NinjaWallet` implementation of the `Wallet.interface` API
 */
export interface WalletSigner {
  chain?: sdk.Chain
  isAuthenticated(): boolean;
  getClientChangeKeyPair(): KeyPairApi;
  keyDeriver?: sdk.KeyDeriverApi
  storageIdentity?: StorageIdentityApi

  authenticate(identityKey?: string, addIfNew?: boolean): Promise<void>

  listActions(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
  listOutputs(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult>
  createActionSdk(vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult>
  signActionSdk(vargs: sdk.ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult>
  abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult>
  internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult>
  relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.RelinquishOutputResult>

  acquireCertificateSdk(vargs: sdk.ValidAcquireDirectCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.AcquireCertificateResult>
  listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.ListCertificatesResult>
  proveCertificateSdk(vargs: sdk.ValidProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ProveCertificateResult>
  relinquishCertificateSdk(vargs: sdk.ValidRelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishCertificateResult>
  discoverByIdentityKeySdk(vargs: sdk.ValidDiscoverByIdentityKeyArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult>
  discoverByAttributesSdk(vargs: sdk.ValidDiscoverByAttributesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult>

  getHeight(): Promise<number>
  getChain(): Promise<sdk.Chain>
  getHeaderForHeight(height: number): Promise<number[] | undefined>
}